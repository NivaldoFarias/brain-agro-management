import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CitiesService } from "./cities.service";
import { City } from "./entities/city.entity";
import { IbgeApiService } from "./ibge-api.service";

/**
 * Database module for city-related operations
 *
 * Provides the CitiesService for querying Brazilian municipalities from
 * IBGE-populated data. This module should be imported by feature modules
 * that need city lookup functionality.
 *
 * Also exports IbgeApiService for fetching municipality data from IBGE API.
 */
@Module({
	imports: [TypeOrmModule.forFeature([City]), HttpModule],
	providers: [CitiesService, IbgeApiService],
	exports: [CitiesService, IbgeApiService],
})
export class CitiesModule {}
