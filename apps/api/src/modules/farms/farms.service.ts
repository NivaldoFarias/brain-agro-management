import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectPinoLogger } from "nestjs-pino";
import { Repository } from "typeorm";

import type { PinoLogger } from "nestjs-pino";

import type { CropDistribution, StateDistribution } from "@agro/shared/types";
import type { BrazilianState, CropType } from "@agro/shared/utils";

import { OrderBy } from "@agro/shared/utils";
import { assertValidFarmArea } from "@agro/shared/validators";

import { Producer } from "@/modules/producers/entities/";

import { CreateFarmDto, FarmResponseDto, UpdateFarmDto } from "./dto";
import { Farm, FarmHarvest, FarmHarvestCrop, Harvest } from "./entities/";

/**
 * Service responsible for farm business logic and data operations.
 *
 * Handles CRUD operations for farms with comprehensive validation of area
 * constraints and producer relationships. Uses TypeORM's Data Mapper pattern
 * with repository injection for database access.
 *
 * @example
 * ```typescript
 * // In a controller
 * constructor(private readonly farmsService: FarmsService) {}
 *
 * async create(dto: CreateFarmDto) {
 *   return this.farmsService.create(dto);
 * }
 * ```
 */
@Injectable()
export class FarmsService {
	/**
	 * Creates an instance of FarmsService.
	 *
	 * @param farmRepository TypeORM repository for Farm entity
	 * @param producerRepository TypeORM repository for Producer entity
	 */
	constructor(
		@InjectRepository(Farm)
		private readonly farmRepository: Repository<Farm>,

		@InjectRepository(Producer)
		private readonly producerRepository: Repository<Producer>,

		@InjectRepository(Harvest)
		private readonly harvestRepository: Repository<Harvest>,

		@InjectRepository(FarmHarvest)
		private readonly farmHarvestRepository: Repository<FarmHarvest>,

		@InjectRepository(FarmHarvestCrop)
		private readonly farmHarvestCropRepository: Repository<FarmHarvestCrop>,

		@InjectPinoLogger(FarmsService.name)
		private readonly logger: PinoLogger,
	) {}

	/**
	 * Creates a new farm.
	 *
	 * ## Workflow
	 * 1. Validates that the producer exists
	 * 2. Validated that the farm area constraints are met (arableArea + vegetationArea ≤ totalArea)
	 * 3. Creates and saves the farm entity
	 *
	 * @param createFarmDto The farm data to create
	 *
	 * @returns The created farm
	 *
	 * @throws {NotFoundException} If the producer does not exist
	 * @throws {BadRequestException} If area validation fails
	 *
	 * @example
	 * ```typescript
	 * const farm = await service.create({
	 *   name: "Fazenda Boa Vista",
	 *   city: "Campinas",
	 *   state: BrazilianState.SP,
	 *   totalArea: 100.5,
	 *   arableArea: 70.0,
	 *   vegetationArea: 25.0,
	 *   producerId: "550e8400-e29b-41d4-a716-446655440000",
	 * });
	 * ```
	 */
	public async create(createFarmDto: CreateFarmDto): Promise<FarmResponseDto> {
		const { name, city, state, totalArea, arableArea, vegetationArea, producerId, crops } =
			createFarmDto;

		await this.verifyProducerExists(producerId);

		try {
			assertValidFarmArea(totalArea, arableArea, vegetationArea);
		} catch (error) {
			throw new BadRequestException(error instanceof Error ? error.message : String(error));
		}

		const farm = this.farmRepository.create({
			name,
			city,
			state,
			totalArea,
			arableArea,
			vegetationArea,
			producerId,
		});

		const savedFarm = await this.farmRepository.save(farm);

		if (crops != null && crops.length > 0) {
			await this.associateCropsWithFarm(savedFarm.id, crops);
		}

		const farmWithRelations = await this.farmRepository.findOne({
			where: { id: savedFarm.id },
			relations: { farmHarvests: { crops: true } },
		});

		return this.mapToResponseDto(farmWithRelations ?? savedFarm);
	}

