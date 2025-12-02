/**
 * Health check response interfaces.
 *
 * Provides strongly-typed responses for health check endpoints,
 * enabling better monitoring, alerting, and debugging capabilities.
 *
 * @module health/interfaces
 */

/**
 * Overall health status indicator.
 */
export type HealthStatus = "ok" | "error" | "shutting_down";

/**
 * Individual component/dependency status.
 */
export type ComponentStatus = "up" | "down";

/**
 * Database health information.
 */
export interface DatabaseHealth {
	/** Database connection status */
	status: ComponentStatus;

	/** Response time in milliseconds */
	responseTime?: number;

	/** Database type (e.g., 'sqlite', 'postgres') */
	type?: string;

	/** Database file path or connection string (sanitized) */
	connection?: string;

	/** Total number of tables in database */
	tableCount?: number;

	/** Whether migrations are up to date */
	migrationsApplied?: boolean;
}

/**
 * Memory usage information.
 */
export interface MemoryHealth {
	/** Memory status */
	status: ComponentStatus;

	/** Used memory in bytes */
	used: number;

	/** Total available memory in bytes */
	total: number;

	/** Memory usage percentage (0-100) */
	usagePercent: number;

	/** Heap used in bytes */
	heapUsed: number;

	/** Heap total in bytes */
	heapTotal: number;
}

/**
 * Disk usage information.
 */
export interface DiskHealth {
	/** Disk status */
	status: ComponentStatus;

	/** Database file size in bytes */
	dbSize: number;

	/** Database file size in human-readable format */
	dbSizeFormatted: string;

	/** Path to database file */
	path: string;
}

/**
 * Application uptime information.
 */
export interface UptimeInfo {
	/** Application start time (ISO 8601) */
	startTime: string;

	/** Uptime in seconds */
	uptimeSeconds: number;

	/** Uptime in human-readable format */
	uptimeFormatted: string;
}

/**
 * Basic health check response (liveness probe).
 *
 * Minimal response for simple liveness checks that verify
 * the application process is running and responsive.
 */
export interface BasicHealthResponse {
	/** Overall application health status */
	status: HealthStatus;

	/** Application uptime information */
	uptime: UptimeInfo;

	/** Timestamp of health check (ISO 8601) */
	timestamp: string;
}

/**
 * Detailed readiness check response.
 *
 * Comprehensive response including all dependencies and system
 * metrics for readiness probes and monitoring dashboards.
 */
export interface DetailedHealthResponse extends BasicHealthResponse {
	/** Database health and connectivity */
	database: DatabaseHealth;

	/** Memory usage metrics */
	memory: MemoryHealth;

	/** Disk usage metrics */
	disk: DiskHealth;

	/** Application version */
	version: string;

	/** Node.js version */
	nodeVersion: string;
}

/**
 * Health check error response.
 *
 * Returned when health checks fail with detailed error information.
 */
export interface HealthErrorResponse {
	/** Error status */
	status: "error";

	/** Error message */
	message: string;

	/** Timestamp of failure (ISO 8601) */
	timestamp: string;

	/** Failed components/checks */
	failures: Array<{
		component: string;
		error: string;
	}>;
}
