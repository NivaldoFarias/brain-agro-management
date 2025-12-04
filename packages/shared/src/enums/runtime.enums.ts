/**
 * Available runtime environments for the application.
 *
 * Maps to `NODE_ENV` and `BUN_ENV` environment variables
 */
export enum RuntimeEnvironment {
	/** Development environment */
	Development = "development",

	/** Test environment */
	Test = "test",

	/** Staging environment */
	Staging = "staging",

	/** Production environment */
	Production = "production",

	/** Benchmark environment */
	Benchmark = "benchmark",

	/** Build-time environment */
	Build = "build",

	/** Seed environment for database seeding */
	Seed = "seed",
}

/** Logging levels used throughout the application */
export enum LogLevel {
	/** Trace level for detailed debugging information */
	Trace = "trace",

	/** Debug level for general debugging information */
	Debug = "debug",

	/** Info level for informational messages */
	Info = "info",

	/** Warn level for warning messages */
	Warn = "warn",

	/** Error level for error messages */
	Error = "error",

	/** Fatal level for critical errors causing application shutdown */
	Fatal = "fatal",
}

/**
 * Supported application locales
 *
 * Uses underscore notation for backend compatibility (e.g., pt_BR) and
 * standard ISO codes for English.
 */
export enum SupportedLocale {
	/** Portuguese (Brazil) */
	Portuguese = "pt_BR",

	/** English (International) */
	English = "en",
}
