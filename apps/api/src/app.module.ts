import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoggerModule } from "nestjs-pino";

import { createPinoConfig } from "./common/config/logger.config";
import { CorrelationIdInterceptor } from "./common/interceptors/correlation-id.interceptor";
import { AppDataSource } from "./database/data-source";
import { FarmsModule } from "./farms/farms.module";
import { HealthModule } from "./health/health.module";
import { ProducersModule } from "./producers/producers.module";
import { env } from "./utils";

/**
 * Root application module.
 *
 * Configures TypeORM database connection, structured logging with nestjs-pino,
 * correlation ID tracking, rate limiting, health checks, and imports all feature
 * modules. This module serves as the entry point for the NestJS application.
 *
 * Rate limiting: 10 requests per 60 seconds per IP address by default.
 *
 * @example
 * ```typescript
 * // Usage in main.ts
 * const app = await NestFactory.create(AppModule);
 * ```
 */
@Module({
	imports: [
		LoggerModule.forRoot(createPinoConfig()),
		ThrottlerModule.forRoot([
			{
				ttl: env.API_THROTTLE_TTL_MS,
				limit: env.API_THROTTLE_LIMIT,
			},
		]),
		TypeOrmModule.forRoot(AppDataSource.options),
		HealthModule,
		ProducersModule,
		FarmsModule,
	],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: CorrelationIdInterceptor,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
