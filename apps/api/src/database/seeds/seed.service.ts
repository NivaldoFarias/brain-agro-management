import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { DataSource } from "typeorm";

import { env } from "@/config/env.config";

import { seedDatabase } from "./index";

/**
 * Database seeding service.
 *
 * Provides centralized control over database seeding operations on application startup.
 * Respects the `API__SEED_DATABASE` environment variable to enable/disable seeding.
 * Only seeds once by checking if producers already exist in the database.
 *
 * @example
 * ```typescript
 * // In main.ts bootstrap function
 * const seedService = app.get(SeedService);
 * await seedService.seed();
 * ```
 */
@Injectable()
export class SeedService {
	constructor(
		private readonly dataSource: DataSource,
		@InjectPinoLogger(SeedService.name)
		private readonly logger: PinoLogger,
	) {}

	/**
	 * Seeds the database with sample data if enabled via environment variable.
	 *
	 * Checks three conditions before seeding:
	 * 1. `API__SEED_DATABASE` environment variable is `true`
	 * 2. Database connection is initialized
	 * 3. No producers exist in the database (idempotency check)
	 *
	 * @returns {Promise<void>}
	 */
	async seed(): Promise<void> {
		if (!env.API__SEED_DATABASE) {
			this.logger.info("Database seeding disabled via API__SEED_DATABASE=false");
			return;
		}

		if (!this.dataSource.isInitialized) {
			this.logger.warn("Database connection not initialized, skipping seeding");
			return;
		}

		try {
			const producerRepository = this.dataSource.getRepository("producers");
			const producerCount = await producerRepository.count();

			if (producerCount > 0) {
				this.logger.info(
					`Database already seeded (${String(producerCount)} producers found), skipping`,
				);
				return;
			}

			this.logger.info("Starting database seeding...");
			await seedDatabase(this.dataSource);
			this.logger.info("Database seeding completed successfully");
		} catch (error) {
			this.logger.error({ error }, "Database seeding failed");
		}
	}
}
