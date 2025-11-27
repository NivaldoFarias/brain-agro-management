import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PinoLogger } from "nestjs-pino";
import { Repository } from "typeorm";

import { OrderBy } from "@agro/shared/utils";

import { BrazilianState } from "@/common";

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
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(CitiesService.name);
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
	async findByState(state: string): Promise<Array<City>> {
		try {
			return await this.cityRepository.find({
				where: { state },
				order: { name: OrderBy.Ascending },
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
	async findRandomByState(state: BrazilianState): Promise<City | null> {
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
	async exists(cityName: string, state: BrazilianState): Promise<boolean> {
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
	async count(): Promise<number> {
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
	async findByIbgeCode(ibgeCode: string): Promise<City | null> {
		try {
			return await this.cityRepository.findOne({ where: { ibgeCode } });
		} catch (error) {
			this.logger.error({ error, ibgeCode }, "Failed to fetch city by IBGE code");
			return null;
		}
	}
}
