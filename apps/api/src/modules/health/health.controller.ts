import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import type {
	BasicHealthResponse,
	DetailedHealthResponse,
} from "./interfaces/health-response.interface";

import { Public } from "@/common/decorators/public.decorator";

import { HealthService } from "./health.service";

/**
 * Health check controller for monitoring application status.
 *
 * Provides endpoints to verify application health and readiness for
 * load balancers, orchestrators, and monitoring systems. Includes checks
 * for database connectivity, memory usage, disk space, and overall application status.
 *
 * @example
 * ```bash
 * # Basic liveness check
 * curl http://localhost:3000/api/health
 *
 * # Detailed readiness check
 * curl http://localhost:3000/api/health/ready
 * ```
 */
@Public()
@ApiTags("Health")
@Controller("health")
export class HealthController {
	constructor(private readonly healthService: HealthService) {}

	/**
	 * Basic health check endpoint (liveness probe).
	 *
	 * Returns application health status without detailed checks. Useful for
	 * simple liveness probes that only verify the application is responsive.
	 * This endpoint is lightweight and does not check dependencies.
	 *
	 * @returns Health check result with uptime information
	 *
	 * @example
	 * ```typescript
	 * // Response
	 * {
	 *   "status": "ok",
	 *   "uptime": {
	 *     "startTime": "2024-01-15T10:30:00.000Z",
	 *     "uptimeSeconds": 3600,
	 *     "uptimeFormatted": "1h 0m 0s"
	 *   },
	 *   "timestamp": "2024-01-15T11:30:00.000Z"
	 * }
	 * ```
	 */
	@Get()
	@ApiOperation({
		summary: "Check application health",
		description:
			"Liveness probe - verifies application is responsive without checking dependencies",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Application is healthy and responsive",
		schema: {
			type: "object",
			properties: {
				status: { type: "string", example: "ok" },
				uptime: {
					type: "object",
					properties: {
						startTime: { type: "string", example: "2024-01-15T10:30:00.000Z" },
						uptimeSeconds: { type: "number", example: 3600 },
						uptimeFormatted: { type: "string", example: "1h 0m 0s" },
					},
				},
				timestamp: { type: "string", example: "2024-01-15T11:30:00.000Z" },
			},
		},
	})
	@ApiResponse({
		status: HttpStatus.SERVICE_UNAVAILABLE,
		description: "Application is unhealthy",
	})
	check(): BasicHealthResponse {
		return this.healthService.getBasicHealth();
	}

	/**
	 * Detailed readiness check endpoint.
	 *
	 * Verifies application is ready to handle requests by checking all
	 * dependencies (database, memory, disk). Use for readiness probes
	 * in orchestration systems to determine when to route traffic.
	 * Includes comprehensive metrics for monitoring dashboards.
	 *
	 * @returns Health check result including all dependency statuses
	 *
	 * @example
	 * ```typescript
	 * // Response
	 * {
	 *   "status": "ok",
	 *   "uptime": {
	 *     "startTime": "2024-01-15T10:30:00.000Z",
	 *     "uptimeSeconds": 3600,
	 *     "uptimeFormatted": "1h 0m 0s"
	 *   },
	 *   "timestamp": "2024-01-15T11:30:00.000Z",
	 *   "database": {
	 *     "status": "up",
	 *     "responseTime": 5,
	 *     "type": "sqlite",
	 *     "connection": "apps/api/data/agro.db",
	 *     "tableCount": 7,
	 *     "migrationsApplied": true
	 *   },
	 *   "memory": {
	 *     "status": "up",
	 *     "used": 536870912,
	 *     "total": 8589934592,
	 *     "usagePercent": 6.25,
	 *     "heapUsed": 45678123,
	 *     "heapTotal": 67108864
	 *   },
	 *   "disk": {
	 *     "status": "up",
	 *     "dbSize": 262144,
	 *     "dbSizeFormatted": "256 KB",
	 *     "path": "apps/api/data/agro.db"
	 *   },
	 *   "version": "0.0.1",
	 *   "nodeVersion": "v20.10.0"
	 * }
	 * ```
	 */
	@Get("ready")
	@ApiOperation({
		summary: "Check application readiness",
		description:
			"Readiness probe - verifies application and all dependencies are ready to handle requests. Includes database connectivity, memory usage, disk space, and system metrics.",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Application and all dependencies are ready",
		schema: {
			type: "object",
			properties: {
				status: { type: "string", example: "ok" },
				uptime: {
					type: "object",
					properties: {
						startTime: { type: "string", example: "2024-01-15T10:30:00.000Z" },
						uptimeSeconds: { type: "number", example: 3600 },
						uptimeFormatted: { type: "string", example: "1h 0m 0s" },
					},
				},
				timestamp: { type: "string", example: "2024-01-15T11:30:00.000Z" },
				database: {
					type: "object",
					properties: {
						status: { type: "string", example: "up" },
						responseTime: { type: "number", example: 5 },
						type: { type: "string", example: "sqlite" },
						connection: { type: "string", example: "apps/api/data/agro.db" },
						tableCount: { type: "number", example: 7 },
						migrationsApplied: { type: "boolean", example: true },
					},
				},
				memory: {
					type: "object",
					properties: {
						status: { type: "string", example: "up" },
						used: { type: "number", example: 536870912 },
						total: { type: "number", example: 8589934592 },
						usagePercent: { type: "number", example: 6.25 },
						heapUsed: { type: "number", example: 45678123 },
						heapTotal: { type: "number", example: 67108864 },
					},
				},
				disk: {
					type: "object",
					properties: {
						status: { type: "string", example: "up" },
						dbSize: { type: "number", example: 262144 },
						dbSizeFormatted: { type: "string", example: "256 KB" },
						path: { type: "string", example: "apps/api/data/agro.db" },
					},
				},
				version: { type: "string", example: "0.0.1" },
				nodeVersion: { type: "string", example: "v20.10.0" },
			},
		},
	})
	@ApiResponse({
		status: HttpStatus.SERVICE_UNAVAILABLE,
		description: "Application or dependencies are not ready",
		schema: {
			type: "object",
			properties: {
				status: { type: "string", example: "error" },
				message: { type: "string", example: "Database connection failed" },
				timestamp: { type: "string", example: "2024-01-15T11:30:00.000Z" },
			},
		},
	})
	async readiness(): Promise<DetailedHealthResponse> {
		return this.healthService.getDetailedHealth();
	}
}
