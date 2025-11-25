import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CitiesService } from "./cities.service";
import { City } from "./entities";

/**
 * Database module for city-related operations
 *
 * Provides the CitiesService for querying Brazilian municipalities from
 * IBGE-populated data. This module should be imported by feature modules
 * that need city lookup functionality.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [CitiesModule],
 * })
 * export class FarmsModule {}
 * ```
 */
@Module({
	imports: [TypeOrmModule.forFeature([City])],
	providers: [CitiesService],
	exports: [CitiesService],
})
export class CitiesModule {}
