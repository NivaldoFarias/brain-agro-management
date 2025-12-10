import { Controller, Get } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";

import type { ApiAppMetadata } from "@agro/shared/types";

import { ROUTES } from "@agro/shared/constants";

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
				documentation: ROUTES.api.docs.swagger,
				reference: ROUTES.api.docs.reference,
				health: ROUTES.api.health.base,
				healthReady: ROUTES.api.health.ready,
				producers: ROUTES.api.producers.base,
				farms: ROUTES.api.farms.base,
				auth: {
					login: ROUTES.api.auth.login,
					logout: ROUTES.api.auth.logout,
				},
				statistics: {
					totalArea: ROUTES.api.farms.stats.totalArea,
					byState: ROUTES.api.farms.stats.byState,
					landUse: ROUTES.api.farms.stats.landUse,
					cropsDistribution: ROUTES.api.farms.stats.cropsDistribution,
				},
			},
		};
	}
}
