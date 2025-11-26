import { DataSource } from "typeorm";

import { RuntimeEnvironment } from "@agro/shared/utils/constants.util";

import { env } from "@/config/env.config";
import { City } from "@/modules/cities/entities/city.entity";
import { FarmHarvestCrop } from "@/modules/farms/entities/farm-harvest-crop.entity";
import { FarmHarvest } from "@/modules/farms/entities/farm-harvest.entity";
import { Farm } from "@/modules/farms/entities/farm.entity";
import { Harvest } from "@/modules/farms/entities/harvest.entity";
import { Producer } from "@/modules/producers/entities/producer.entity";

/**
 * TypeORM DataSource configuration for CLI operations.
 *
 * This configuration is used by the TypeORM CLI for:
 * - Generating migrations: `bun run migration:generate -- MigrationName`
 * - Running migrations: `bun run migration:run`
 * - Reverting migrations: `bun run migration:revert`
 *
 * Environment variables are loaded from the root .env file by Bun automatically.
 *
 * @see {@link https://typeorm.io/data-source TypeORM DataSource Documentation}
 */
export const AppDataSource = new DataSource({
	type: "sqlite",
	database: env.API__DATABASE_PATH,
	entities: [Producer, Farm, Harvest, FarmHarvest, FarmHarvestCrop, City],
	migrations: ["./src/database/migrations/**/*.ts"],
	// TEMPORARY: Auto-create tables in development (will use migrations in production)
	synchronize: env.NODE_ENV !== RuntimeEnvironment.Production,
	logging: env.API__DATABASE_LOGGING,
});
