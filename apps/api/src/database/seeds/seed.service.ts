import { faker } from "@faker-js/faker/locale/pt_BR";
import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { DataSource } from "typeorm";

import { BrazilianState, generateDocument } from "@agro/shared/utils";

import { delay } from "@/common";
import { env } from "@/config/env.config";
import { createPinoConfig } from "@/config/logger.config";
import { City } from "@/modules/cities/entities/city.entity";
import { IbgeApiService } from "@/modules/cities/ibge-api.service";
import { FarmHarvestCrop } from "@/modules/farms/entities/farm-harvest-crop.entity";
import { FarmHarvest } from "@/modules/farms/entities/farm-harvest.entity";
import { Farm } from "@/modules/farms/entities/farm.entity";
import { Harvest } from "@/modules/farms/entities/harvest.entity";
import { Producer } from "@/modules/producers/entities/producer.entity";

import { SEED_SCALE_CONFIG } from "./seed.constants";
import { SeedUtilities } from "./seed.utilities";

/**
 * Database seeding service.
 *
 * Provides centralized control over all database seeding operations.
 * Seeds data in the correct dependency order:
 * 1. Cities (from IBGE API)
 * 2. Producers (Faker data)
 * 3. Farms (Faker data with real cities)
 * 4. Harvests and crops (Faker data)
 *
 * Each seeding phase includes idempotency checks to prevent duplicate data.
 *
 * @example
 * ```typescript
 * // In main.ts bootstrap function
 * const seedService = app.get(SeedService);
 * await seedService.seed();
 * ```
 */
@Injectable()
export class SeedService {
	/** Resolved seed configuration based on environment scale setting */
	private readonly seedConfig = SEED_SCALE_CONFIG[env.API__SEED_SCALE];

	constructor(
		private readonly dataSource: DataSource,
		private readonly seedUtilities: SeedUtilities,
		private readonly ibgeApiService: IbgeApiService,

		@InjectPinoLogger(SeedService.name)
		private readonly logger = new PinoLogger(createPinoConfig()),
	) {}

	/**
	 * Seeds the database with all application data if enabled.
	 *
	 * Orchestrates the complete seeding workflow:
	 * - Cities from IBGE API (Brazilian municipalities)
	 * - Producers with CPF/CNPJ
	 * - Farms with realistic areas
	 * - Harvests with crop associations
	 *
	 * @returns {Promise<void>}
	 */
	async seed(): Promise<void> {
		if (!env.API__SEED_DATABASE) {
			this.logger.info("Database seeding disabled via API__SEED_DATABASE=false");
			return;
		}

		if (!this.dataSource.isInitialized) {
			this.logger.warn("Database connection not initialized, skipping seeding");
			return;
		}

		try {
			this.logger.info("Starting database seeding");

			await this.seedCities();
			await this.seedProducers();
			await this.seedFarms();
			await this.seedHarvests();

			this.logger.info("Database seeding completed successfully");
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : String(error);

			this.logger.error({ error: errorMsg }, "Database seeding failed");

			throw error;
		}
	}

	/**
	 * Seeds Brazilian cities from IBGE API.
	 *
	 * Fetches all Brazilian municipalities and inserts them with IBGE codes.
	 * Includes idempotency check to skip if cities already exist.
	 *
	 * @returns {Promise<void>}
	 */
	private async seedCities(): Promise<void> {
		const cityRepository = this.dataSource.getRepository(City);
		const existingCount = await cityRepository.count();

		if (existingCount > 0) {
			this.logger.info(
				{ cityCount: existingCount },
				"Cities already seeded, skipping IBGE API fetch",
			);
			return;
		}

		this.logger.info("Fetching Brazilian cities from IBGE API");
		let totalCities = 0;

		for (const state of Object.values(BrazilianState)) {
			try {
				const cities = await this.ibgeApiService.fetchMunicipalitiesByState(state);
				const cityEntities = cities.map((city) =>
					cityRepository.create({
						name: city.nome,
						state,
						ibgeCode: city.id.toString(),
					}),
				);

				await cityRepository.save(cityEntities);
				totalCities += cities.length;

				// Hardcoded delay to avoid IBGE API rate limiting
				await delay(100);
			} catch (error) {
				this.logger.warn(
					{ state, error: error instanceof Error ? error.message : String(error) },
					"Failed to seed cities for state",
				);
			}
		}

		this.logger.info({ totalCities }, "Seeded cities from IBGE API");
	}

