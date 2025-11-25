import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoggerModule } from "nestjs-pino";

import { env } from "@/config/env.config";
import { createPinoConfig } from "@/config/logger.config";

import { AppController } from "./app.controller";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { CorrelationIdInterceptor } from "./common/interceptors/correlation-id.interceptor";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { AppDataSource } from "./config/database.config";
import { AuthModule } from "./modules/auth/auth.module";
import { FarmsModule } from "./modules/farms/farms.module";
import { HealthModule } from "./modules/health/health.module";
import { ProducersModule } from "./modules/producers/producers.module";

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
				ttl: env.API__THROTTLE_TTL_MS,
				limit: env.API__THROTTLE_LIMIT,
			},
		]),
		TypeOrmModule.forRoot(AppDataSource.options),
		AuthModule,
		HealthModule,
		ProducersModule,
		FarmsModule,
	],
	controllers: [AppController],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: CorrelationIdInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: LoggingInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: TransformInterceptor,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: APP_GUARD,
			useFactory: (reflector: Reflector) => new JwtAuthGuard(reflector),
			inject: [Reflector],
		},
	],
})
export class AppModule {}
