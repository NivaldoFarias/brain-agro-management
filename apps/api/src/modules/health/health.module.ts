import { Module } from "@nestjs/common";

import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

/**
 * Health check module for application monitoring.
 *
 * Provides comprehensive health and readiness endpoints for orchestration systems,
 * load balancers, and monitoring tools. Includes database connectivity checks,
 * memory monitoring, disk usage tracking, and uptime metrics.
 *
 * @example
 * ```typescript
 * // Import in app.module.ts
 * imports: [
 *   HealthModule,
 *   // ... other modules
 * ]
 * ```
 */
@Module({
	controllers: [HealthController],
	providers: [HealthService],
	exports: [HealthService],
})
export class HealthModule {}