	/**
	 * Retrieves paginated farms from the database.
	 *
	 * @param page Page number (1-indexed)
	 * @param limit Number of items per page
	 *
	 * @returns Object containing paginated farms and total count
	 *
	 * @example
	 * ```typescript
	 * const { data, total } = await service.findAll(1, 10);
	 * console.log(`Page 1: ${data.length} farms of ${total} total`);
	 * ```
	 */
	public async findAll(
		page = 1,
		limit = 10,
	): Promise<{ data: Array<FarmResponseDto>; total: number }> {
		const skip = (page - 1) * limit;

		const [farms, total] = await this.farmRepository.findAndCount({
			relations: { farmHarvests: { crops: true } },
			order: { name: OrderBy.Ascending },
			skip,
			take: limit,
		});

		return {
			data: farms.map((farm) => this.mapToResponseDto(farm)),
			total,
		};
	}

	/**
	 * Retrieves a single farm by ID.
	 *
	 * @param id The UUID of the farm to retrieve
	 *
	 * @returns The farm with the specified ID
	 *
	 * @throws {NotFoundException} If the farm does not exist
	 *
	 * @example
	 * ```typescript
	 * const farm = await service.findOne("770e9600-g40d-63f6-c938-668877662222");
	 * ```
	 */
	public async findOne(id: string): Promise<FarmResponseDto> {
		const farm = await this.farmRepository
			.createQueryBuilder("farm")
			.leftJoinAndSelect("farm.farmHarvests", "farmHarvest")
			.leftJoinAndSelect("farmHarvest.crops", "crop")
			.where("farm.id = :id", { id })
			.getOne();

		if (!farm) {
			throw new NotFoundException(`Farm with ID ${id} not found`);
		}

		return this.mapToResponseDto(farm);
	}

	/**
	 * Updates an existing farm.
	 *
	 * Allows partial updates - only provided fields will be updated.
	 * If area fields are being updated, validates the new area constraints.
	 * If producerId is being updated, verifies the new producer exists.
	 *
	 * @param id The UUID of the farm to update
	 * @param updateFarmDto The fields to update
	 *
	 * @returns The updated farm
	 *
	 * @throws {NotFoundException} If the farm or new producer does not exist
	 * @throws {BadRequestException} If new area validation fails
	 *
	 * @example
	 * ```typescript
	 * const updated = await service.update(
	 *   "770e9600-g40d-63f6-c938-668877662222",
	 *   { name: "Fazenda Boa Vista II", totalArea: 120.0 }
	 * );
	 * ```
	 */
	public async update(id: string, updateFarmDto: UpdateFarmDto): Promise<FarmResponseDto> {
		const farm = await this.farmRepository.findOne({ where: { id } });

		if (!farm) {
			throw new NotFoundException(`Farm with ID ${id} not found`);
		}

		if (updateFarmDto.producerId) {
			await this.verifyProducerExists(updateFarmDto.producerId);
		}

		try {
			assertValidFarmArea(
				updateFarmDto.totalArea ?? farm.totalArea,
				updateFarmDto.arableArea ?? farm.arableArea,
				updateFarmDto.vegetationArea ?? farm.vegetationArea,
			);
		} catch (error) {
			throw new BadRequestException(error instanceof Error ? error.message : String(error));
		}

		const { crops, ...farmData } = updateFarmDto;

		Object.assign(farm, farmData);
		const updatedFarm = await this.farmRepository.save(farm);

		if (crops !== undefined) {
			await this.updateFarmCrops(id, crops);
		}

		const farmWithRelations = await this.farmRepository.findOne({
			where: { id },
			relations: { farmHarvests: { crops: true } },
		});

		return this.mapToResponseDto(farmWithRelations ?? updatedFarm);
	}

