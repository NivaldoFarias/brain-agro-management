import { faker } from "@faker-js/faker";
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { BrazilianState, CropType, ParseUUIDPipe } from "@/common";

import { CreateFarmDto, FarmResponseDto, UpdateFarmDto } from "./dto";
import { FarmsService } from "./farms.service";

/**
 * Controller handling HTTP requests for farm management.
 *
 * Provides RESTful endpoints for CRUD operations on farms, along with
 * query endpoints for filtering and dashboard statistics. All endpoints
 * validate inputs using DTOs and return standardized response objects.
 *
 * ## Authentication
 * All endpoints will require JWT authentication in production.
 * Currently documented with @ApiBearerAuth for API specification.
 *
 * @example
 * ```typescript
 * // Usage in NestJS module
 * @Module({
 *   controllers: [FarmsController],
 *   providers: [FarmsService]
 * })
 * ```
 */
@ApiTags("Farms")
@ApiBearerAuth("JWT-auth")
@Controller("farms")
export class FarmsController {
	constructor(private readonly farmsService: FarmsService) {}

	/**
	 * Creates a new farm.
	 *
	 * Validates that the producer exists and that area constraints are met
	 * (arableArea + vegetationArea ≤ totalArea).
	 *
	 * @param createFarmDto - Farm data including name, location, areas, and producer ID
	 *
	 * @returns The created farm with generated ID and timestamps
	 *
	 * @throws {NotFoundException} If the producer does not exist
	 * @throws {BadRequestException} If area validation fails
	 */
	@Post()
	@ApiOperation({ summary: "Create a new farm" })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: "Farm created successfully",
		type: FarmResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: "Invalid input data or area constraints violated",
	})
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Producer not found" })
	create(@Body() createFarmDto: CreateFarmDto): Promise<FarmResponseDto> {
		return this.farmsService.create(createFarmDto);
	}

	/**
	 * Retrieves all farms with pagination.
	 *
	 * Returns farms ordered alphabetically by name.
	 * For now, ignores pagination params and returns all farms (assessment requirement).
	 *
	 * @returns Paginated farm response
	 */
	@Get()
	@ApiOperation({ summary: "Get all farms" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "List of farms",
		type: [FarmResponseDto],
	})
	async findAll(): Promise<{
		data: Array<FarmResponseDto>;
		total: number;
		page: number;
		limit: number;
	}> {
		const farms = await this.farmsService.findAll();
		return {
			data: farms,
			total: farms.length,
			page: 1,
			limit: farms.length,
		};
	}

	/**
	 * Retrieves a specific farm by ID.
	 *
	 * Includes the farm's associated producer information.
	 *
	 * @param id UUID of the farm to retrieve
	 *
	 * @returns The farm with the specified ID
	 *
	 * @throws {NotFoundException} If farm with the given ID does not exist
	 */
	@Get(":id")
	@ApiOperation({ summary: "Get farm by ID" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Farm found",
		type: FarmResponseDto,
	})
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Farm not found" })
	findOne(@Param("id", ParseUUIDPipe) id: string): Promise<FarmResponseDto> {
		return this.farmsService.findOne(id);
	}

	/**
	 * Retrieves farms by producer ID.
	 *
	 * Returns all farms owned by the specified producer.
	 *
	 * @param producerId UUID of the producer
	 *
	 * @returns Array of farms belonging to the producer
	 */
	@Get("producer/:producerId")
	@ApiOperation({ summary: "Get farms by producer" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "List of farms for the producer",
		type: [FarmResponseDto],
	})
	findByProducer(
		@Param("producerId", ParseUUIDPipe) producerId: string,
	): Promise<Array<FarmResponseDto>> {
		return this.farmsService.findByProducer(producerId);
	}

	/**
	 * Retrieves farms by Brazilian state.
	 *
	 * Filters farms by the two-letter state code (UF).
	 *
	 * @param state Two-letter Brazilian state code (e.g., "SP", "MG")
	 *
	 * @returns Array of farms in the specified state
	 */
	@Get("state/:state")
	@ApiOperation({ summary: "Get farms by state" })
	@ApiParam({
		name: "state",
		description: "Brazilian state code (UF)",
		example: BrazilianState.SP,
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "List of farms in the state",
		type: [FarmResponseDto],
	})
	findByState(@Param("state") state: string): Promise<Array<FarmResponseDto>> {
		return this.farmsService.findByState(state);
	}

	/**
	 * Updates an existing farm.
	 *
	 * Allows partial updates - only provided fields will be updated.
	 * Validates area constraints with the merged data.
	 *
	 * @param id UUID of the farm to update
	 * @param updateFarmDto Fields to update
	 *
	 * @returns The updated farm
	 *
	 * @throws {NotFoundException} If farm or new producer does not exist
	 * @throws {BadRequestException} If updated area constraints are violated
	 */
	@Patch(":id")
	@ApiOperation({ summary: "Update farm" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Farm updated successfully",
		type: FarmResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: "Invalid input data or area constraints violated",
	})
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Farm or producer not found" })
	update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateFarmDto: UpdateFarmDto,
	): Promise<FarmResponseDto> {
		return this.farmsService.update(id, updateFarmDto);
	}

	/**
	 * Deletes a farm.
	 *
	 * Also deletes all associated farm-harvest records due to CASCADE constraint.
	 *
	 * @param id UUID of the farm to delete
	 *
	 * @returns Void on successful deletion
	 *
	 * @throws {NotFoundException} If farm with the given ID does not exist
	 */
	@Delete(":id")
	@ApiOperation({ summary: "Delete farm" })
	@ApiResponse({ status: HttpStatus.OK, description: "Farm deleted successfully" })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Farm not found" })
	remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
		return this.farmsService.delete(id);
	}

	/**
	 * Calculates the total area of all farms.
	 *
	 * Dashboard endpoint that aggregates the sum of all farm areas.
	 *
	 * @returns Total area in hectares
	 */
	@Get("stats/total-area")
	@ApiOperation({ summary: "Get total area of all farms" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Total farm area in hectares",
		schema: {
			type: "number",
			example: faker.number.float({ min: 1000, max: 20_000, fractionDigits: 2 }),
		},
	})
	getTotalArea(): Promise<number> {
		return this.farmsService.getTotalArea();
	}

	/**
	 * Gets farm count grouped by state.
	 *
	 * Dashboard endpoint that returns the number of farms in each Brazilian state.
	 *
	 * @returns Array of objects with state and count
	 */
	@Get("stats/by-state")
	@ApiOperation({ summary: "Get farm count by state" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Farm count per state",
		schema: {
			type: "array",
			example: [
				{ state: BrazilianState.SP, count: 15 },
				{ state: BrazilianState.MG, count: 8 },
			],
		},
	})
	countByState(): Promise<Array<{ state: string; count: number }>> {
		return this.farmsService.countByState();
	}

	/**
	 * Gets land use statistics.
	 *
	 * Dashboard endpoint that returns the total arable and vegetation areas
	 * across all farms.
	 *
	 * @returns Object with arableArea and vegetationArea totals
	 */
	@Get("stats/land-use")
	@ApiOperation({ summary: "Get land use statistics" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Total arable and vegetation areas",
		schema: {
			type: "object",
			example: {
				arableArea: 5230.5,
				vegetationArea: 1847.2,
			},
		},
	})
	getLandUseStats(): Promise<{ arableArea: number; vegetationArea: number }> {
		return this.farmsService.getLandUseStats();
	}

	/**
	 * Gets crop distribution statistics.
	 *
	 * Dashboard endpoint that returns the count of farms growing each crop type.
	 * Used for the crops distribution pie chart on the dashboard.
	 *
	 * @returns Array of objects with crop type and farm count
	 */
	@Get("stats/crops-distribution")
	@ApiOperation({ summary: "Get crop distribution across farms" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Number of farms growing each crop type",
		schema: {
			type: "array",
			example: [
				{ cropType: CropType.Soy, count: 15 },
				{ cropType: CropType.Corn, count: 12 },
				{ cropType: CropType.Coffee, count: 8 },
			],
		},
	})
	getCropsDistribution(): Promise<Array<{ cropType: string; count: number }>> {
		return this.farmsService.getCropsDistribution();
	}
}
