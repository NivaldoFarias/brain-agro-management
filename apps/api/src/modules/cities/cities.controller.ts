import { Controller, Get, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import type { ListAllData } from "@agro/shared/types";

import { BrazilianState } from "@/common";

import { CitiesService } from "./cities.service";
import { CityResponseDto } from "./dto";
import { City } from "./entities/city.entity";

/**
 * Controller handling HTTP requests for city/municipality queries.
 *
 * Provides RESTful endpoints for querying Brazilian cities from the IBGE-populated
 * database. Useful for city selection features, validation, and location-based lookups.
 *
 * @example
 * ```typescript
 * // Usage in NestJS module
 * @Module({
 *   controllers: [CitiesController],
 *   providers: [CitiesService]
 * })
 * ```
 */
@ApiTags("Cities")
@Controller("cities")
export class CitiesController {
	constructor(private readonly citiesService: CitiesService) {}

	/**
	 * Retrieves all cities with pagination.
	 *
	 * Returns cities ordered alphabetically by name with pagination support.
	 *
	 * @param page Page number (1-indexed)
	 * @param limit Number of items per page
	 *
	 * @returns Paginated farm response
	 */
	@Get()
	@ApiOperation({ summary: "Get all cities with pagination" })
	@ApiQuery({
		name: "page",
		required: false,
		type: Number,
		description: "Page number",
		default: 1,
	})
	@ApiQuery({
		name: "limit",
		required: false,
		type: Number,
		description: "Items per page",
		default: 100,
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Paginated list of cities",
		type: [CityResponseDto],
	})
	public async findAll(
		@Query("page") page?: string,
		@Query("limit") limit?: string,
	): Promise<ListAllData<CityResponseDto>> {
		const pageNum = page ? Number.parseInt(page, 10) : 1;
		const limitNum = limit ? Number.parseInt(limit, 10) : 100;

		const { data, total } = await this.citiesService.findAll(pageNum, limitNum);

		return { data, total, page: pageNum, limit: limitNum };
	}

	/**
	 * Retrieves all cities in a specific Brazilian state
	 *
	 * Returns a list of municipalities ordered alphabetically by name.
	 *
	 * @param state Brazilian state code (UF) - two-letter abbreviation (e.g., "SP", "MG", "RJ")
	 *
	 * @returns Array of cities in the specified state
	 *
	 * @throws {BadRequestException} If state code is invalid
	 */
	@Get(":state")
	@ApiOperation({ summary: "Get all cities in a state" })
	@ApiParam({
		name: "state",
		description: "Brazilian state code (UF)",
		enum: Object.values(BrazilianState),
		example: BrazilianState.SP,
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Cities retrieved successfully",
		type: [City],
	})
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid state code" })
	public async findByState(@Param("state") state: string): Promise<Array<City>> {
		return this.citiesService.findByState(state as BrazilianState);
	}

	/**
	 * Gets the total count of cities in the database
	 *
	 * Returns the total number of Brazilian municipalities in the system.
	 *
	 * @returns Object containing total city count
	 */
	@Get("count")
	@ApiOperation({ summary: "Get total count of cities" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Total city count retrieved successfully",
		schema: { type: "object", properties: { total: { type: "number" } } },
	})
	public async count(): Promise<{ total: number }> {
		const total = await this.citiesService.count();
		return { total };
	}

	/**
	 * Retrieves a city by its IBGE code
	 *
	 * The IBGE code is a 7-digit municipal code assigned by the Brazilian Institute
	 * of Geography and Statistics.
	 *
	 * @param ibgeCode 7-digit IBGE municipality code (e.g., "3550308" for São Paulo)
	 *
	 * @returns City with the specified IBGE code, or `null` if not found
	 *
	 * @throws {BadRequestException} If IBGE code format is invalid
	 * @throws {NotFoundException} If city with code not found
	 */
	@Get("by-ibge-code/:ibgeCode")
	@ApiOperation({ summary: "Get city by IBGE code" })
	@ApiParam({
		name: "ibgeCode",
		description: "7-digit IBGE municipality code",
		example: "3550308",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "City retrieved successfully",
		type: City,
	})
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid IBGE code format" })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: "City not found" })
	public async findByIbgeCode(@Param("ibgeCode") ibgeCode: string): Promise<City | null> {
		return this.citiesService.findByIbgeCode(ibgeCode);
	}
}