	/**
	 * Deletes a farm by ID.
	 *
	 * Note: This will also cascade delete all associated farm-harvest and
	 * farm-harvest-crop records due to database foreign key constraints.
	 *
	 * @param id - The UUID of the farm to delete
	 *
	 * @throws {NotFoundException} If the farm does not exist
	 *
	 * @example
	 * ```typescript
	 * await service.delete("770e9600-g40d-63f6-c938-668877662222");
	 * ```
	 */
	public async delete(id: string): Promise<void> {
		const result = await this.farmRepository.delete(id);

		if (result.affected === 0) {
			throw new NotFoundException(`Farm with ID ${id} not found`);
		}
	}

	/**
	 * Retrieves all farms owned by a specific producer.
	 *
	 * @param producerId The UUID of the producer
	 *
	 * @returns Array of farms owned by the producer
	 *
	 * @example
	 * ```typescript
	 * const farms = await service.findByProducer("550e8400-e29b-41d4-a716-446655440000");
	 * ```
	 */
	public async findByProducer(producerId: string): Promise<Array<FarmResponseDto>> {
		const farms = await this.farmRepository
			.createQueryBuilder("farm")
			.leftJoinAndSelect("farm.farmHarvests", "farmHarvest")
			.leftJoinAndSelect("farmHarvest.crops", "crop")
			.where("farm.producerId = :producerId", { producerId })
			.orderBy("farm.name", OrderBy.Ascending)
			.getMany();

		return farms.map((farm) => this.mapToResponseDto(farm));
	}

	/**
	 * Retrieves all farms in a specific Brazilian state.
	 *
	 * @param state The Brazilian state code (e.g., "SP", "MG")
	 *
	 * @returns Array of farms in the specified state
	 *
	 * @example
	 * ```typescript
	 * const farms = await service.findByState(BrazilianState.SP);
	 * ```
	 */
	public async findByState(state: string): Promise<Array<FarmResponseDto>> {
		const farms = await this.farmRepository
			.createQueryBuilder("farm")
			.leftJoinAndSelect("farm.farmHarvests", "farmHarvest")
			.leftJoinAndSelect("farmHarvest.crops", "crop")
			.where("farm.state = :state", { state })
			.orderBy("farm.name", OrderBy.Ascending)
			.getMany();

		return farms.map((farm) => this.mapToResponseDto(farm));
	}

	/**
	 * Calculates the total area (in hectares) of all farms.
	 *
	 * @returns The sum of all farm total areas
	 *
	 * @example
	 * ```typescript
	 * const totalHectares = await service.getTotalArea();
	 * console.log(`Total: ${totalHectares} hectares`);
	 * ```
	 */
	public async getTotalArea(): Promise<number> {
		const result: { total: string } | undefined = await this.farmRepository
			.createQueryBuilder("farm")
			.select("SUM(farm.totalArea)", "total")
			.getRawOne();

		return Number.parseFloat(result?.total ?? "0") || 0;
	}

	/**
	 * Counts the total number of farms.
	 *
	 * @returns Total count of farms
	 */
	public async getTotalCount(): Promise<number> {
		const result: { count: string } | undefined = await this.farmRepository
			.createQueryBuilder("farm")
			.select("COUNT(farm.id)", "count")
			.getRawOne();

		return Number.parseInt(result?.count ?? "0", 10) || 0;
	}

	/**
	 * Counts farms grouped by Brazilian state.
	 *
	 * @returns Array of objects containing state code and farm count
	 *
	 * @example
	 * ```typescript
	 * const byState = await service.countByState();
	 * // Returns: [{ state: "SP", count: 15 }, { state: "MG", count: 8 }, ...]
	 * ```
	 */
	public async countByState(): Promise<Array<StateDistribution>> {
		const results: Array<{ state: string; count: string }> = await this.farmRepository
			.createQueryBuilder("farm")
			.select("farm.state", "state")
			.addSelect("COUNT(farm.id)", "count")
			.groupBy("farm.state")
			.orderBy("count", OrderBy.Descending)
			.getRawMany();

		return results.map((result) => ({
			state: result.state as BrazilianState,
			count: Number.parseInt(result.count, 10),
		}));
	}

