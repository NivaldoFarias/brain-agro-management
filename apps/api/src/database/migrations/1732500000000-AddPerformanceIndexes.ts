import type { MigrationInterface, QueryRunner } from "typeorm";

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
export class AddPerformanceIndexes1732500000000 implements MigrationInterface {
	name = "AddPerformanceIndexes1732500000000";

	/**
	 * Creates performance indexes on frequently queried columns
	 *
	 * @param queryRunner - TypeORM query runner for executing SQL
	 */
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Index for farms.state - used in dashboard state distribution
		await queryRunner.query(`
			CREATE INDEX "IDX_farms_state" ON "farms" ("state")
		`);

		// Index for farm_harvest_crops.crop_type - used in dashboard crop distribution
		await queryRunner.query(`
			CREATE INDEX "IDX_farm_harvest_crops_crop_type" ON "farm_harvest_crops" ("crop_type")
		`);

		// Note: producers.document already has a unique constraint which creates an implicit index
		// Note: farms.producer_id already has an index from InitialSchema migration
	}

	/**
	 * Drops performance indexes
	 *
	 * @param queryRunner - TypeORM query runner for executing SQL
	 */
	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_farm_harvest_crops_crop_type"`);
		await queryRunner.query(`DROP INDEX "IDX_farms_state"`);
	}
}
