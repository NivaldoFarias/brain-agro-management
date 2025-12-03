import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { IsCityInStateConstraint } from "@/common/decorators/city-in-state.decorator";
import { City } from "@/modules/cities/entities/city.entity";
import { Producer } from "@/modules/producers/entities/";

import { CitiesModule } from "../cities/cities.module";

import { Farm, FarmHarvest, FarmHarvestCrop, Harvest } from "./entities/";
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
	imports: [
		TypeOrmModule.forFeature([Farm, Producer, City, Harvest, FarmHarvest, FarmHarvestCrop]),
		CitiesModule,
	],
	controllers: [FarmsController],
	providers: [FarmsService, IsCityInStateConstraint],
	exports: [FarmsService],
})
export class FarmsModule {}
