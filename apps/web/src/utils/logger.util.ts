import { createLogger } from "@agro/shared/utils";

import { env } from "./env.util";

/**
 * Pre-configured logger instance for the web application.
 *
 * Uses application-specific environment configuration for log level,
 * environment detection, and console output preferences.
 */
export const logger = createLogger({
	name: "web",
	level: env.WEB__LOG_LEVEL,
	environment: env.NODE_ENV,
	logToConsole: env.WEB__LOG_TO_CONSOLE,
});
