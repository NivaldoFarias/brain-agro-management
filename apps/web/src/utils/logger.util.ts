/* eslint-disable no-console */
import { LogLevel, RuntimeEnvironment } from "@agro/shared/enums";

import { env } from "./env.util";

/** Configuration options for Logger instance */
export interface LoggerOptions {
	/**
	 * Context/prefix to prepend to all log messages
	 *
	 * @example
	 * ```typescript
	 * const logger = new Logger({ context: 'MyModule' });
	 * logger.info('This is a log message');
	 * // Output: [MyModule] This is a log message
	 * ```
	 */
	context?: string;

	/**
	 * Custom timestamp format function
	 *
	 * @example
	 * ```typescript
	 * const logger = new Logger({ timestampFormat: () => new Date().toISOString() });
	 * logger.info('This is a log message with a timestamp');
	 * // Output: [2024-04-27T12:34:56.789Z] This is a log message with a timestamp
	 * ```
	 */
	timestampFormat?: () => string;

	/** Whether to include timestamps in logs */
	includeTimestamp?: boolean;
}

/**
 * Browser-based logger with context, formatting, and environment-aware output.
 *
 * Provides structured logging with automatic silencing based on {@link env.NODE_ENV|environment}
 * and {@link env.WEB__LOG_LEVEL|Log Level} configuration. Supports context prefixes, grouped logs,
 * and common console methods.
 *
 * @example
 * ```typescript
 * const logger = new Logger({ context: 'UserService' });
 * logger.info('User logged in', { userId: '123' });
 * // Output: [UserService] User logged in { userId: '123' }
 *
 * const childLogger = logger.child('AuthModule');
 * childLogger.debug('Validating token');
 * // Output: [UserService:AuthModule] Validating token
 * ```
 */
export class Logger {
	/** Internal logger options */
	private readonly options: Required<LoggerOptions>;

	/**
	 * Creates a new Logger instance with optional configuration.
	 *
	 * @param options Logger configuration options
	 */
	constructor(options: LoggerOptions = {}) {
		this.options = {
			context: options.context ?? "",
			timestampFormat: options.timestampFormat ?? this.defaultTimestampFormat.bind(this),
			includeTimestamp: options.includeTimestamp ?? false,
		};
	}

	/**
	 * Creates a child logger with an additional context suffix.
	 *
	 * @param childContext Context to append to parent context
	 *
	 * @returns New Logger instance with combined context
	 *
	 * @example
	 * ```typescript
	 * const parent = new Logger({ context: 'App' });
	 * const child = parent.child('Auth');
	 * child.info('User authenticated'); // [App:Auth] User authenticated
	 * ```
	 */
	public child(childContext: string): Logger {
		return new Logger({
			context: this.options.context ? `${this.options.context}:${childContext}` : childContext,
			timestampFormat: this.options.timestampFormat,
			includeTimestamp: this.options.includeTimestamp,
		});
	}

	/**
	 * Logs informational messages.
	 *
	 * Silenced in production when {@link env.WEB__LOG_LEVEL|Log Level} is set to {@link LogLevel.Error|Error}.
	 *
	 * @param args Messages and data to log
	 */
	public info(...args: unknown[]): void {
		if (this.shouldSilence(LogLevel.Info)) return;

		console.info(...this.formatMessage(...args));
	}

	/**
	 * Logs warning messages.
	 *
	 * Silenced in production when {@link env.WEB__LOG_LEVEL|Log Level} is set to {@link LogLevel.Error|Error}.
	 *
	 * @param args Messages and data to log
	 */
	public warn(...args: unknown[]): void {
		if (this.shouldSilence(LogLevel.Warn)) return;

		console.warn(...this.formatMessage(...args));
	}

	/**
	 * Logs error messages.
	 *
	 * Always logged regardless of environment or log level.
	 *
	 * @param args Error messages and data to log
	 */
	public error(...args: unknown[]): void {
		console.error(...this.formatMessage(...args));
	}

	/**
	 * Logs debug messages.
	 *
	 * Only shown in development or when {@link env.WEB__LOG_LEVEL|Log Level} is set to {@link LogLevel.Debug|Debug}.
	 *
	 * @param args Debug messages and data to log
	 */
	public debug(...args: unknown[]): void {
		if (this.shouldSilence(LogLevel.Debug)) return;

		console.debug(...this.formatMessage(...args));
	}

