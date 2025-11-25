import { z } from "zod";

import { createEnv, LogLevel, RuntimeEnvironment } from "@agro/shared/utils";

import { environmentDefaults } from "../utils/constants.util";

/**
 * API-specific environment schema.
 *
 * Defines and validates all environment variables required for the API application.
 * API-specific variables use the `API_` prefix for clarity.
 */
const apiEnvSchema = z.object({
	/** Node.js runtime environment (shared) */
	NODE_ENV: z.enum(RuntimeEnvironment).default(environmentDefaults.NODE_ENV),

	/** Logging level for the application (shared) */
	API__LOG_LEVEL: z.enum(LogLevel).default(environmentDefaults.API__LOG_LEVEL),

	/** Whether to enable console logging in addition to file logging (shared) */
	API__LOG_TO_CONSOLE: z.stringbool().default(environmentDefaults.API__LOG_TO_CONSOLE),

	/** Port the API server will listen on */
	API__PORT: z.coerce.number().int().positive().default(environmentDefaults.API__PORT),

	/** Database connection URL */
	API__DATABASE_PATH: z.string().default(environmentDefaults.API__DATABASE_PATH),

	/** API base path (e.g., "/api/v1") */
	API__BASE_PATH: z.string().default(environmentDefaults.API__BASE_PATH),

	/** Whether to enable database query logging */
	API__DATABASE_LOGGING: z.stringbool().default(environmentDefaults.API__DATABASE_LOGGING),

	/** CORS origin for the API */
	API__CORS_ORIGIN: z.string().nullable().default(environmentDefaults.API__CORS_ORIGIN),

	/** Throttle time-to-live in milliseconds */
	API__THROTTLE_TTL_MS: z.coerce
		.number()
		.int()
		.positive()
		.default(environmentDefaults.API__THROTTLE_TTL_MS),

	/** Throttle maximum request limit */
	API__THROTTLE_LIMIT: z.coerce
		.number()
		.int()
		.positive()
		.default(environmentDefaults.API__THROTTLE_LIMIT),

	API__RUN_DB_MIGRATIONS: z.stringbool().default(environmentDefaults.API__RUN_DB_MIGRATIONS),

	/** JWT secret key for token signing */
	API__JWT_SECRET: z.string().min(32).default(environmentDefaults.API__JWT_SECRET),

	/** JWT token expiration time (e.g., "1h", "7d", "30m") */
	API__JWT_EXPIRATION: z.string().default(environmentDefaults.API__JWT_EXPIRATION),
});

/** Type-safe environment variables for the API application */
export type ApiEnv = z.infer<typeof apiEnvSchema>;

/** Validated environment configuration for the API */
export const env = createEnv(apiEnvSchema);
