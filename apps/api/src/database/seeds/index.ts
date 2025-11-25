/**
 * Database seed script for generating realistic Brazilian agricultural data.
 *
 * Generates:
 * - 15 rural producers (mix of CPF and CNPJ)
 * - 40 farms across Brazilian states
 * - Multiple harvests per farm
 * - Diverse crop distribution
 *
 * @module DatabaseSeeds
 */

import { createLogger, LogLevel, RuntimeEnvironment } from "@agro/shared/utils";
import { faker } from "@faker-js/faker/locale/pt_BR";
import { DataSource } from "typeorm";

import { AppDataSource } from "@/database/data-source";
import { BrazilianState, CropType } from "@/database/entities/enums";
import { FarmHarvestCrop } from "@/database/entities/farm-harvest-crop.entity";
import { FarmHarvest } from "@/database/entities/farm-harvest.entity";
import { Farm } from "@/database/entities/farm.entity";
import { Harvest } from "@/database/entities/harvest.entity";
import { Producer } from "@/database/entities/producer.entity";

const logger = createLogger({
	name: "seed",
	level: LogLevel.Info,
	environment: RuntimeEnvironment.Test,
	logToConsole: true,
});

/**
 * Brazilian states distribution weights for realistic farm locations.
 * Based on agricultural importance in Brazil.
 *
 * Major agricultural states (MT, PR, RS) have higher weights,
 * reflecting real-world crop production distribution.
 */
const STATE_WEIGHTS: Record<BrazilianState, number> = {
	[BrazilianState.MT]: 0.15,
	[BrazilianState.PR]: 0.12,
	[BrazilianState.RS]: 0.12,
	[BrazilianState.GO]: 0.1,
	[BrazilianState.MS]: 0.08,
	[BrazilianState.SP]: 0.08,
	[BrazilianState.MG]: 0.07,
	[BrazilianState.BA]: 0.06,
	[BrazilianState.SC]: 0.05,
	[BrazilianState.MA]: 0.04,
	[BrazilianState.TO]: 0.03,
	[BrazilianState.PI]: 0.03,
	[BrazilianState.PA]: 0.02,
	[BrazilianState.RO]: 0.02,
	[BrazilianState.CE]: 0.01,
	[BrazilianState.PE]: 0.01,
	[BrazilianState.SE]: 0.005,
	[BrazilianState.AL]: 0.005,
	[BrazilianState.RN]: 0.005,
	[BrazilianState.PB]: 0.005,
	[BrazilianState.ES]: 0.005,
	[BrazilianState.RJ]: 0.005,
	[BrazilianState.DF]: 0.003,
	[BrazilianState.AM]: 0.002,
	[BrazilianState.AC]: 0.001,
	[BrazilianState.RR]: 0.001,
	[BrazilianState.AP]: 0.001,
};

/**
 * Crop combinations that commonly appear together in Brazilian farms.
 */
const CROP_COMBINATIONS = [
	[CropType.SOJA, CropType.MILHO],
	[CropType.SOJA],
	[CropType.MILHO],
	[CropType.ALGODAO, CropType.SOJA],
	[CropType.CAFE],
	[CropType.CANA_DE_ACUCAR],
	[CropType.SOJA, CropType.MILHO, CropType.ALGODAO],
];

if (import.meta.main) {
	await main();
}

/**
 * Generates a weighted random Brazilian state based on agricultural importance.
 *
 * @returns {BrazilianState} A randomly selected state
 */
function getWeightedRandomState(): BrazilianState {
	const random = Math.random();
	let cumulative = 0;

	for (const [state, weight] of Object.entries(STATE_WEIGHTS)) {
		cumulative += weight;
		if (random <= cumulative) {
			return state as BrazilianState;
		}
	}

	return BrazilianState.MT;
}

/**
 * Generates realistic farm areas ensuring agricultável + vegetação ≤ total.
 *
 * @returns {Object} Farm areas with total, agricultável, and vegetação in hectares
 */
function generateFarmAreas(): {
	totalArea: number;
	arableArea: number;
	vegetationArea: number;
} {
	const totalArea = faker.number.float({ min: 10, max: 5000, fractionDigits: 2 });
	const arablePercentage = faker.number.float({ min: 0.3, max: 0.85, fractionDigits: 2 });
	const arableArea = Number((totalArea * arablePercentage).toFixed(2));
	const remainingArea = totalArea - arableArea;
	const vegetationArea = Number(
		(remainingArea * faker.number.float({ min: 0.15, max: 0.95, fractionDigits: 2 })).toFixed(2),
	);

	return { totalArea, arableArea, vegetationArea };
}

