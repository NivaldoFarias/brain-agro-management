/**
 * @fileoverview Web application constants.
 *
 * Contains configuration values unique to the frontend application.
 */

import { LogLevel, RuntimeEnvironment } from "@agro/shared/utils";

import { description, version } from "../../package.json";

/** Application metadata */
export const APP_INFO = {
	/** Application name */
	name: "Agro Management",

	/** Application description */
	description,

	/** Current App version */
	version,
} as const;

/** UI configuration */
export const UI_CONFIG = {
	/** Default table page size */
	tablePageSize: 10,

	/** Available table page size options */
	tablePageSizeOptions: [10, 20, 50, 100],

	/** Debounce delay for search inputs (ms) */
	searchDebounceMs: 300,

	/** Toast notification duration (ms) */
	toastDurationMs: 5000,
} as const;

/** API request configuration */
export const API_CONFIG = {
	/** Request timeout (ms) */
	timeoutMs: 30_000,

	/** Number of retry attempts for failed requests */
	retryAttempts: 3,

	/** Delay between retries (ms) */
	retryDelayMs: 1000,
} as const;

/** Storage keys for localStorage/sessionStorage */
export const STORAGE_KEYS = {
	/** Theme preference (light/dark) */
	theme: "agro:theme",

	/** User authentication token */
	authToken: "agro:auth:token",

	/** User preferences */
	userPreferences: "agro:user:preferences",
} as const;

export const environmentDefaults = {
	NODE_ENV: RuntimeEnvironment.Development,
	API__LOG_LEVEL: LogLevel.Info,
	API__LOG_TO_CONSOLE: true,
	VITE_API_BASE_URL: "http://localhost:3000/api",
	VITE_ENABLE_DEVTOOLS: false,
} as const;