	/**
	 * Logs data in tabular format.
	 *
	 * Useful for arrays of objects or structured data visualization.
	 *
	 * @param data The data to display in table format
	 * @param columns Optional array of column names to display
	 */
	public table(data: unknown, columns?: string[]): void {
		if (this.shouldSilence(LogLevel.Info)) return;

		if (this.options.context) {
			console.group(...this.formatMessage(""));
			console.table(data, columns);
			console.groupEnd();
		} else {
			console.table(data, columns);
		}
	}

	/**
	 * Creates a collapsible log group.
	 *
	 * Useful for organizing related log messages together.
	 *
	 * @param label Optional label for the log group
	 *
	 * @example
	 * ```typescript
	 * logger.group('API Request');
	 * logger.info('URL:', url);
	 * logger.info('Headers:', headers);
	 * logger.groupEnd();
	 * ```
	 */
	public group(label?: string): void {
		if (this.shouldSilence(LogLevel.Info)) return;

		console.group(...this.formatMessage(label ?? ""));
	}

	/**
	 * Creates a collapsed log group (expanded on click).
	 *
	 * @param label Optional label for the collapsed log group
	 */
	public groupCollapsed(label?: string): void {
		if (this.shouldSilence(LogLevel.Info)) return;

		console.groupCollapsed(...this.formatMessage(label ?? ""));
	}

	/** Ends the current log group. */
	public groupEnd(): void {
		if (this.shouldSilence(LogLevel.Info)) return;

		console.groupEnd();
	}

	/**
	 * Logs a message with timing information.
	 *
	 * Creates a timer that can be ended with {@link timeEnd}.
	 *
	 * @param label Unique label for the timer
	 */
	public time(label: string): void {
		if (this.shouldSilence(LogLevel.Debug)) return;

		console.time(this.addContext(label));
	}

	/**
	 * Ends a timer started with {@link time}.
	 *
	 * @param label Label of the timer to end (must match the label used in `time`)
	 */
	public timeEnd(label: string): void {
		if (this.shouldSilence(LogLevel.Debug)) return;

		console.timeEnd(this.addContext(label));
	}

	/**
	 * Logs current stack trace.
	 *
	 * Useful for debugging call hierarchies.
	 *
	 * @param args Additional messages or data to log with the stack trace
	 */
	public trace(...args: unknown[]): void {
		if (this.shouldSilence(LogLevel.Debug)) return;

		console.trace(...this.formatMessage(...args));
	}

	/**
	 * Asserts a condition and logs an error if false.
	 *
	 * @param condition Condition to assert
	 * @param args Message and data to log if assertion fails
	 */
	public assert(condition: boolean, ...args: unknown[]): void {
		if (this.shouldSilence(LogLevel.Error)) return;

		console.assert(condition, ...this.formatMessage(...args));
	}

	/**
	 * Default timestamp format: `HH:MM:SS.mmm`
	 *
	 * @returns Formatted timestamp string
	 */
	private defaultTimestampFormat(): string {
		return new Date().toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			fractionalSecondDigits: 3,
		});
	}

	/**
	 * Formats log message with context and optional timestamp.
	 *
	 * @param args Raw arguments to format
	 *
	 * @returns Formatted arguments array with prefixes prepended
	 */
	private formatMessage(...args: unknown[]): unknown[] {
		const prefix: string[] = [];

		if (this.options.includeTimestamp) {
			prefix.push(`[${this.options.timestampFormat()}]`);
		}

		if (this.options.context) {
			prefix.push(`[${this.options.context}]`);
		}

		return prefix.length > 0 ? [prefix.join(" "), ...args] : args;
	}

	/**
	 * Adds context prefix to a string label.
	 *
	 * @param label The label to add context to
	 *
	 * @returns Label with context prefix if context exists, otherwise original label
	 */
	private addContext(label: string): string {
		return this.options.context ? `[${this.options.context}] ${label}` : label;
	}

	/**
	 * Determines if a log at the given level should be silenced.
	 *
	 * Logic:
	 * - Errors are never silenced
	 * - In production with Error log level, silence Info/Warn/Debug
	 * - In development, show all levels
	 *
	 * @param level The log level to check
	 *
	 * @returns `true` if the log should be silenced, `false` otherwise
	 */
	private shouldSilence(level: LogLevel): boolean {
		const isProduction = env.NODE_ENV === RuntimeEnvironment.Production;
		const configuredLevel = env.WEB__LOG_LEVEL;

		if (level === LogLevel.Error) return false;

		if (isProduction && configuredLevel === LogLevel.Error) {
			return true;
		}

		if (!isProduction) return false;

		return false;
	}
}

/**
 * Default application logger instance.
 *
 * Use this for general application logging or create specific
 * loggers with context using `new Logger({ context: 'YourModule' })`.
 */
export const logger = new Logger();
