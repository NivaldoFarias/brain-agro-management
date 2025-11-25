import { DataSource } from "typeorm";

import { RuntimeEnvironment } from "@agro/shared/utils";

import { env } from "@/utils/env.util";

import { City, Farm, FarmHarvest, FarmHarvestCrop, Harvest, Producer } from "./entities";

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
	database: env.API_DATABASE_PATH,
	entities: [Producer, Farm, Harvest, FarmHarvest, FarmHarvestCrop, City],
	migrations: ["./src/database/migrations/**/*.ts"],
	// TEMPORARY: Auto-create tables in development (will use migrations in production)
	synchronize: env.NODE_ENV !== RuntimeEnvironment.Production,
	logging: env.API_DATABASE_LOGGING,
});