	/**
	 * Seeds producers with realistic CPF/CNPJ documents.
	 *
	 * Creates a mix of individual producers (CPF) and companies (CNPJ)
	 * with valid Brazilian document numbers.
	 *
	 * @returns {Promise<void>}
	 */
	private async seedProducers(): Promise<void> {
		const producerRepository = this.dataSource.getRepository(Producer);
		const existingCount = await producerRepository.count();

		if (existingCount > 0) {
			this.logger.info({ producerCount: existingCount }, "Producers already seeded, skipping");
			return;
		}

		this.logger.info("Creating producers");
		const producers: Array<Producer> = [];

		for (let index = 0; index < this.seedConfig.producers; index++) {
			const isCompany = faker.datatype.boolean({ probability: 0.3 });
			const document =
				isCompany ?
					generateDocument.cnpj({ formatted: true })
				:	generateDocument.cpf({ formatted: true });

			const producer = producerRepository.create({
				name: isCompany ? faker.company.name() : faker.person.fullName(),
				document,
			});

			producers.push(producer);
		}

		await producerRepository.save(producers);

		const cpfCount = producers.filter((producer) => producer.document.length === 11).length;
		const cnpjCount = producers.filter((producer) => producer.document.length === 14).length;

		this.logger.info({ producerCount: producers.length, cpfCount, cnpjCount }, "Created producers");
	}

	/**
	 * Seeds farms with realistic areas and locations.
	 *
	 * Creates farms with:
	 * - Valid total, arable, and vegetation areas
	 * - Real cities from the cities table
	 * - Weighted state distribution based on agricultural importance
	 *
	 * @returns {Promise<void>}
	 */
	private async seedFarms(): Promise<void> {
		const farmRepository = this.dataSource.getRepository(Farm);
		const existingCount = await farmRepository.count();

		if (existingCount > 0) {
			this.logger.info({ farmCount: existingCount }, "Farms already seeded, skipping");
			return;
		}

		this.logger.info("Creating farms");

		const producerRepository = this.dataSource.getRepository(Producer);
		const cityRepository = this.dataSource.getRepository(City);
		const producers = await producerRepository.find();
		const farms: Array<Farm> = [];

		for (let index = 0; index < this.seedConfig.farms; index++) {
			const producer = faker.helpers.arrayElement(producers);
			const state = this.seedUtilities.getWeightedRandomState();

			const cities = await cityRepository.find({ where: { state }, take: 100 });
			const city = faker.helpers.arrayElement(cities);

			const areas = this.seedUtilities.generateFarmAreas();

			const farm = farmRepository.create({
				name: `Fazenda ${faker.location.county()}`,
				city: city.name,
				state,
				totalArea: areas.totalArea,
				arableArea: areas.arableArea,
				vegetationArea: areas.vegetationArea,
				producerId: producer.id,
			});

			farms.push(farm);
		}

		await farmRepository.save(farms);

		const statesCount = new Set(farms.map((farm) => farm.state)).size;
		const totalHectares = farms.reduce((sum, farm) => sum + farm.totalArea, 0).toFixed(2);

		this.logger.info({ farmCount: farms.length, statesCount, totalHectares }, "Created farms");
	}

	/**
	 * Seeds harvests and crop associations.
	 *
	 * Creates:
	 * - Harvest years (last 3 years)
	 * - Farm-harvest associations
	 * - Crop type assignments per harvest
	 *
	 * @returns {Promise<void>}
	 */
	private async seedHarvests(): Promise<void> {
		const harvestRepository = this.dataSource.getRepository(Harvest);
		const existingCount = await harvestRepository.count();

		if (existingCount > 0) {
			this.logger.info({ harvestCount: existingCount }, "Harvests already seeded, skipping");
			return;
		}

		this.logger.info("Creating harvests");

		const farmRepository = this.dataSource.getRepository(Farm);
		const farmHarvestRepository = this.dataSource.getRepository(FarmHarvest);
		const farmHarvestCropRepository = this.dataSource.getRepository(FarmHarvestCrop);

		const harvests: Array<Harvest> = [];
		const currentYear = new Date().getFullYear();
		const startYear = currentYear - (this.seedConfig.harvestYears - 1);

		for (let year = startYear; year <= currentYear; year++) {
			const harvest = harvestRepository.create({
				year: String(year),
				description: `Safra ${String(year)}/${String(year + 1)}`,
			});

			harvests.push(harvest);
		}

		await harvestRepository.save(harvests);

		this.logger.info(
			{
				harvestCount: harvests.length,
				yearRange: `${String(harvests[0]?.year)} - ${String(harvests.at(-1)?.year)}`,
			},
			"Created harvests",
		);

		this.logger.info("Associating farms with harvests and crops");
		const farms = await farmRepository.find();
		let totalCrops = 0;

		for (const farm of farms) {
			const recentHarvests = faker.helpers.arrayElements(
				harvests,
				faker.number.int({ min: 1, max: harvests.length }),
			);

			for (const harvest of recentHarvests) {
				const farmHarvest = farmHarvestRepository.create({
					farmId: farm.id,
					harvestId: harvest.id,
				});

				await farmHarvestRepository.save(farmHarvest);

				const crops = this.seedUtilities.getRandomCropCombination();
				for (const cropType of crops) {
					const crop = farmHarvestCropRepository.create({
						farmHarvestId: farmHarvest.id,
						cropType,
					});

					await farmHarvestCropRepository.save(crop);
					totalCrops++;
				}
			}
		}

		this.logger.info({ cropAssociations: totalCrops }, "Created crop associations");
	}
}
