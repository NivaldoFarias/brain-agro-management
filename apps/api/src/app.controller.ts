import { Controller, Get } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";

import type { ApiAppMetadata } from "@agro/shared/types";

import {
	API_ROUTES_AUTH,
	API_ROUTES_DOCS,
	API_ROUTES_FARMS,
	API_ROUTES_HEALTH,
	API_ROUTES_PRODUCERS,
} from "@agro/shared/constants";

import { Public } from "@/common/decorators/public.decorator";

import { APP_INFO } from "./common/utils/constants.util";

/**
 * Root API controller providing basic information about the API.
 *
 * Handles the root `/api` endpoint to display API metadata and available routes.
 */
@Public()
@ApiExcludeController()
@Controller()
export class AppController {
	/**
	 * Root endpoint providing API information and links.
	 *
	 * @returns API metadata and available routes
	 *
	 * @example
	 * ```bash
	 * curl http://localhost:3000/api
	 * ```
	 */
	@Get()
	public getApiInfo(): ApiAppMetadata {
		return {
			name: APP_INFO.name,
			version: APP_INFO.version,
			description: APP_INFO.description,
			endpoints: {
				documentation: API_ROUTES_DOCS.docs,
				reference: API_ROUTES_DOCS.reference,
				auth: API_ROUTES_AUTH.login,
				health: API_ROUTES_HEALTH.health,
				healthReady: API_ROUTES_HEALTH.ready,
				producers: API_ROUTES_PRODUCERS.base,
				farms: API_ROUTES_FARMS.base,
				statistics: {
					totalArea: API_ROUTES_FARMS.stats.totalArea,
					byState: API_ROUTES_FARMS.stats.byState,
					landUse: API_ROUTES_FARMS.stats.landUse,
					cropsDistribution: API_ROUTES_FARMS.stats.cropsDistribution,
				},
			},
		};
	}
}
