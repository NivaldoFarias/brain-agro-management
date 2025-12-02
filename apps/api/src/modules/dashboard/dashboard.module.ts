import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Farm } from "@/modules/farms/entities/farm.entity";
import { Producer } from "@/modules/producers/entities/producer.entity";

import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

/**
 * Dashboard module providing aggregated statistics endpoints.
 *
 * Consolidates farm and producer data into comprehensive dashboard
 * metrics for improved frontend performance.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [DashboardModule],
 * })
 * export class AppModule {}
 * ```
 */
@Module({
	imports: [TypeOrmModule.forFeature([Farm, Producer])],
	controllers: [DashboardController],
	providers: [DashboardService],
})
export class DashboardModule {}
