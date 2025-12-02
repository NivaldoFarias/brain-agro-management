import fs from "node:fs";
import os from "node:os";

import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import type {
	BasicHealthResponse,
	ComponentStatus,
	DatabaseHealth,
	DetailedHealthResponse,
	DiskHealth,
	MemoryHealth,
	UptimeInfo,
} from "./interfaces/health-response.interface";

import { env } from "@/config/env.config";

/**
 * Health check service providing detailed application and dependency status.
 *
 * Implements comprehensive health checks including database connectivity,
 * memory usage, disk space, and uptime tracking for monitoring systems.
 *
 * @example
 * ```typescript
 * const health = await healthService.getDetailedHealth();
 * console.log(health.status); // 'ok' | 'error'
 * ```
 */
@Injectable()
export class HealthService {
	private readonly startTime: Date;

	constructor(@InjectDataSource() private readonly dataSource: DataSource) {
		this.startTime = new Date();
	}

	/**
	 * Get basic health status (liveness probe).
	 *
	 * Returns minimal health information to verify the application
	 * process is running and responsive.
	 *
	 * @returns Basic health response with uptime
	 */
	getBasicHealth(): BasicHealthResponse {
		return {
			status: "ok",
			uptime: this.getUptimeInfo(),
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Get detailed health status (readiness probe).
	 *
	 * Returns comprehensive health information including all dependencies,
	 * system metrics, and database connectivity status.
	 *
	 * @returns Detailed health response or throws on critical failures
	 */
	async getDetailedHealth(): Promise<DetailedHealthResponse> {
		const database = await this.checkDatabaseHealth();
		const memory = this.checkMemoryHealth();
		const disk = this.checkDiskHealth();

		const status = this.determineOverallStatus(database, memory, disk);

		return {
			status,
			uptime: this.getUptimeInfo(),
			timestamp: new Date().toISOString(),
			database,
			memory,
			disk,
			version: process.env["npm_package_version"] ?? "0.0.1",
			nodeVersion: process.version,
		};
	}

	/**
	 * Check database connectivity and health.
	 *
	 * Verifies database connection, measures response time, and checks
	 * for table existence and migration status.
	 *
	 * @returns Database health information
	 */
	private async checkDatabaseHealth(): Promise<DatabaseHealth> {
		const startTime = Date.now();

		try {
			await this.dataSource.query("SELECT 1");

			const responseTime = Date.now() - startTime;

			const tablesResult: Array<{ count: number }> = await this.dataSource.query(
				"SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
			);
			const tableCount: number = tablesResult[0]?.count ?? 0;

			let migrationsApplied = false;
			try {
				const migrationsResult: Array<{ count: number }> = await this.dataSource.query(
					"SELECT COUNT(*) as count FROM migrations",
				);
				migrationsApplied = (migrationsResult[0]?.count ?? 0) > 0;
			} catch {
				migrationsApplied = false;
			}

			return {
				status: "up",
				responseTime,
				type: "sqlite",
				connection: this.sanitizeDatabasePath(env.API__DATABASE_PATH),
				tableCount,
				migrationsApplied,
			};
		} catch {
			return {
				status: "down",
				type: "sqlite",
				connection: this.sanitizeDatabasePath(env.API__DATABASE_PATH),
			};
		}
	}

	/**
	 * Check memory usage and availability.
	 *
	 * Returns memory metrics including heap usage and system memory.
	 *
	 * @returns Memory health information
	 */
	private checkMemoryHealth(): MemoryHealth {
		const memUsage = process.memoryUsage();
		const totalMem = os.totalmem();
		const freeMem = os.freemem();
		const usedMem = totalMem - freeMem;
		const usagePercent = (usedMem / totalMem) * 100;

		const status: ComponentStatus = usagePercent > 90 ? "down" : "up";

		return {
			status,
			used: usedMem,
			total: totalMem,
			usagePercent: Number(usagePercent.toFixed(2)),
			heapUsed: memUsage.heapUsed,
			heapTotal: memUsage.heapTotal,
		};
	}

	/**
	 * Check disk usage for database storage.
	 *
	 * Returns database file size and disk space information.
	 *
	 * @returns Disk health information
	 */
	private checkDiskHealth(): DiskHealth {
		try {
			const dbPath = env.API__DATABASE_PATH;
			const stats = fs.statSync(dbPath);
			const sizeBytes = stats.size;

			return {
				status: "up",
				dbSize: sizeBytes,
				dbSizeFormatted: this.formatBytes(sizeBytes),
				path: this.sanitizeDatabasePath(dbPath),
			};
		} catch {
			return {
				status: "down",
				dbSize: 0,
				dbSizeFormatted: "unknown",
				path: this.sanitizeDatabasePath(env.API__DATABASE_PATH),
			};
		}
	}

	/**
	 * Get application uptime information.
	 *
	 * @returns Uptime information with formatted string
	 */
	private getUptimeInfo(): UptimeInfo {
		const uptimeSeconds = Math.floor((Date.now() - this.startTime.getTime()) / 1000);

		return {
			startTime: this.startTime.toISOString(),
			uptimeSeconds,
			uptimeFormatted: this.formatUptime(uptimeSeconds),
		};
	}

	/**
	 * Determine overall application status based on component health.
	 *
	 * @param database - Database health status
	 * @param memory - Memory health status
	 * @param disk - Disk health status
	 * @returns Overall health status
	 */
	private determineOverallStatus(
		database: DatabaseHealth,
		memory: MemoryHealth,
		disk: DiskHealth,
	): "ok" | "error" {
		if (database.status === "down") {
			return "error";
		}

		if (memory.status === "down" || disk.status === "down") {
			return "error";
		}

		return "ok";
	}

	/**
	 * Sanitize database path for public display.
	 *
	 * Removes sensitive information while keeping useful path details.
	 *
	 * @param path - Original database path
	 * @returns Sanitized path
	 */
	private sanitizeDatabasePath(path: string): string {
		const parts = path.split("/");
		return parts.slice(-3).join("/");
	}

	/**
	 * Format bytes to human-readable string.
	 *
	 * @param bytes - Number of bytes
	 * @returns Formatted string (e.g., "1.5 MB")
	 */
	private formatBytes(bytes: number): string {
		if (bytes === 0) return "0 Bytes";

		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"] as const;
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		const size = sizes[i] ?? "Bytes";

		return `${Number.parseFloat((bytes / k ** i).toFixed(2)).toString()} ${size}`;
	}

	/**
	 * Format uptime seconds to human-readable string.
	 *
	 * @param seconds - Uptime in seconds
	 * @returns Formatted string (e.g., "2h 15m 30s")
	 */
	private formatUptime(seconds: number): string {
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		const parts: Array<string> = [];
		if (days > 0) parts.push(`${days.toString()}d`);
		if (hours > 0) parts.push(`${hours.toString()}h`);
		if (minutes > 0) parts.push(`${minutes.toString()}m`);
		if (secs > 0 || parts.length === 0) parts.push(`${secs.toString()}s`);

		return parts.join(" ");
	}
}
