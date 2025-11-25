import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Farm, Producer } from "../database/entities";

import { FarmsController } from "./farms.controller";
import { FarmsService } from "./farms.service";

/**
 * NestJS module for farm management.
 *
 * Provides farm-related services and repositories. This module encapsulates
 * all farm business logic and can be imported by other modules that need
 * farm functionality.
 *
 * Note: Imports Producer entity to enable producer validation in FarmsService.
 *
 * @example
 * ```typescript
 * // In another module
 * @Module({
 *   imports: [FarmsModule],
 * })
 * export class DashboardModule {}
 * ```
 */
@Module({
	imports: [TypeOrmModule.forFeature([Farm, Producer])],
	controllers: [FarmsController],
	providers: [FarmsService],
	exports: [FarmsService],
})
export class FarmsModule {}
