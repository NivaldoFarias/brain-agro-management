import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { Logger } from "nestjs-pino";

import { version } from "../package.json";

import { AppModule } from "./app.module";
import { env } from "./utils";

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
		}),
	);

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
