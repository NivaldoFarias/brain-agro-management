import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Repository } from "typeorm";

import type { CityResponseDto, FindAllCitiesDto } from "./dto";

import type { CitiesByState, PaginatedResponse } from "@agro/shared/types";

import { BrazilianState, CitySortField, SortOrder } from "@agro/shared/enums";

import { City } from "./entities/city.entity";

/**
 * Service for city data operations and lookups
 *
 * Provides methods to query Brazilian cities from the IBGE-populated database.
 * Useful for validation, test data generation, and city selection features.
 *
 * @example
 * ```typescript
 * const cities = await citiesService.findByState(BrazilianState.SP);
 * const city = await citiesService.findRandomByState(BrazilianState.SP);
 * ```
 */
@Injectable()
export class CitiesService {
	constructor(
		@InjectRepository(City)
		private readonly cityRepository: Repository<City>,

		@InjectPinoLogger(CitiesService.name)
		private readonly logger: PinoLogger,
	) {}

	/**
	 * Retrieves all cities with pagination, sorting, and filtering.
	 *
	 * Supports filtering by state with configurable sorting and pagination.
	 * Uses TypeORM QueryBuilder for efficient database queries.
	 *
	 * @param query Query parameters for pagination, sorting, and filtering
	 *
	 * @returns Paginated response with cities and metadata
	 *
	 * @example
	 * ```typescript
	 * const result = await service.findAll({
	 *   page: 1,
	 *   limit: 50,
	 *   sortBy: CitySortField.Name,
	 *   sortOrder: SortOrder.Ascending,
	 *   state: BrazilianState.SP
	 * });
	 * console.log(`Found ${result.total} cities`);
	 * ```
	 */
	public async findAll(query: FindAllCitiesDto): Promise<PaginatedResponse<CityResponseDto>> {
		const {
			page = 1,
			limit = 10,
			sortBy = CitySortField.Name,
			sortOrder = SortOrder.Ascending,
			state,
		} = query;

		const qb = this.cityRepository.createQueryBuilder("city");

		if (state) qb.andWhere("city.state = :state", { state });

		qb.orderBy(`city.${sortBy}`, sortOrder as SortOrder);

		const skip = (page - 1) * limit;
		qb.skip(skip).take(limit);

		const [cities, total] = await qb.getManyAndCount();

		return {
			data: cities.map((city) => this.mapToResponseDto(city)),
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		};
	}

	/**
	 * Retrieves all cities grouped by state for form dropdowns.
	 *
	 * Returns all 5,570 Brazilian cities organized by state without pagination.
	 * Optimized for client-side caching to support offline form functionality.
	 *
	 * @returns Object mapping state codes to arrays of city names
	 *
	 * @example
	 * ```typescript
	 * const citiesByState = await service.getAllGroupedByState();
	 * console.log(citiesByState.SP); // ["São Paulo", "Campinas", ...]
	 * ```
	 */
	public async getAllGroupedByState(): Promise<CitiesByState> {
		const cities = await this.cityRepository.find({
			order: { state: SortOrder.Ascending, name: SortOrder.Ascending },
		});

		const grouppedCities = cities.reduce<CitiesByState>(
			(acc, city) => {
				const state = city.state as BrazilianState;

				acc[state].push(city.name);

				return acc;
			},
			Object.fromEntries(
				Object.values(BrazilianState).map((state) => [state, [] as Array<string>]),
			) as CitiesByState,
		);

		return grouppedCities;
	}

	/**
	 * Finds all cities in a specific Brazilian state
	 *
	 * @param state Brazilian state code (UF)
	 *
	 * @returns Array of cities in the specified state
	 *
	 * @example
	 * ```typescript
	 * const spCities = await citiesService.findByState(BrazilianState.SP);
	 * console.log(spCities.length); // 645 cities in São Paulo
	 * ```
	 */
	public async findByState(state: BrazilianState): Promise<Array<City>> {
		try {
			return await this.cityRepository.find({
				where: { state },
				order: { name: SortOrder.Ascending },
			});
		} catch (error) {
			this.logger.error({ error, state }, "Failed to fetch cities by state");
			return [];
		}
	}

	/**
	 * Finds a random city in a specific Brazilian state
	 *
	 * Useful for generating realistic test data with valid city-state combinations.
	 *
	 * @param state Brazilian state code (UF)
	 *
	 * @returns Random city in the specified state, or `null` if none found
	 *
	 * @example
	 * ```typescript
	 * const randomCity = await citiesService.findRandomByState(BrazilianState.MG);
	 * // Returns: { id: "...", name: "Belo Horizonte", state: "MG", ... }
	 * ```
	 */
	public async findRandomByState(state: BrazilianState): Promise<City | null> {
		try {
			const cities = await this.cityRepository.find({ where: { state } });

			if (cities.length === 0) return null;

			return faker.helpers.arrayElement(cities);
		} catch (error) {
			this.logger.error({ error, state }, "Failed to fetch random city by state");
			return null;
		}
	}

	/**
	 * Checks if a city exists in a specific state
	 *
	 * Case-insensitive city name matching.
	 *
	 * @param cityName City name to check
	 * @param state Brazilian state code (UF)
	 *
	 * @returns `true` if city exists in state, `false` otherwise
	 *
	 * @example
	 * ```typescript
	 * await citiesService.exists("Campinas", BrazilianState.SP); // true
	 * await citiesService.exists("Campinas", BrazilianState.RJ); // false
	 * ```
	 */
	public async exists(cityName: string, state: BrazilianState): Promise<boolean> {
		try {
			const count = await this.cityRepository
				.createQueryBuilder("city")
				.where("LOWER(city.name) = LOWER(:name)", { name: cityName })
				.andWhere("city.state = :state", { state })
				.getCount();

			return count > 0;
		} catch (error) {
			this.logger.error({ error, cityName, state }, "Failed to check city existence");
			return false;
		}
	}

	/**
	 * Gets total count of cities in the database
	 *
	 * @returns Total number of Brazilian municipalities
	 *
	 * @example
	 * ```typescript
	 * const total = await citiesService.count();
	 * console.log(total); // ~5570 cities
	 * ```
	 */
	public async count(): Promise<number> {
		try {
			return await this.cityRepository.count();
		} catch (error) {
			this.logger.error({ error }, "Failed to count cities");
			return 0;
		}
	}

	/**
	 * Finds a city by its IBGE code
	 *
	 * @param ibgeCode 7-digit IBGE municipality code
	 *
	 * @returns City with the specified IBGE code, or `null` if not found
	 *
	 * @example
	 * ```typescript
	 * const saoPaulo = await citiesService.findByIbgeCode("3550308");
	 * ```
	 */
	public async findByIbgeCode(ibgeCode: string): Promise<City | null> {
		try {
			return await this.cityRepository.findOne({ where: { ibgeCode } });
		} catch (error) {
			this.logger.error({ error, ibgeCode }, "Failed to fetch city by IBGE code");
			return null;
		}
	}

	/**
	 * Maps a {@link City} entity to a {@link CityResponseDto}
	 *
	 * @param city City entity to map
	 *
	 * @returns Mapped CityResponseDto
	 */
	private mapToResponseDto(city: City): CityResponseDto {
		return {
			id: city.id,
			name: city.name,
			state: city.state,
			ibgeCode: city.ibgeCode,
			createdAt: city.createdAt,
			updatedAt: city.updatedAt,
		};
	}
}
