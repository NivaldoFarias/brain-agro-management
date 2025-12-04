import { Controller, Get, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import type { CitiesByState, PaginatedResponse } from "@agro/shared/types";

import { BrazilianState } from "@agro/shared/utils";

import { CitiesService } from "./cities.service";
import { CityResponseDto, FindAllCitiesDto } from "./dto";
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
	 * Retrieves all cities with pagination, sorting, and filtering.
	 *
	 * Supports filtering by state with configurable sorting and pagination.
	 * All query parameters are optional.
	 *
	 * @param query Query parameters for pagination, sorting, and filtering
	 *
	 * @returns Paginated city response with metadata
	 */
	@Get()
	@ApiOperation({
		summary: "Get all cities with pagination, sorting, and filtering",
		description:
			"Retrieves a paginated list of cities. Supports filtering by state, customizable sorting, and pagination.",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Paginated list of cities",
		type: [CityResponseDto],
	})
	public findAll(@Query() query: FindAllCitiesDto): Promise<PaginatedResponse<CityResponseDto>> {
		return this.citiesService.findAll(query);
	}

	/**
	 * Retrieves all cities grouped by state for form dropdowns.
	 *
	 * Returns all 5,570 Brazilian cities organized by state without pagination.
	 * Optimized for client-side caching to support offline form functionality.
	 * This endpoint is specifically designed for loading city options in form selects.
	 *
	 * @returns Object mapping state codes to arrays of city names
	 */
	@Get("all/grouped-by-state")
	@ApiOperation({
		summary: "Get all cities grouped by state for form dropdowns",
		description:
			"Returns all Brazilian cities grouped by state. Intended for client-side caching to populate city dropdowns in forms. Returns ~5,570 cities.",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Cities grouped by state",
		schema: {
			type: "object",
			properties: {
				SP: { type: "array", items: { type: "string" } },
				MG: { type: "array", items: { type: "string" } },
			},
			example: {
				SP: ["São Paulo", "Campinas", "Santos"],
				MG: ["Belo Horizonte", "Uberlândia"],
			},
		},
	})
	public getAllGroupedByState(): Promise<CitiesByState> {
		return this.citiesService.getAllGroupedByState();
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
	@Get("by-state/:state")
	@ApiOperation({ summary: "Get all cities in a state" })
	@ApiParam({
		name: "state",
		description: "Brazilian state code (UF)",
		enum: BrazilianState,
		example: BrazilianState.SP,
		enumName: "BrazilianState",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Cities retrieved successfully",
		type: [City],
	})
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid state code" })
	public async findByState(@Param("state") state: BrazilianState): Promise<Array<City>> {
		return this.citiesService.findByState(state);
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
