import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { firstValueFrom } from "rxjs";

import { env } from "@/config/env.config";
import { CityMetadataIbge } from "@/database/seeds/seed.constants";

/**
 * IBGE API service for fetching Brazilian municipalities.
 *
 * Provides integration with IBGE's public API to retrieve municipality data
 * for database seeding and city lookup operations. Uses NestJS HttpService
 * with proper error handling and logging.
 *
 * API Documentation: {@link https://servicodados.ibge.gov.br/api/docs/localidades}
 *
 * @example
 * ```typescript
 * constructor(private readonly ibgeApi: IbgeApiService) {}
 *
 * const cities = await this.ibgeApi.fetchMunicipalitiesByState('SP');
 * console.log(cities.length); // ~645 municipalities in São Paulo
 * ```
 */
@Injectable()
export class IbgeApiService {
	private readonly baseUrl = env.API__IBGE_API_BASE_URL;

	constructor(
		private readonly httpService: HttpService,

		@InjectPinoLogger(IbgeApiService.name)
		private readonly logger: PinoLogger,
	) {}

	/**
	 * Fetches all municipalities for a specific Brazilian state from IBGE API.
	 *
	 * Retrieves municipality data including:
	 * - IBGE city code (unique identifier)
	 * - City name
	 * - Microregion and mesoregion information
	 * - Immediate and intermediate region data
	 * - State and region associations
	 *
	 * The API may return hundreds of cities per state (e.g., 853 for Minas Gerais).
	 * Consider rate limiting when calling for multiple states.
	 *
	 * @param state Brazilian state code (e.g., 'SP', 'RJ', 'MG')
	 *
	 * @returns Array of IBGE city objects with full geographical hierarchy
	 *
	 * @throws Error when IBGE API returns non-2xx status code
	 *
	 * @see {@link CityMetadataIbge} for response structure
	 *
	 * @example
	 * ```typescript
	 * try {
	 *   const cities = await this.ibgeApi.fetchMunicipalitiesByState('MT');
	 *   console.log(cities[0]);
	 *   // { id: 5100102, nome: "Acorizal", ... }
	 * } catch (error) {
	 *   this.logger.error({ error }, "Failed to fetch municipalities");
	 * }
	 * ```
	 */
	async fetchMunicipalitiesByState(state: string): Promise<Array<CityMetadataIbge>> {
		const url = `${this.baseUrl}/estados/${state}/municipios`;

		try {
			this.logger.debug({ state, url }, "Fetching municipalities from IBGE API");

			const response = await firstValueFrom(this.httpService.get<Array<CityMetadataIbge>>(url));

			this.logger.debug(
				{ state, cityCount: response.data.length },
				"Successfully fetched municipalities",
			);

			return response.data;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

			this.logger.error(
				{ state, url, error: errorMessage },
				"Failed to fetch municipalities from IBGE API",
			);

			throw new Error(`IBGE API request failed for state ${state}: ${errorMessage}`);
		}
	}
}
