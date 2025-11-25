import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

import { HealthController } from "./health.controller";

/**
 * Health check module for application monitoring.
 *
 * Provides health and readiness endpoints for orchestration systems,
 * load balancers, and monitoring tools. Integrates with @nestjs/terminus
 * for standardized health check patterns.
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
	imports: [TerminusModule],
	controllers: [HealthController],
})
export class HealthModule {}
