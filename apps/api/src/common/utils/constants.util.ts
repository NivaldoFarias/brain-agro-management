/**
 * @fileoverview API-specific constants.
 *
 * Contains configuration values unique to the API application.
 */

import { LogLevel, RuntimeEnvironment, SupportedLocale } from "@agro/shared/enums";

import { SeedScale } from "@/database/seeds/seed.constants";

import { description, version } from "../../../package.json";

export const environmentDefaults = {
	NODE_ENV: RuntimeEnvironment.Development,
	API__LOG_LEVEL: LogLevel.Info,
	API__LOG_TO_CONSOLE: true,
	API__PORT: 3000,
	API__BASE_URL: "http://localhost:3000",
	API__DATABASE_PATH: "data/agro.db",
	API__BASE_PATH: "/api",
	API__DATABASE_LOGGING: false,
	API__CORS_ORIGIN: "*",
	API__THROTTLE_TTL_MS: 60_000,
	API__THROTTLE_LIMIT: 10,
	API__RUN_DB_MIGRATIONS: true,
	API__JWT_SECRET: "change-me-in-production-use-minimum-32-characters-secret-key",
	API__JWT_EXPIRATION: "1h",
	API__SEED_DATABASE: false,
	API__SEED_SCALE: SeedScale.Medium,
	API__IBGE_API_BASE_URL: "https://servicodados.ibge.gov.br/api/v1/localidades",
	API__LOCALE: SupportedLocale.Portuguese,
	API__SALT_ROUNDS: 10,
} as const;

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
