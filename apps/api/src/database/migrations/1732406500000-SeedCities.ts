import type { MigrationScript } from "./migrationRunner";

import { MigrationRunner } from "./migrationRunner";

/**
 * Creates cities table schema for Brazilian municipalities
 *
 * Defines the database structure for storing city data with IBGE codes.
 * City data seeding is handled separately by the SeedService in the
 * application layer, following the separation of concerns principle:
 * - Migrations = Schema changes only
 * - Seeds = Application data
 *
 * @see {@link SeedService.seedCities} for city data population
 */
export class SeedCities1732406500000 extends MigrationRunner {
	name = "SeedCities1732406500000";

	/**
	 * Defines cities table and indexes (schema only)
	 *
	 * Creates the cities table structure for storing Brazilian municipalities.
	 * City data seeding (IBGE API) is handled by SeedService in the application layer.
	 *
	 * @returns Migration script with table and index definitions
	 */
	protected defineScripts(): MigrationScript {
		return {
			tables: [
				{
					name: "cities",
					sql: {
						create: `
							CREATE TABLE "cities" (
								"id" varchar PRIMARY KEY NOT NULL,
								"name" varchar(255) NOT NULL,
								"state" varchar(2) NOT NULL,
								"ibge_code" varchar(7) NOT NULL,
								"created_at" datetime NOT NULL DEFAULT (datetime('now')),
								"updated_at" datetime NOT NULL DEFAULT (datetime('now')),
								CONSTRAINT "UQ_cities_ibge_code" UNIQUE ("ibge_code")
							)
						`,
						drop: `DROP TABLE "cities"`,
					},
				},
			],
			indexes: [
				{
					name: "IDX_cities_state",
					sql: {
						create: `CREATE INDEX "IDX_cities_state" ON "cities" ("state")`,
						drop: `DROP INDEX "IDX_cities_state"`,
					},
				},
				{
					name: "IDX_cities_name_state",
					sql: {
						create: `CREATE INDEX "IDX_cities_name_state" ON "cities" ("name", "state")`,
						drop: `DROP INDEX "IDX_cities_name_state"`,
					},
				},
			],
		};
	}
}
