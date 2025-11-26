import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { assertValidFarmArea } from "@agro/shared/validators/farm-area.validator";

import { SortBy } from "@/common/enums/enums";
import { Producer } from "@/modules/producers/entities/producer.entity";

import { CreateFarmDto, FarmResponseDto, UpdateFarmDto } from "./dto";
import { FarmHarvestCrop } from "./entities/farm-harvest-crop.entity";
import { Farm } from "./entities/farm.entity";

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
		@InjectRepository(FarmHarvestCrop)
		private readonly farmHarvestCropRepository: Repository<FarmHarvestCrop>,
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
	async create(createFarmDto: CreateFarmDto): Promise<FarmResponseDto> {
		const { name, city, state, totalArea, arableArea, vegetationArea, producerId } = createFarmDto;

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

		return this.mapToResponseDto(savedFarm);
	}

	/**
	 * Retrieves all farms from the database.
	 *
	 * @returns Array of all farms ordered by name
	 *
	 * @example
	 * ```typescript
	 * const farms = await service.findAll();
	 * console.log(`Found ${farms.length} farms`);
	 * ```
	 */
	async findAll(): Promise<Array<FarmResponseDto>> {
		const farms = await this.farmRepository.find({
			order: { name: SortBy.Ascending },
		});

		return farms.map((farm) => this.mapToResponseDto(farm));
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
	async findOne(id: string): Promise<FarmResponseDto> {
		const farm = await this.farmRepository.findOne({
			where: { id },
			relations: ["producer"],
		});

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
	async update(id: string, updateFarmDto: UpdateFarmDto): Promise<FarmResponseDto> {
		const farm = await this.farmRepository.findOne({ where: { id } });

		if (!farm) {
			throw new NotFoundException(`Farm with ID ${id} not found`);
		}

		if (updateFarmDto.producerId) {
			await this.verifyProducerExists(updateFarmDto.producerId);
		}

		try {
			assertValidFarmArea(
				(farm.totalArea || updateFarmDto.totalArea) ?? 0,
				(farm.arableArea || updateFarmDto.arableArea) ?? 0,
				(farm.vegetationArea || updateFarmDto.vegetationArea) ?? 0,
			);
		} catch (error) {
			throw new BadRequestException(error instanceof Error ? error.message : String(error));
		}

		Object.assign(farm, updateFarmDto);
		const updatedFarm = await this.farmRepository.save(farm);

		return this.mapToResponseDto(updatedFarm);
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
	async delete(id: string): Promise<void> {
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
	async findByProducer(producerId: string): Promise<Array<FarmResponseDto>> {
		const farms = await this.farmRepository.find({
			where: { producerId },
			order: { name: SortBy.Ascending },
		});

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
	async findByState(state: string): Promise<Array<FarmResponseDto>> {
		const farms = await this.farmRepository.find({
			where: { state },
			order: { name: SortBy.Ascending },
		});

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
	async getTotalArea(): Promise<number> {
		const result: { total: string } | undefined = await this.farmRepository
			.createQueryBuilder("farm")
			.select("SUM(farm.totalArea)", "total")
			.getRawOne();

		return Number.parseFloat(result?.total ?? "0") || 0;
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
	async countByState(): Promise<Array<{ state: string; count: number }>> {
		const results: Array<{ state: string; count: string }> = await this.farmRepository
			.createQueryBuilder("farm")
			.select("farm.state", "state")
			.addSelect("COUNT(farm.id)", "count")
			.groupBy("farm.state")
			.orderBy("count", "DESC")
			.getRawMany();

		return results.map((result) => ({
			state: result.state,
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
	async getLandUseStats(): Promise<{ arableArea: number; vegetationArea: number }> {
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
	 * //   { cropType: "Soja", count: 15 },
	 * //   { cropType: "Milho", count: 12 },
	 * //   { cropType: "Café", count: 8 }
	 * // ]
	 * ```
	 */
	async getCropsDistribution(): Promise<Array<{ cropType: string; count: number }>> {
		const results: Array<{ cropType: string; count: string }> = await this.farmHarvestCropRepository
			.createQueryBuilder("fhc")
			.innerJoin("fhc.farmHarvest", "fh")
			.select("fhc.cropType", "cropType")
			.addSelect("COUNT(DISTINCT fh.farmId)", "count")
			.groupBy("fhc.cropType")
			.orderBy("count", "DESC")
			.getRawMany();

		return results.map((result) => ({
			cropType: result.cropType,
			count: Number.parseInt(result.count, 10),
		}));
	}

	/**
	 * Verifies that a producer exists in the database.
	 *
	 * @param producerId - The UUID of the producer to verify
	 *
	 * @throws {NotFoundException} If the producer does not exist
	 *
	 * @private
	 */
	private async verifyProducerExists(producerId: string): Promise<void> {
		const producerExists = await this.producerRepository.exists({ where: { id: producerId } });

		if (!producerExists) {
			throw new NotFoundException(`Producer with ID ${producerId} not found`);
		}
	}

	/**
	 * Maps a Farm entity to a FarmResponseDto.
	 *
	 * @param farm - The farm entity to map
	 *
	 * @returns The mapped response DTO
	 *
	 * @private
	 */
	private mapToResponseDto(farm: Farm): FarmResponseDto {
		return {
			id: farm.id,
			name: farm.name,
			city: farm.city,
			state: farm.state,
			totalArea: farm.totalArea,
			arableArea: farm.arableArea,
			vegetationArea: farm.vegetationArea,
			producerId: farm.producerId,
			createdAt: farm.createdAt,
			updatedAt: farm.updatedAt,
		};
	}
}
