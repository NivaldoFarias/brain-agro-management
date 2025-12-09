import type { MigrationScript } from "./migrationRunner";

import { MigrationRunner } from "./migrationRunner";

/**
 * Migration to create users table for authentication
 *
 * Creates the users table with email, password (bcrypt-hashed), name, and status fields.
 * Passwords are stored as bcrypt hashes (60-char strings) for secure authentication.
 *
 * ## Security Features
 * - Unique email constraint prevents duplicate accounts
 * - `isActive` flag for soft account disabling
 * - Password field NEVER exposed in default queries (use `select: false` in entity)
 *
 * ## Indexes
 * - Unique index on email for fast authentication lookups
 * - Index on `isActive` for filtering active users
 *
 * @see {@link User} entity for TypeORM configuration
 * @see {@link AuthService.validateCredentials} for authentication flow
 */
export class CreateUsersTable1733702400000 extends MigrationRunner {
	name = "CreateUsersTable1733702400000";

	/**
	 * Defines users table and indexes for JWT authentication
	 *
	 * @returns Migration script with table and index definitions
	 */
	protected defineScripts(): MigrationScript {
		return {
			tables: [
				{
					name: "users",
					sql: {
						create: `
							CREATE TABLE "users" (
								"id" varchar PRIMARY KEY NOT NULL,
								"email" varchar(255) NOT NULL,
								"name" varchar(255) NOT NULL,
								"password" varchar(255) NOT NULL,
								"is_active" boolean NOT NULL DEFAULT 1,
								"created_at" datetime NOT NULL DEFAULT (datetime('now')),
								"updated_at" datetime NOT NULL DEFAULT (datetime('now')),
								CONSTRAINT "UQ_users_email" UNIQUE ("email")
							)
						`,
						drop: `DROP TABLE "users"`,
					},
				},
			],
			indexes: [
				{
					name: "IDX_users_email",
					sql: {
						create: `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`,
						drop: `DROP INDEX "IDX_users_email"`,
					},
				},
				{
					name: "IDX_users_is_active",
					sql: {
						create: `CREATE INDEX "IDX_users_is_active" ON "users" ("is_active")`,
						drop: `DROP INDEX "IDX_users_is_active"`,
					},
				},
			],
		};
	}
}
