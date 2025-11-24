import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateFarmDto, FarmResponseDto, UpdateFarmDto } from "./dto";
import { FarmsService } from "./farms.service";

/**
 * Controller handling HTTP requests for farm management.
 *
 * Provides RESTful endpoints for CRUD operations on farms, along with
 * query endpoints for filtering and dashboard statistics. All endpoints
 * validate inputs using DTOs and return standardized response objects.
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
		status: 201,
		description: "Farm created successfully",
		type: FarmResponseDto,
	})
	@ApiResponse({ status: 400, description: "Invalid input data or area constraints violated" })
	@ApiResponse({ status: 404, description: "Producer not found" })
	create(@Body() createFarmDto: CreateFarmDto): Promise<FarmResponseDto> {
		return this.farmsService.create(createFarmDto);
	}

	/**
	 * Retrieves all farms.
	 *
	 * Returns farms ordered alphabetically by name.
	 *
	 * @returns Array of all farms
	 */
	@Get()
	@ApiOperation({ summary: "Get all farms" })
	@ApiResponse({
		status: 200,
		description: "List of farms",
		type: [FarmResponseDto],
	})
	findAll(): Promise<FarmResponseDto[]> {
		return this.farmsService.findAll();
	}

	/**
	 * Retrieves a specific farm by ID.
	 *
	 * Includes the farm's associated producer information.
	 *
	 * @param id - UUID of the farm to retrieve
	 *
	 * @returns The farm with the specified ID
	 *
	 * @throws {NotFoundException} If farm with the given ID does not exist
	 */
	@Get(":id")
	@ApiOperation({ summary: "Get farm by ID" })
	@ApiResponse({
		status: 200,
		description: "Farm found",
		type: FarmResponseDto,
	})
	@ApiResponse({ status: 404, description: "Farm not found" })
	findOne(@Param("id") id: string): Promise<FarmResponseDto> {
		return this.farmsService.findOne(id);
	}

	/**
	 * Retrieves farms by producer ID.
	 *
	 * Returns all farms owned by the specified producer.
	 *
	 * @param producerId - UUID of the producer
	 *
	 * @returns Array of farms belonging to the producer
	 */
	@Get("producer/:producerId")
	@ApiOperation({ summary: "Get farms by producer" })
	@ApiResponse({
		status: 200,
		description: "List of farms for the producer",
		type: [FarmResponseDto],
	})
	findByProducer(@Param("producerId") producerId: string): Promise<FarmResponseDto[]> {
		return this.farmsService.findByProducer(producerId);
	}

	/**
	 * Retrieves farms by Brazilian state.
	 *
	 * Filters farms by the two-letter state code (UF).
	 *
	 * @param state - Two-letter Brazilian state code (e.g., "SP", "MG")
	 *
	 * @returns Array of farms in the specified state
	 */
	@Get("state/:state")
	@ApiOperation({ summary: "Get farms by state" })
	@ApiQuery({ name: "state", description: "Brazilian state code (UF)", example: "SP" })
	@ApiResponse({
		status: 200,
		description: "List of farms in the state",
		type: [FarmResponseDto],
	})
	findByState(@Param("state") state: string): Promise<FarmResponseDto[]> {
		return this.farmsService.findByState(state);
	}

	/**
	 * Updates an existing farm.
	 *
	 * Allows partial updates - only provided fields will be updated.
	 * Validates area constraints with the merged data.
	 *
	 * @param id - UUID of the farm to update
	 * @param updateFarmDto - Fields to update
	 *
	 * @returns The updated farm
	 *
	 * @throws {NotFoundException} If farm or new producer does not exist
	 * @throws {BadRequestException} If updated area constraints are violated
	 */
	@Patch(":id")
	@ApiOperation({ summary: "Update farm" })
	@ApiResponse({
		status: 200,
		description: "Farm updated successfully",
		type: FarmResponseDto,
	})
	@ApiResponse({ status: 400, description: "Invalid input data or area constraints violated" })
	@ApiResponse({ status: 404, description: "Farm or producer not found" })
	update(@Param("id") id: string, @Body() updateFarmDto: UpdateFarmDto): Promise<FarmResponseDto> {
		return this.farmsService.update(id, updateFarmDto);
	}

	/**
	 * Deletes a farm.
	 *
	 * Also deletes all associated farm-harvest records due to CASCADE constraint.
	 *
	 * @param id - UUID of the farm to delete
	 *
	 * @returns Void on successful deletion
	 *
	 * @throws {NotFoundException} If farm with the given ID does not exist
	 */
	@Delete(":id")
	@ApiOperation({ summary: "Delete farm" })
	@ApiResponse({ status: 200, description: "Farm deleted successfully" })
	@ApiResponse({ status: 404, description: "Farm not found" })
	remove(@Param("id") id: string): Promise<void> {
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
		status: 200,
		description: "Total farm area in hectares",
		schema: { type: "number", example: 12345.67 },
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
		status: 200,
		description: "Farm count per state",
		schema: {
			type: "array",
			example: [
				{ state: "SP", count: 15 },
				{ state: "MG", count: 8 },
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
		status: 200,
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
}
