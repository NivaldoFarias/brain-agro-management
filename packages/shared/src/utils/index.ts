/**
 * @fileoverview Shared utility functions.
 *
 * Common utilities used across the Agro Management system.
 */

import pino from "pino";

/**
 * Creates a configured logger instance with structured logging.
 *
 * @param name The logger name/context
 * @returns Configured Pino logger instance
 *
 * @example
 * ```typescript
 * const logger = createLogger("api");
 * logger.info("Server started");
 * ```
 */
export function createLogger(name: string): pino.Logger {
	return pino({
		name,
		level: process.env["LOG_LEVEL"] ?? "info",
		transport:
			process.env["NODE_ENV"] !== "production" ?
				{
					target: "pino-pretty",
					options: {
						colorize: true,
						translateTime: "HH:MM:ss Z",
						ignore: "pid,hostname",
					},
				}
			:	undefined,
	});
}
