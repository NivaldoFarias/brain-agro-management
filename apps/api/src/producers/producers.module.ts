import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Producer } from "../database/entities";

import { ProducersController } from "./producers.controller";
import { ProducersService } from "./producers.service";

/**
 * NestJS module for producer management.
 *
 * Provides producer-related services and repositories. This module encapsulates
 * all producer business logic and can be imported by other modules that need
 * producer functionality.
 *
 * @example
 * ```typescript
 * // In another module
 * @Module({
 *   imports: [ProducersModule],
 * })
 * export class FarmsModule {}
 * ```
 */
@Module({
	imports: [TypeOrmModule.forFeature([Producer])],
	controllers: [ProducersController],
	providers: [ProducersService],
	exports: [ProducersService],
})
export class ProducersModule {}
