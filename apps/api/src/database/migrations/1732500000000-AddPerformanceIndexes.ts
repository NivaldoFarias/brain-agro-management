import type { MigrationScript } from "./migrationRunner";

import { MigrationRunner } from "./migrationRunner";

/**
 * Migration to add performance indexes on frequently queried columns
 *
 * Adds indexes to improve query performance for common operations:
 * - `farms.state` - For filtering/grouping farms by Brazilian state
 * - `farm_harvest_crops.crop_type` - For crop distribution aggregations
 * - `producers.document` already has unique constraint (implicit index)
 *
 * ## Performance Impact
 * - Speeds up dashboard statistics queries (by state, by crop)
 * - Improves farm filtering operations
 * - Minimal write overhead due to low update frequency
 *
 * ## Query Patterns Optimized
 * - `SELECT ... FROM farms WHERE state = ?`
 * - `SELECT state, COUNT(*) FROM farms GROUP BY state`
 * - `SELECT crop_type, COUNT(*) FROM farm_harvest_crops GROUP BY crop_type`
 *
 * @see {@link https://www.sqlite.org/queryplanner.html} for SQLite query optimization
 */
export class AddPerformanceIndexes1732500000000 extends MigrationRunner {
	name = "AddPerformanceIndexes1732500000000";

	/**
	 * Defines performance indexes for frequently queried columns
	 *
	 * @returns Migration script with index definitions
	 */
	protected defineScripts(): MigrationScript {
		return {
			indexes: [
				{
					name: "IDX_farms_state",
					sql: {
						create: `CREATE INDEX "IDX_farms_state" ON "farms" ("state")`,
						drop: `DROP INDEX "IDX_farms_state"`,
					},
				},
				{
					name: "IDX_farm_harvest_crops_crop_type",
					sql: {
						create: `CREATE INDEX "IDX_farm_harvest_crops_crop_type" ON "farm_harvest_crops" ("crop_type")`,
						drop: `DROP INDEX "IDX_farm_harvest_crops_crop_type"`,
					},
				},
			],
		};
	}
}
