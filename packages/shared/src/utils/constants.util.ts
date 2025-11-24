/**
 * Available runtime environments for the application.
 *
 * Maps to `NODE_ENV` and `BUN_ENV` environment variables
 */
export enum RuntimeEnvironment {
	Development = "development",
	Test = "test",
	Staging = "staging",
	Production = "production",
	Benchmark = "benchmark",
}

/** Logging levels used throughout the application */
export enum LogLevel {
	Trace = "trace",
	Debug = "debug",
	Info = "info",
	Warn = "warn",
	Error = "error",
	Fatal = "fatal",
}
