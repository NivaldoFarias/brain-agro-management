import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppDataSource } from "./database/data-source";
import { FarmsModule } from "./farms/farms.module";
import { ProducersModule } from "./producers/producers.module";

/**
 * Root application module.
 *
 * Configures TypeORM database connection and imports all feature modules.
 * This module serves as the entry point for the NestJS application.
 *
 * @example
 * ```typescript
 * // Usage in main.ts
 * const app = await NestFactory.create(AppModule);
 * ```
 */
@Module({
	imports: [
		// Database configuration
		TypeOrmModule.forRoot(AppDataSource.options),

		// Feature modules
		ProducersModule,
		FarmsModule,
	],
})
export class AppModule {}
