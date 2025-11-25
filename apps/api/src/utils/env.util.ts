import { createEnv, LogLevel, RuntimeEnvironment } from "@agro/shared/utils";
import { z } from "zod";

import { environmentDefaults } from "./constants.util";

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
	LOG_LEVEL: z.enum(LogLevel).default(environmentDefaults.LOG_LEVEL),

	/** Whether to enable console logging in addition to file logging (shared) */
	LOG_TO_CONSOLE: z.stringbool().default(environmentDefaults.LOG_TO_CONSOLE),

	/** Port the API server will listen on */
	API_PORT: z.coerce.number().int().positive().default(environmentDefaults.API_PORT),

	/** Database connection URL */
	API_DATABASE_PATH: z.string().default(environmentDefaults.API_DATABASE_PATH),

	/** API base path (e.g., "/api/v1") */
	API_BASE_PATH: z.string().default(environmentDefaults.API_BASE_PATH),

	/** Whether to enable database query logging */
	API_DATABASE_LOGGING: z.stringbool().default(environmentDefaults.API_DATABASE_LOGGING),

	/** CORS origin for the API */
	API_CORS_ORIGIN: z.string().nullable().default(environmentDefaults.API_CORS_ORIGIN),

	/** Throttle time-to-live in milliseconds */
	API_THROTTLE_TTL_MS: z.coerce
		.number()
		.int()
		.positive()
		.default(environmentDefaults.API_THROTTLE_TTL_MS),

	/** Throttle maximum request limit */
	API_THROTTLE_LIMIT: z.coerce
		.number()
		.int()
		.positive()
		.default(environmentDefaults.API_THROTTLE_LIMIT),
});

/** Type-safe environment variables for the API application */
export type ApiEnv = z.infer<typeof apiEnvSchema>;

/** Validated environment configuration for the API */
export const env = createEnv(apiEnvSchema);
