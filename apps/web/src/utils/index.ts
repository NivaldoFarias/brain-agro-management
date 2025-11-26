/**
 * @fileoverview Web application configuration exports.
 *
 * Central export point for all web-specific configuration.
 */

export {
	API_CONFIG,
	APP_INFO,
	STORAGE_KEYS,
	UI_CONFIG,
	environmentDefaults,
	ROUTES,
} from "./constants.util";
export { env } from "./env.util";
export type { WebEnv } from "./env.util";
export { logger } from "./logger.util";
