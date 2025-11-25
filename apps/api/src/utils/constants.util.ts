/**
 * @fileoverview API-specific constants.
 *
 * Contains configuration values unique to the API application.
 */

import { LogLevel, RuntimeEnvironment } from "@agro/shared/utils";

import { description, version } from "../../package.json";

/** API Application metadata */
export const APP_INFO = {
	/** Application name */
	name: "Agro Management API",

	/** Application description */
	description,

	/** Current App version */
	version,
} as const;

/** Default pagination limits */
export const PAGINATION = {
	/** Default number of items per page */
	defaultLimit: 20,

	/** Maximum number of items per page */
	maxLimit: 100,

	/** Minimum number of items per page */
	minLimit: 1,
} as const;

/** Request timeout configurations (in milliseconds) */
export const TIMEOUTS = {
	/** Default request timeout */
	default: 30_000,

	/** Database query timeout */
	database: 10_000,

	/** External API call timeout */
	externalApi: 15_000,
} as const;

/** Rate limiting configuration */
export const RATE_LIMIT = {
	/** Maximum requests per window */
	maxRequests: 100,

	/** Time window in milliseconds */
	windowMs: 15 * 60 * 1000, // 15 minutes
} as const;

export const environmentDefaults = {
	NODE_ENV: RuntimeEnvironment.Development,
	LOG_LEVEL: LogLevel.Info,
	LOG_TO_CONSOLE: true,
	API_PORT: 3000,
	API_DATABASE_PATH: "data/agro.db",
	API_BASE_PATH: "/api",
	API_DATABASE_LOGGING: false,
	API_CORS_ORIGIN: "*",
	API_THROTTLE_TTL_MS: 60_000,
	API_THROTTLE_LIMIT: 10,
} as const;