	/**
	 * Calculates land use statistics across all farms.
	 *
	 * @returns Object containing total arable and vegetation areas
	 *
	 * @example
	 * ```typescript
	 * const landUse = await service.getLandUseStats();
	 * // Returns: { arableArea: 5230.5, vegetationArea: 1847.2 }
	 * ```
	 */
	public async getLandUseStats(): Promise<{ arableArea: number; vegetationArea: number }> {
		const result: { arableArea: string; vegetationArea: string } | undefined =
			await this.farmRepository
				.createQueryBuilder("farm")
				.select("SUM(farm.arableArea)", "arableArea")
				.addSelect("SUM(farm.vegetationArea)", "vegetationArea")
				.getRawOne();

		return {
			arableArea: Number.parseFloat(result?.arableArea ?? "0") || 0,
			vegetationArea: Number.parseFloat(result?.vegetationArea ?? "0") || 0,
		};
	}

	/**
	 * Gets crop distribution statistics across all farms.
	 *
	 * Counts the number of unique farms growing each crop type by aggregating
	 * farm-harvest-crop associations. This provides data for the dashboard
	 * crops distribution pie chart.
	 *
	 * ## Implementation Details
	 * - Uses DISTINCT farm_harvest.farm_id to count unique farms per crop
	 * - Joins through farm_harvest to access farm relationships
	 * - Groups by crop_type to aggregate counts
	 *
	 * @returns Array of objects with crop type and count of farms growing it
	 *
	 * @example
	 * ```typescript
	 * const distribution = await service.getCropsDistribution();
	 * // Returns: [
	 * //   { cropType: "soy", count: 15 },
	 * //   { cropType: "corn", count: 12 },
	 * //   { cropType: "coffee", count: 8 }
	 * // ]
	 * ```
	 */
	public async getCropsDistribution(): Promise<Array<CropDistribution>> {
		const results: Array<{ cropType: string; count: string }> = await this.farmHarvestCropRepository
			.createQueryBuilder("fhc")
			.innerJoin("fhc.farmHarvest", "fh")
			.select("fhc.cropType", "cropType")
			.addSelect("COUNT(DISTINCT fh.farmId)", "count")
			.groupBy("fhc.cropType")
			.orderBy("count", OrderBy.Descending)
			.getRawMany();

		return results.map((result) => {
			return {
				cropType: result.cropType as CropType,
				count: Number.parseInt(result.count, 10),
			};
		});
	}

	/**
	 * Verifies that a producer exists in the database.
	 *
	 * @param producerId The UUID of the producer to verify
	 *
	 * @throws {NotFoundException} If the producer does not exist
	 */
	private async verifyProducerExists(producerId: string): Promise<void> {
		const producerExists = await this.producerRepository.exists({ where: { id: producerId } });

		if (!producerExists) {
			throw new NotFoundException(`Producer with ID ${producerId} not found`);
		}
	}

	/**
	 * Gets or creates the current harvest year.
	 *
	 * Creates a harvest record for the current year if it doesn't exist.
	 * This is used as the default harvest for new farms.
	 *
	 * @returns The current harvest entity
	 */
	private async getCurrentHarvest(): Promise<Harvest> {
		const currentYear = new Date().getFullYear();
		const yearStr = String(currentYear);

		let harvest = await this.harvestRepository.findOne({ where: { year: yearStr } });

		if (!harvest) {
			this.logger.info({ year: yearStr }, "Creating harvest for current year");

			harvest = this.harvestRepository.create({
				year: yearStr,
				description: `Safra ${yearStr}/${String(currentYear + 1)}`,
			});

			await this.harvestRepository.save(harvest);
		}

		return harvest;
	}

