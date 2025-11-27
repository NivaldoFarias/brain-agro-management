import process from "node:process";

import pino from "pino";

import { LogLevel, RuntimeEnvironment } from "./constants.util";

/** Configuration options for creating a logger instance */
export interface LoggerConfig {
	/** Logger name/context (e.g., `"api"`, `"web"`) */
	name: string;

	/**
	 * Minimum log level to output
	 *
	 * @default LogLevel.Info
	 * @see {@link LogLevel}
	 */
	level?: LogLevel;

	/**
	 * Current runtime environment
	 *
	 * @default RuntimeEnvironment.Development
	 * @see {@link RuntimeEnvironment}
	 */
	environment?: RuntimeEnvironment;

	/**
	 * Whether to enable console output (in addition to file logging)
	 *
	 * @default true
	 */
	logToConsole?: boolean;

	/**
	 * Directory path where log files will be stored.
	 *
	 * Each app (api, web) should provide its own logs directory.
	 * Example: `apps/api/logs` or `apps/web/logs`
	 *
	 * @default `./logs` (relative to current working directory)
	 */
	logsDir?: string;

	/**
	 * Custom log file path (overrides logsDir if provided)
	 *
	 * @default `${logsDir}/${timestamp}.pino.log`
	 */
	logFilePath?: string;
}

/**
 * Creates a configured Pino logger instance with structured logging.
 *
 * Supports both file and console transports with conditional formatting based
 * on environment. File logs are always JSON-structured, while console logs use
 * pretty-printing in non-production environments.
 *
 * Each application should provide its own `logsDir` to keep logs organized by app.
 *
 * @param config Logger configuration options
 * @returns Configured Pino logger instance
 *
 * @example
 * ```typescript
 * import { createLogger, LogLevel, RuntimeEnvironment } from "@agro/shared/utils";
 *
 * const logger = createLogger({
 *   name: "api",
 *   level: LogLevel.Info,
 *   environment: RuntimeEnvironment.Development,
 *   logToConsole: true,
 *   logsDir: "apps/api/logs",
 * });
 *
 * logger.info("Server started");
 * logger.error({ err }, "Request failed");
 * ```
 */
export function createLogger(config: LoggerConfig): pino.Logger {
	const {
		name,
		level = LogLevel.Info,
		environment = RuntimeEnvironment.Development,
		logToConsole = true,
		logsDir = "./logs",
		logFilePath,
	} = config;

	const defaultLogPath = `${logsDir}/${new Date().toISOString().replaceAll(":", "-")}.pino.log`;

	const fileTransport = {
		target: "pino/file",
		level: LogLevel.Debug,
		options: {
			destination: logFilePath ?? defaultLogPath,
			mkdir: true,
		},
	};

	const consoleTransport = {
		target: "pino-pretty",
		options: {
			colorize: true,
			translateTime: "HH:MM:ss Z",
			ignore: "pid,hostname",
		},
	};

	const shouldEnableConsoleTransport =
		logToConsole && environment !== RuntimeEnvironment.Production;

	/**
	 * Uses try-catch to handle Vite externalization in browser context.
	 *
	 * In browser builds, `process` may be undefined, so we fallback to a random PID.
	 */
	let processId: number;
	try {
		processId = process.pid;
	} catch {
		processId = Math.floor(Math.random() * 10_000);
	}

	return pino({
		name,
		level,
		timestamp: pino.stdTimeFunctions.isoTime,
		serializers: {
			err: pino.stdSerializers.err,
		},
		base: {
			pid: processId,
			hostname: undefined,
		},
		transport: {
			targets: [fileTransport, ...(shouldEnableConsoleTransport ? [consoleTransport] : [])],
		},
	});
}
