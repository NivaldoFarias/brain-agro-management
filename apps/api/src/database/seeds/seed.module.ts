import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoggerModule } from "nestjs-pino";

import { AppDataSource } from "@/config/database.config";
import { createPinoConfig } from "@/config/logger.config";
import { CitiesModule } from "@/modules/cities/cities.module";

import { SeedService } from "./seed.service";
import { SeedUtilities } from "./seed.utilities";

/**
 * Database seeding module.
 *
 * Provides centralized database seeding functionality for the application.
 * The {@link SeedService} is exported to allow usage in the application bootstrap process.
 *
 * This module is self-contained and can be used in standalone NestJS application contexts
 * for CLI-based seeding scripts.
 *
 * Imports:
 * - ConfigModule: Loads environment variables for database and seeding configuration
 * - TypeOrmModule: Provides DataSource for database operations
 * - LoggerModule: Provides PinoLogger for structured logging
 * - CitiesModule: Provides IbgeApiService for fetching municipality data
 *
 * Providers:
 * - SeedService: Main orchestrator for database seeding
 * - SeedUtilities: Helper methods for generating realistic seed data
 *
 * @see {@link SeedService} for seeding logic
 * @see {@link SeedUtilities} for utility methods
 */
@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot(AppDataSource.options),
		LoggerModule.forRoot(createPinoConfig()),
		CitiesModule,
	],
	providers: [SeedService, SeedUtilities],
	exports: [SeedService],
})
export class SeedModule {}