	/**
	 * Associates crops with a farm through the current harvest.
	 *
	 * Creates FarmHarvest and FarmHarvestCrop records to link the farm
	 * with the specified crop types.
	 *
	 * @param farmId The UUID of the farm
	 * @param crops Array of crop types to associate
	 */
	private async associateCropsWithFarm(farmId: string, crops: Array<CropType>): Promise<void> {
		const harvest = await this.getCurrentHarvest();

		let farmHarvest = await this.farmHarvestRepository.findOne({
			where: { farmId, harvestId: harvest.id },
		});

		if (!farmHarvest) {
			farmHarvest = this.farmHarvestRepository.create({
				farmId,
				harvestId: harvest.id,
			});

			await this.farmHarvestRepository.save(farmHarvest);
		}

		const cropEntities = crops.map((cropType) =>
			this.farmHarvestCropRepository.create({
				farmHarvestId: farmHarvest.id,
				cropType,
			}),
		);

		await this.farmHarvestCropRepository.save(cropEntities);

		this.logger.info(
			{ farmId, harvestId: harvest.id, cropCount: crops.length },
			"Associated crops with farm",
		);
	}

	/**
	 * Updates crops for a farm in the current harvest.
	 *
	 * Removes existing crop associations for the current harvest and creates
	 * new ones based on the provided crop types.
	 *
	 * @param farmId The UUID of the farm
	 * @param crops Array of crop types (empty array removes all crops)
	 */
	private async updateFarmCrops(farmId: string, crops: Array<CropType>): Promise<void> {
		const harvest = await this.getCurrentHarvest();

		const farmHarvest = await this.farmHarvestRepository.findOne({
			where: { farmId, harvestId: harvest.id },
			relations: { crops: true },
		});

		if (farmHarvest) {
			if (farmHarvest.crops.length > 0) {
				await this.farmHarvestCropRepository.remove(farmHarvest.crops);
			}

			if (crops.length > 0) {
				const cropEntities = crops.map((cropType) =>
					this.farmHarvestCropRepository.create({
						farmHarvestId: farmHarvest.id,
						cropType,
					}),
				);

				await this.farmHarvestCropRepository.save(cropEntities);
			}
		} else if (crops.length > 0) {
			await this.associateCropsWithFarm(farmId, crops);
		}

		this.logger.info(
			{ farmId, harvestId: harvest.id, cropCount: crops.length },
			"Updated farm crops",
		);
	}

	/**
	 * Maps a Farm entity to a FarmResponseDto.
	 *
	 * Extracts unique crop types from all farm harvests and flattens them
	 * into a single array of crop types for the response.
	 *
	 * @param farm The farm entity to map (with eagerly loaded farmHarvests and crops)
	 *
	 * @returns The mapped response DTO with flattened crops array
	 */
	private mapToResponseDto(
		farm:
			| Farm
			| (Omit<Farm, "farmHarvests"> & {
					farmHarvests?: Array<{ crops?: Array<{ cropType?: CropType }> }>;
			  }),
	): FarmResponseDto {
		const crops: Array<string> = [];

		if (Array.isArray(farm.farmHarvests)) {
			for (const farmHarvest of farm.farmHarvests) {
				const harvestCrops = Array.isArray(farmHarvest.crops) ? farmHarvest.crops : [];

				for (const crop of harvestCrops) {
					if (!crop.cropType || crops.includes(crop.cropType)) continue;

					crops.push(crop.cropType);
				}
			}
		}

		return {
			id: farm.id,
			name: farm.name,
			city: farm.city,
			state: farm.state,
			totalArea: farm.totalArea,
			arableArea: farm.arableArea,
			vegetationArea: farm.vegetationArea,
			producerId: farm.producerId,
			crops,
			createdAt: farm.createdAt,
			updatedAt: farm.updatedAt,
		};
	}
}