/**
 * Generates a random crop combination for a harvest.
 *
 * @returns {CropType[]} Array of crop types
 */
function getRandomCropCombination(): Array<CropType> {
	return faker.helpers.arrayElement(CROP_COMBINATIONS);
}

/**
 * Seeds the database with realistic agricultural data.
 *
 * @param {DataSource} connection - TypeORM data source connection
 * @returns {Promise<void>}
 */
async function seedDatabase(connection: DataSource): Promise<void> {
	logger.info("🌱 Starting database seeding...");

	const producerRepository = connection.getRepository(Producer);
	const farmRepository = connection.getRepository(Farm);
	const harvestRepository = connection.getRepository(Harvest);
	const farmHarvestRepository = connection.getRepository(FarmHarvest);
	const farmHarvestCropRepository = connection.getRepository(FarmHarvestCrop);

	const producers: Array<Producer> = [];
	const farms: Array<Farm> = [];
	const harvests: Array<Harvest> = [];

	logger.info("👨‍🌾 Creating producers...");
	for (let index = 0; index < 15; index++) {
		const isCompany = faker.datatype.boolean({ probability: 0.3 });

		/**
		 * Generate valid document numbers.
		 * CPF: 11 digits for individuals
		 * CNPJ: 14 digits for companies
		 */
		const document =
			isCompany ?
				faker.string.numeric({ length: 14, allowLeadingZeros: true })
			:	faker.string.numeric({ length: 11, allowLeadingZeros: true });

		const producer = producerRepository.create({
			name: isCompany ? faker.company.name() : faker.person.fullName(),
			document,
		});

		producers.push(producer);
	}

	await producerRepository.save(producers);

	const cpfCount = producers.filter((producer) => producer.document.length === 11).length;
	const cnpjCount = producers.filter((producer) => producer.document.length === 14).length;

	logger.info({ producerCount: producers.length, cpfCount, cnpjCount }, "✅ Created producers");

	logger.info("🏞️  Creating farms...");
	for (let index = 0; index < 40; index++) {
		const producer = faker.helpers.arrayElement(producers);
		const areas = generateFarmAreas();
		const state = getWeightedRandomState();

		const farm = farmRepository.create({
			name: `Fazenda ${faker.location.county()}`,
			city: faker.location.city(),
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
	logger.info({ farmCount: farms.length, statesCount }, "✅ Created farms");

	logger.info("📅 Creating harvests...");
	const currentYear = new Date().getFullYear();
	for (let year = currentYear - 2; year <= currentYear; year++) {
		const harvest = harvestRepository.create({
			year: String(year),
			description: `Safra ${String(year)}/${String(year + 1)}`,
		});

		harvests.push(harvest);
	}

	await harvestRepository.save(harvests);

	logger.info(
		{
			harvestCount: harvests.length,
			yearRange: `${String(harvests[0]?.year)} - ${String(harvests.at(-1)?.year)}`,
		},
		"✅ Created harvests",
	);

	logger.info("🌾 Associating farms with harvests and crops...");
	let totalCrops = 0;

	for (const farm of farms) {
		const recentHarvests = faker.helpers.arrayElements(
			harvests,
			faker.number.int({ min: 1, max: harvests.length }),
		);

		for (const harvest of recentHarvests) {
			const farmHarvest = farmHarvestRepository.create({ farmId: farm.id, harvestId: harvest.id });

			await farmHarvestRepository.save(farmHarvest);

			const crops = getRandomCropCombination();
			for (const cropType of crops) {
				const crop = farmHarvestCropRepository.create({ farmHarvestId: farmHarvest.id, cropType });

				await farmHarvestCropRepository.save(crop);
				totalCrops++;
			}
		}
	}

	logger.info({ cropAssociations: totalCrops }, "✅ Created crop associations");

	const stats = {
		producers: producers.length,
		farms: farms.length,
		harvests: harvests.length,
		cropAssociations: totalCrops,
		totalHectares: farms.reduce((sum, farm) => sum + farm.totalArea, 0).toFixed(2),
		statesRepresented: new Set(farms.map((farm) => farm.state)).size,
	};

	logger.info(stats, "✨ Seeding completed successfully!");
}

/**
 * Main execution function with error handling.
 */
async function main(): Promise<void> {
	let connection: DataSource | undefined;

	try {
		logger.info("🔌 Connecting to database...");
		connection = await AppDataSource.initialize();

		await seedDatabase(connection);
	} catch (error) {
		logger.error({ error }, "❌ Seeding failed");
		throw error;
	} finally {
		if (connection?.isInitialized) {
			await connection.destroy();
		}
	}
}
