import type { DataSourceOptions } from "typeorm";

import { createLogger } from "@agro/shared/utils";

import { env } from "@/config/env.config";

import { InitialSchema1732406400000 } from "./1732406400000-InitialSchema";
import { SeedCities1732406500000 } from "./1732406500000-SeedCities";
import { AddPerformanceIndexes1732500000000 } from "./1732500000000-AddPerformanceIndexes";

export const migrations = [
	InitialSchema1732406400000,
	SeedCities1732406500000,
	AddPerformanceIndexes1732500000000,
];

/**
 * Runs pending database migrations.
 *
 * Initializes a separate DataSource connection to run migrations before the
 * NestJS application starts. This ensures the database schema is up-to-date
 * before any queries are executed.
 *
 * Creates the database directory if it doesn't exist to prevent initialization failures.
 *
 * @param dataSourceOptions The TypeORM DataSource options to use for migrations
 *
 * @throws {Error} If migrations fail to run
 */
export async function runMigrations(dataSourceOptions: DataSourceOptions): Promise<void> {
	const logger = createLogger({ name: "Migration" });

	if (!env.API__RUN_DB_MIGRATIONS) {
		logger.warn(
			"Skipping database migrations since 'API__RUN_DB_MIGRATIONS' configuration is disabled",
		);

		return;
	}

	logger.info("Initializing DataSource for migrations...");

	try {
		const path = await import("node:path");
		const fs = await import("node:fs/promises");

		const dbDir = path.dirname(env.API__DATABASE_PATH);

		await fs.mkdir(dbDir, { recursive: true });
		logger.info(`Ensured database directory exists: ${dbDir}`);

		const { DataSource } = await import("typeorm");
		const migrationDb = new DataSource({
			...dataSourceOptions,
			synchronize: false,
		});

		const dataSource = await migrationDb.initialize();
		logger.info("DataSource initialized successfully");

		const pendingMigrations = await dataSource.showMigrations();
		logger.info(`Pending migrations: ${String(pendingMigrations)}`);

		if (pendingMigrations) {
			logger.info("Running pending migrations...");

			const migrations = await dataSource.runMigrations({ transaction: "all" });

			logger.info(`Successfully ran ${String(migrations.length)} migration(s):`);

			for (const migration of migrations) {
				logger.info(`  - ${migration.name}`);
			}
		} else {
			logger.info("Database schema is up-to-date");
		}

		await dataSource.destroy();

		logger.info("DataSource closed");
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			},
			"Migration failed",
		);

		throw error;
	}
}
