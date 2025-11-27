/**
 * @fileoverview Web application constants.
 *
 * Contains configuration values unique to the frontend application.
 */

import { LogLevel, RuntimeEnvironment } from "@agro/shared/utils";

import { description, version } from "../../package.json";

/**
 * Route constants for Brain Agriculture application.
 *
 * Centralized route definitions to avoid magic strings and enable
 * type-safe navigation throughout the application.
 */
export const ROUTES = {
	home: "/",
	dashboard: "/dashboard",
	auth: {
		login: "/login",
	},
	producers: {
		list: "/producers",
		create: "/producers/new",
		edit: (id: string): string => `/producers/${id}/edit`,
		view: (id: string): string => `/producers/${id}`,
	},
	farms: {
		list: "/farms",
		create: "/farms/new",
		edit: (id: string): string => `/farms/${id}/edit`,
		view: (id: string): string => `/farms/${id}`,
	},
} as const;

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
	WEB__LOG_LEVEL: LogLevel.Info,
	WEB__LOG_TO_CONSOLE: true,
	WEB__VITE_API_BASE_URL: "http://localhost:3000/api",
	WEB__VITE_ENABLE_DEVTOOLS: false,
	WEB__PORT: 5173,
	WEB__HOST: "localhost",
	WEB__PREVIEW_PORT: 4173,
} as const;
