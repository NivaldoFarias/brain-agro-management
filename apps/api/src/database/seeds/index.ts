/**
 * Wrapper for database seeding.
 *
 * Provides a command-line interface to seed the database independently
 * of the application lifecycle. The actual seeding logic is contained
 * in {@link SeedService}.
 *
 * This script creates a minimal NestJS application context to properly
 * bootstrap the SeedService with all its dependencies via Dependency Injection.
 *
 * Usage:
 * ```bash
 * bun run db:seed
 * ```
 */

import { INestApplicationContext } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { createLogger, RuntimeEnvironment } from "@agro/shared/utils";

import { SeedModule } from "./seed.module";
import { SeedService } from "./seed.service";

if (import.meta.main) {
	await seed();
}

/**
 * Main execution function.
 *
 * Creates a NestJS application context, retrieves the SeedService from
 * the DI container, and triggers the seeding process. This approach ensures
 * all dependencies (DataSource, SeedUtilities, IbgeApiService, PinoLogger)
 * are properly injected.
 *
 * @see {@link https://docs.nestjs.com/standalone-applications|NestJS Standalone Applications}
 */
async function seed(): Promise<void> {
	const logger = createLogger({
		name: "seed:cli",
		environment: RuntimeEnvironment.Seed,
		logToConsole: true,
	});
	let app: INestApplicationContext | undefined;

	logger.info("Setting up database seeding context");

	try {
		logger.info("Creating NestJS application context");

		app = await NestFactory.createApplicationContext(SeedModule);

		logger.info("Retrieving SeedService from DI container");
		const seedService = app.get(SeedService);

		await seedService.seed();
	} catch (error) {
		logger.error({ error }, "Seeding failed");
		throw error;
	} finally {
		if (app) {
			await app.close();
			logger.info("Application context closed");
		}
	}
}
