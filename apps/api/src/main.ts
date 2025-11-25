import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { Logger, PinoLogger } from "nestjs-pino";

import { env } from "@/config/env.config";

import { version } from "../package.json";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

/**
 * Bootstrap the NestJS application.
 *
 * Configures security headers (helmet), global pipes, CORS, structured logging,
 * Swagger documentation, and starts the server. Uses Bun as the runtime for
 * optimal performance.
 */
async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule, { bufferLogs: true });

	const logger = app.get(Logger);
	app.useLogger(logger);

	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					styleSrc: ["'self'", "'unsafe-inline'"],
					scriptSrc: ["'self'", "'unsafe-inline'"],
					imgSrc: ["'self'", "data:", "https:"],
				},
			},
			crossOriginEmbedderPolicy: false,
		}),
	);

	app.setGlobalPrefix("api");

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

				return new BadRequestException({
					message: messages,
					error: "Validation Failed",
				});
			},
		}),
	);

	const pinoLogger = app.get(PinoLogger);
	app.useGlobalFilters(new HttpExceptionFilter(pinoLogger));

	app.enableCors({
		origin: env.API_CORS_ORIGIN,
		credentials: true,
	});

	const config = new DocumentBuilder()
		.setTitle("Brain Agriculture API")
		.setDescription(
			"RESTful API for managing rural producers and farms. " +
				"Includes CRUD operations, validation, and dashboard statistics.",
		)
		.setVersion(version)
		.addTag("Producers", "Rural producer management endpoints")
		.addTag("Farms", "Farm management and statistics endpoints")
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api/docs", app, document);

	const port = String(env.API_PORT);
	await app.listen(port);

	logger.log(`🚀 Application is running on: http://localhost:${port}/api`, "Bootstrap");
	logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`, "Bootstrap");
}

await bootstrap();
