import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import helmet from "helmet";
import { Logger } from "nestjs-pino";

import type { INestApplication } from "@nestjs/common";
import type { OpenAPIObject } from "@nestjs/swagger";

import { createLogger } from "@agro/shared/utils";

import { AppDataSource } from "@/config/database.config";
import { env } from "@/config/env.config";

import { version } from "../package.json";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

if (import.meta.main) {
	await bootstrap();
}

/**
 * Bootstrap the NestJS application.
 *
 * Orchestrates the application setup by configuring logger, security, validation,
 * API documentation, and starting the HTTP server. Each configuration stage is
 * isolated in its own function for maintainability.
 */
async function bootstrap(): Promise<void> {
	if (env.API__RUN_DB_MIGRATIONS) {
		await runMigrations();
	}

	const app = await NestFactory.create(AppModule, { bufferLogs: true });

	const logger = setupLogger(app);
	setupSecurity(app);
	setupGlobalPrefix(app);
	setupValidation(app);
	setupExceptionHandling(app, logger);
	setupCors(app);

	const document = setupOpenApiDocumentation(app);
	setupScalarApiReference(app, document);

	const { SeedService } = await import("./database/seeds/seed.service");
	const seedService = app.get(SeedService);
	await seedService.seed();

	await startServer(app, logger);
}

/**
 * Runs pending database migrations.
 *
 * Initializes a separate DataSource connection to run migrations before the
 * NestJS application starts. This ensures the database schema is up-to-date
 * before any queries are executed.
 *
 * Creates the database directory if it doesn't exist to prevent initialization failures.
 *
 * @throws {Error} If migrations fail to run
 */
async function runMigrations(): Promise<void> {
	const migrationLogger = createLogger({ name: "Migration" });

	migrationLogger.info("Initializing DataSource for migrations...");

	try {
		const path = await import("node:path");
		const fs = await import("node:fs/promises");

		const dbPath = env.API__DATABASE_PATH;
		const dbDir = path.dirname(dbPath);

		await fs.mkdir(dbDir, { recursive: true });
		migrationLogger.info(`Ensured database directory exists: ${dbDir}`);

		const { DataSource } = await import("typeorm");
		const migrationDataSource = new DataSource({
			...AppDataSource.options,
			synchronize: false,
		});

		const dataSource = await migrationDataSource.initialize();
		migrationLogger.info("DataSource initialized successfully");

		const pendingMigrations = await dataSource.showMigrations();
		migrationLogger.info(`Pending migrations: ${String(pendingMigrations)}`);

		if (pendingMigrations) {
			migrationLogger.info("Running pending migrations...");
			const migrations = await dataSource.runMigrations({ transaction: "all" });
			migrationLogger.info(`Successfully ran ${String(migrations.length)} migration(s):`);
			for (const migration of migrations) {
				migrationLogger.info(`  - ${migration.name}`);
			}
		} else {
			migrationLogger.info("Database schema is up-to-date");
		}

		await dataSource.destroy();

		migrationLogger.info("DataSource closed");
	} catch (error) {
		migrationLogger.error(`Failed to run migrations: ${String(error)}`);

		throw error;
	}
}

/**
 * Configures structured logging with Pino.
 *
 * @param app The NestJS application instance
 *
 * @returns The configured Logger instance
 */
function setupLogger(app: INestApplication): Logger {
	const logger = app.get(Logger);
	app.useLogger(logger);
	return logger;
}

/**
 * Configures security headers using Helmet.
 *
 * Sets Content Security Policy to allow Swagger/Scalar UI to load properly while
 * maintaining reasonable security defaults. Allows CDN resources for Scalar API
 * Reference documentation.
 *
 * @param app The NestJS application instance
 */
function setupSecurity(app: INestApplication): void {
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
					scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
					imgSrc: ["'self'", "data:", "https:"],
					fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
					connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
				},
			},
			crossOriginEmbedderPolicy: false,
		}),
	);
}

