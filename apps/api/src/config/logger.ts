import { createLogger } from "@agro/shared/utils";

import { env } from "./env";

/**
 * Pre-configured logger instance for the API application.
 *
 * Uses application-specific environment configuration for log level,
 * environment detection, and console output preferences.
 */
export const logger = createLogger({
	name: "api",
	level: env.LOG_LEVEL,
	environment: env.NODE_ENV,
	logToConsole: env.LOG_TO_CONSOLE,
});
