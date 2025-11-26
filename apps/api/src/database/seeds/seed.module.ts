import { Module } from "@nestjs/common";

import { SeedService } from "./seed.service";

/**
 * Database seeding module.
 *
 * Provides centralized database seeding functionality for the application.
 * The {@link SeedService} is exported to allow usage in the application bootstrap process.
 *
 * @see {@link SeedService} for seeding logic
 */
@Module({
	providers: [SeedService],
	exports: [SeedService],
})
export class SeedModule {}
