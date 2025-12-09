import { DataSource } from "typeorm";

import { migrations } from "../database/migrations";
import { User } from "../modules/auth/entities/user.entity";
import { City } from "../modules/cities/entities/city.entity";
import { FarmHarvestCrop } from "../modules/farms/entities/farm-harvest-crop.entity";
import { FarmHarvest } from "../modules/farms/entities/farm-harvest.entity";
import { Farm } from "../modules/farms/entities/farm.entity";
import { Harvest } from "../modules/farms/entities/harvest.entity";
import { Producer } from "../modules/producers/entities/producer.entity";

import { env } from "./env.config";

/**
 * TypeORM DataSource configuration for CLI operations and migrations.
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
	entities: [User, Producer, Farm, Harvest, FarmHarvest, FarmHarvestCrop, City],
	migrations,
	migrationsTableName: "migrations",
	migrationsRun: false,
	synchronize: false,
	logging: env.API__DATABASE_LOGGING,
});
