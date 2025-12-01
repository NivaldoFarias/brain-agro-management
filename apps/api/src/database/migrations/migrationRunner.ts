import type { Logger } from "pino";
import type { MigrationInterface, QueryRunner } from "typeorm";

import { createLogger } from "@agro/shared/utils";

/**
 * Database object script definition for CREATE and DROP operations
 *
 * Represents a database object (table, index, constraint) with its
 * creation and deletion SQL statements.
 */
export interface DatabaseObjectScript {
	/** Database object name for logging and identification */
	name: string;

	sql: {
		/** SQL statement to create the object */
		create: string;

		/** SQL statement to drop the object */
		drop: string;
	};
}

/**
 * Custom data manipulation script with up/down logic
 *
 * Allows complex operations like API calls, data transformations,
 * or multi-step processes that can't be expressed as simple SQL.
 */
export interface DataScript {
	/** Human-readable description for logging */
	description: string;

	/** Function to execute during migration up */
	up: (qr: QueryRunner) => Promise<void>;

	/** Optional function to execute during migration down (rollback) */
	down?: (qr: QueryRunner) => Promise<void>;
}

/**
 * Complete migration script structure
 *
 * Organizes all migration operations into logical categories:
 * tables, indexes, and custom data scripts. Executed in order during up(),
 * and in reverse order during down().
 */
export interface MigrationScript {
	/** Table creation/deletion scripts */
	tables?: DatabaseObjectScript[];

	/** Index creation/deletion scripts */
	indexes?: DatabaseObjectScript[];

	/** Custom data manipulation scripts (e.g., seeding, API calls) */
	data?: DataScript[];
}

/**
 * Abstract base class for DRY database migrations
 *
 * Provides centralized logger setup, declarative script structure,
 * and helper methods for executing migrations. All concrete migrations
 * MUST extend this class and implement `defineScripts()`.
 *
 * ## Benefits
 * - **DRY**: Eliminates repetitive query execution code
 * - **Declarative**: Scripts defined as data structures
 * - **Type-safe**: Full TypeScript inference and validation
 * - **Logger centralized**: Automatic setup with migration-specific context
 * - **Testable**: Scripts can be tested independently
 *
 * @example
 * ```typescript
 * export class InitialSchema extends MigrationRunner {
 *   name = "InitialSchema1732406400000";
 *
 *   protected defineScripts(): MigrationScript {
 *     return {
 *       tables: [
 *         {
 *           name: "producers",
 *           createSql: `CREATE TABLE "producers" (...)`,
 *           dropSql: `DROP TABLE "producers"`
 *         }
 *       ],
 *       indexes: [
 *         {
 *           name: "IDX_farms_producer_id",
 *           createSql: `CREATE INDEX "IDX_farms_producer_id" ON "farms" ("producer_id")`,
 *           dropSql: `DROP INDEX "IDX_farms_producer_id"`
 *         }
 *       ]
 *     };
 *   }
 * }
 * ```
 *
 * @see {@link https://typeorm.io/migrations TypeORM Migrations Documentation}
 */
export abstract class MigrationRunner implements MigrationInterface {
	/** Migration name (must match class name for TypeORM tracking) */
	abstract readonly name: string;

	/** Pino logger instance with migration-specific context */
	private _logger?: Logger;

	/**
	 * Gets or creates the logger instance with migration-specific context
	 *
	 * Logger name is derived from the migration class name for easy identification
	 * in logs. Lazily initialized to avoid accessing abstract properties in constructor.
	 *
	 * @returns Configured Pino logger instance
	 */
	protected get logger(): Logger {
		if (!this._logger) this._logger = createLogger({ name: this.name });

		return this._logger;
	}

	/**
	 * Defines migration scripts declaratively
	 *
	 * Concrete migrations MUST implement this method to return their
	 * table, index, and data scripts. Scripts are executed in the order
	 * defined: tables → indexes → data (for up), reversed for down.
	 *
	 * @returns Migration script structure with tables, indexes, and data operations
	 *
	 * @example
	 * ```typescript
	 * protected defineScripts(): MigrationScript {
	 *   return {
	 *     tables: [{ name: "users", createSql: "...", dropSql: "..." }],
	 *     indexes: [{ name: "IDX_users_email", createSql: "...", dropSql: "..." }]
	 *   };
	 * }
	 * ```
	 */
	protected abstract defineScripts(): MigrationScript;

	/**
	 * Executes migration up (applies changes)
	 *
	 * Runs scripts in order: tables → indexes → data.
	 * Each operation is logged for debugging and audit purposes.
	 *
	 * @param qr TypeORM query runner for executing SQL
	 *
	 * @throws {Error} If any script execution fails
	 */
	public async up(qr: QueryRunner): Promise<void> {
		const scripts = this.defineScripts();

		if (scripts.tables?.length) {
			for (const { name, sql } of scripts.tables) {
				this.logger.debug({ table: name }, "Creating table");
				await qr.query(sql.create);
			}
		}

		if (scripts.indexes?.length) {
			for (const { name, sql } of scripts.indexes) {
				this.logger.debug({ index: name }, "Creating index");
				await qr.query(sql.create);
			}
		}

		if (scripts.data?.length) {
			for (const { description, up } of scripts.data) {
				this.logger.debug({ operation: description }, "Executing data script");
				await up(qr);
			}
		}
	}

	/**
	 * Executes migration down (reverts changes)
	 *
	 * Runs scripts in reverse order: data → indexes → tables.
	 * This ensures dependent objects are dropped before their dependencies.
	 *
	 * @param qr TypeORM query runner for executing SQL
	 *
	 * @throws {Error} If any script execution fails
	 */
	public async down(qr: QueryRunner): Promise<void> {
		const scripts = this.defineScripts();

		if (scripts.data?.length) {
			for (const { description, down } of scripts.data.reverse()) {
				if (down) {
					this.logger.debug({ operation: description }, "Reverting data script");
					await down(qr);
				}
			}
		}

		if (scripts.indexes?.length) {
			for (const { name, sql } of scripts.indexes.reverse()) {
				this.logger.debug({ index: name }, "Dropping index");
				await qr.query(sql.drop);
			}
		}

		if (scripts.tables?.length) {
			for (const { name, sql } of scripts.tables.reverse()) {
				this.logger.debug({ table: name }, "Dropping table");
				await qr.query(sql.drop);
			}
		}
	}
}
