import { Controller, Get } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";

import { Public } from "@/common/decorators/public.decorator";

import { APP_INFO } from "./utils/constants.util";

interface ApiAppMetadata {
	name: string;
	version: string;
	description: string;
	documentation: string;
	endpoints: {
		auth: string;
		health: string;
		producers: string;
		farms: string;
		statistics: {
			totalArea: string;
			byState: string;
			landUse: string;
			cropsDistribution: string;
		};
	};
}

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
	getApiInfo(): ApiAppMetadata {
		return {
			name: APP_INFO.name,
			version: APP_INFO.version,
			description: APP_INFO.description,
			documentation: "/api/docs",
			endpoints: {
				auth: "/api/auth/login",
				health: "/api/health",
				producers: "/api/producers",
				farms: "/api/farms",
				statistics: {
					totalArea: "/api/farms/stats/total-area",
					byState: "/api/farms/stats/by-state",
					landUse: "/api/farms/stats/land-use",
					cropsDistribution: "/api/farms/stats/crops-distribution",
				},
			},
		};
	}
}
