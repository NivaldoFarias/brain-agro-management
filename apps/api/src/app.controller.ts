import { Controller, Get } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";

import type { ApiAppMetadata } from "@agro/shared/types";

import { API_ROUTES } from "@agro/shared/constants";

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
				documentation: API_ROUTES.docs.docs,
				reference: API_ROUTES.docs.reference,
				health: API_ROUTES.health.health,
				healthReady: API_ROUTES.health.ready,
				producers: API_ROUTES.producers.base,
				farms: API_ROUTES.farms.base,
				auth: {
					login: API_ROUTES.auth.login,
					logout: API_ROUTES.auth.logout,
				},
				statistics: {
					totalArea: API_ROUTES.farms.stats.totalArea,
					byState: API_ROUTES.farms.stats.byState,
					landUse: API_ROUTES.farms.stats.landUse,
					cropsDistribution: API_ROUTES.farms.stats.cropsDistribution,
				},
			},
		};
	}
}