/**
 * Sets the global API prefix.
 *
 * All routes will be prefixed with `/api` for consistency and versioning strategy.
 *
 * @param app The NestJS application instance
 */
function setupGlobalPrefix(app: INestApplication): void {
	app.setGlobalPrefix("api");
}

/**
 * Configures global validation pipe with class-validator.
 *
 * Enables automatic DTO validation with whitelist stripping, unknown value
 * rejection, and transformation. Provides detailed validation error messages.
 *
 * @param app The NestJS application instance
 */
function setupValidation(app: INestApplication): void {
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			forbidUnknownValues: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
			exceptionFactory: (errors) => {
				const messages = errors.map((error) => {
					const constraints = error.constraints ? Object.values(error.constraints) : [];
					const field = error.property;
					const value = error.value as unknown;

					const detailedValidationErrors = `${field}: ${constraints.join(", ")} (received: ${JSON.stringify(value)})`;

					return detailedValidationErrors;
				});

				return new BadRequestException({ message: messages, error: "Validation Failed" });
			},
		}),
	);
}

/**
 * Configures global exception handling.
 *
 * Registers the HttpExceptionFilter for standardized error responses with
 * correlation IDs and structured logging.
 *
 * @param app The NestJS application instance
 * @param logger The Pino logger instance
 */
function setupExceptionHandling(app: INestApplication, logger: Logger): void {
	app.useGlobalFilters(new HttpExceptionFilter(logger));
}

/**
 * Configures CORS (Cross-Origin Resource Sharing).
 *
 * Enables CORS with environment-specific origins and credentials support.
 *
 * @param app The NestJS application instance
 */
function setupCors(app: INestApplication): void {
	app.enableCors({
		origin: env.API__CORS_ORIGIN,
		credentials: true,
	});
}

/**
 * Generates OpenAPI documentation and sets up Swagger UI.
 *
 * Creates comprehensive API documentation with tags, authentication schemes,
 * and version information. Mounts Swagger UI at `/api/docs`.
 *
 * @param app The NestJS application instance
 *
 * @returns The generated OpenAPI document
 */
function setupOpenApiDocumentation(app: INestApplication): OpenAPIObject {
	const config = new DocumentBuilder()
		.setTitle("Brain Agriculture API")
		.setDescription(
			"RESTful API for managing rural producers and farms. " +
				"Includes CRUD operations, validation, and dashboard statistics.",
		)
		.setVersion(version)
		.addTag("Producers", "Rural producer management endpoints")
		.addTag("Farms", "Farm management and statistics endpoints")
		.addTag("Health", "Health check and readiness endpoints")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
				name: "Authorization",
				description: "Enter JWT token",
				in: "header",
			},
			"JWT-auth",
		)
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api/docs", app, document);

	return document;
}

/**
 * Configures Scalar API Reference for enhanced API documentation.
 *
 * Sets up Scalar's interactive API reference at `/api/reference` with the
 * default NestJS theme. Scalar provides a modern, user-friendly alternative
 * to Swagger UI with better search and navigation.
 *
 * @param app The NestJS application instance
 * @param document The OpenAPI document generated by Swagger
 */
function setupScalarApiReference(app: INestApplication, document: OpenAPIObject): void {
	app.use(
		"/api/reference",
		apiReference({
			theme: "default",
			content: document,
		}),
	);
}

/**
 * Starts the HTTP server and logs startup information.
 *
 * @param app The NestJS application instance
 * @param logger The Pino logger instance
 */
async function startServer(app: INestApplication, logger: Logger): Promise<void> {
	const port = String(env.API__PORT);
	await app.listen(port);

	logger.log(`Application running: ${env.API__BASE_URL}/api`, "Bootstrap");
	logger.log(`Swagger documentation: ${env.API__BASE_URL}/api/docs`, "Bootstrap");
	logger.log(`Scalar API reference: ${env.API__BASE_URL}/api/reference`, "Bootstrap");
}
