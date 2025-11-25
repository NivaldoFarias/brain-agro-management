import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from "@nestjs/terminus";

import type { HealthCheckResult } from "@nestjs/terminus";

import { Public } from "@/common/decorators/public.decorator";

/**
 * Health check controller for monitoring application status.
 *
 * Provides endpoints to verify application health and readiness for
 * load balancers, orchestrators, and monitoring systems. Includes checks
 * for database connectivity and overall application status.
 *
 * @example
 * ```bash
 * curl http://localhost:3000/api/health
 * curl http://localhost:3000/api/health/ready
 * ```
 */
@Public()
@ApiTags("Health")
@Controller("health")
export class HealthController {
	constructor(
		private readonly health: HealthCheckService,
		private readonly db: TypeOrmHealthIndicator,
	) {}

	/**
	 * Basic health check endpoint.
	 *
	 * Returns application health status without detailed checks. Useful for
	 * simple liveness probes that only verify the application is responsive.
	 *
	 * @returns Health check result with overall status
	 *
	 * @example
	 * ```typescript
	 * // Response
	 * {
	 *   "status": "ok",
	 *   "info": {},
	 *   "error": {},
	 *   "details": {}
	 * }
	 * ```
	 */
	@Get()
	@HealthCheck()
	@ApiOperation({
		summary: "Check application health",
		description: "Basic liveness probe - verifies application is responsive",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Application is healthy",
		schema: {
			type: "object",
			properties: {
				status: { type: "string", example: "ok" },
				info: { type: "object" },
				error: { type: "object" },
				details: { type: "object" },
			},
		},
	})
	@ApiResponse({
		status: HttpStatus.SERVICE_UNAVAILABLE,
		description: "Application is unhealthy",
	})
	check(): Promise<HealthCheckResult> {
		return this.health.check([]);
	}

	/**
	 * Readiness check endpoint with detailed status.
	 *
	 * Verifies application is ready to handle requests by checking all
	 * dependencies (database, external services). Use for readiness probes
	 * in orchestration systems to determine when to route traffic.
	 *
	 * @returns Health check result including database connectivity status
	 *
	 * @example
	 * ```typescript
	 * // Response
	 * {
	 *   "status": "ok",
	 *   "info": {
	 *     "database": {
	 *       "status": "up"
	 *     }
	 *   },
	 *   "error": {},
	 *   "details": {
	 *     "database": {
	 *       "status": "up"
	 *     }
	 *   }
	 * }
	 * ```
	 */
	@Get("ready")
	@HealthCheck()
	@ApiOperation({
		summary: "Check application readiness",
		description:
			"Readiness probe - verifies application and dependencies are ready to handle requests",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Application and dependencies are ready",
		schema: {
			type: "object",
			properties: {
				status: { type: "string", example: "ok" },
				info: {
					type: "object",
					properties: {
						database: {
							type: "object",
							properties: {
								status: { type: "string", example: "up" },
							},
						},
					},
				},
				error: { type: "object" },
				details: { type: "object" },
			},
		},
	})
	@ApiResponse({
		status: HttpStatus.SERVICE_UNAVAILABLE,
		description: "Application or dependencies are not ready",
	})
	readiness(): Promise<HealthCheckResult> {
		return this.health.check([() => this.db.pingCheck("database")]);
	}
}
