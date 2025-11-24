import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Initial database schema migration
 *
 * Creates all tables for the agricultural management system:
 * - producers: Rural producers (CPF/CNPJ holders)
 * - farms: Agricultural properties with area information
 * - harvests: Agricultural seasons/cycles
 * - farm_harvests: Junction table for farm-harvest relationships
 * - farm_harvest_crops: Crops planted per farm-harvest
 *
 * Business Rules Enforced:
 * - CPF/CNPJ uniqueness
 * - Harvest year uniqueness
 * - Foreign key constraints for referential integrity
 *
 * @see {@link /docs/DATABASE_SCHEMA.md} for complete schema documentation
 */
export class InitialSchema1732406400000 implements MigrationInterface {
	name = "InitialSchema1732406400000";

	/**
	 * Creates all database tables and indexes
	 *
	 * @param queryRunner - TypeORM query runner for executing SQL
	 */
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            CREATE TABLE "producers" (
                "id" varchar PRIMARY KEY NOT NULL,
                "document" varchar(14) NOT NULL,
                "name" varchar(255) NOT NULL,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
                CONSTRAINT "UQ_producers_document" UNIQUE ("document")
            )
        `);

		await queryRunner.query(`
            CREATE TABLE "farms" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar(255) NOT NULL,
                "city" varchar(255) NOT NULL,
                "state" varchar(2) NOT NULL,
                "total_area" decimal(10,2) NOT NULL,
                "arable_area" decimal(10,2) NOT NULL,
                "vegetation_area" decimal(10,2) NOT NULL,
                "producer_id" varchar NOT NULL,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
                CONSTRAINT "FK_farms_producer" FOREIGN KEY ("producer_id") 
                    REFERENCES "producers" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

		await queryRunner.query(`
            CREATE INDEX "IDX_farms_producer_id" ON "farms" ("producer_id")
        `);

		await queryRunner.query(`
            CREATE TABLE "harvests" (
                "id" varchar PRIMARY KEY NOT NULL,
                "year" varchar(20) NOT NULL,
                "description" text,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
                CONSTRAINT "UQ_harvests_year" UNIQUE ("year")
            )
        `);

		await queryRunner.query(`
            CREATE TABLE "farm_harvests" (
                "id" varchar PRIMARY KEY NOT NULL,
                "farm_id" varchar NOT NULL,
                "harvest_id" varchar NOT NULL,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
                CONSTRAINT "FK_farm_harvests_farm" FOREIGN KEY ("farm_id") 
                    REFERENCES "farms" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_farm_harvests_harvest" FOREIGN KEY ("harvest_id") 
                    REFERENCES "harvests" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

		await queryRunner.query(`
            CREATE INDEX "IDX_farm_harvests_farm_id" ON "farm_harvests" ("farm_id")
        `);

		await queryRunner.query(`
            CREATE INDEX "IDX_farm_harvests_harvest_id" ON "farm_harvests" ("harvest_id")
        `);

		await queryRunner.query(`
            CREATE TABLE "farm_harvest_crops" (
                "id" varchar PRIMARY KEY NOT NULL,
                "farm_harvest_id" varchar NOT NULL,
                "crop_type" varchar(50) NOT NULL,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
                CONSTRAINT "FK_farm_harvest_crops_farm_harvest" FOREIGN KEY ("farm_harvest_id") 
                    REFERENCES "farm_harvests" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

		await queryRunner.query(`
            CREATE INDEX "IDX_farm_harvest_crops_farm_harvest_id" 
            ON "farm_harvest_crops" ("farm_harvest_id")
        `);
	}

	/**
	 * Drops all database tables in reverse order
	 *
	 * @param queryRunner - TypeORM query runner for executing SQL
	 */
	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_farm_harvest_crops_farm_harvest_id"`);
		await queryRunner.query(`DROP TABLE "farm_harvest_crops"`);

		await queryRunner.query(`DROP INDEX "IDX_farm_harvests_harvest_id"`);
		await queryRunner.query(`DROP INDEX "IDX_farm_harvests_farm_id"`);
		await queryRunner.query(`DROP TABLE "farm_harvests"`);

		await queryRunner.query(`DROP TABLE "harvests"`);

		await queryRunner.query(`DROP INDEX "IDX_farms_producer_id"`);
		await queryRunner.query(`DROP TABLE "farms"`);

		await queryRunner.query(`DROP TABLE "producers"`);
	}
}
