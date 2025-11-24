import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

/**
 * Bootstrap the NestJS application.
 *
 * Configures global pipes, CORS, Swagger documentation, and starts the server.
 * Uses Bun as the runtime for optimal performance.
 */
async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);

	// Global API prefix
	app.setGlobalPrefix("api");

	// Global validation pipe
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);

	// CORS configuration
	app.enableCors({
		origin: process.env["API_CORS_ORIGIN"] || "*",
		credentials: true,
	});

	// Swagger/OpenAPI documentation
	const config = new DocumentBuilder()
		.setTitle("Brain Agriculture API")
		.setDescription(
			"RESTful API for managing rural producers and farms. " +
				"Includes CRUD operations, validation, and dashboard statistics.",
		)
		.setVersion("1.0")
		.addTag("Producers", "Rural producer management endpoints")
		.addTag("Farms", "Farm management and statistics endpoints")
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api/docs", app, document);

	// Start server
	const port = process.env["API_PORT"] || 3000;
	await app.listen(port);

	// eslint-disable-next-line no-console
	console.log(`🚀 Application is running on: http://localhost:${port}/api`);
	// eslint-disable-next-line no-console
	console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

// Use top-level await for proper async handling
await bootstrap();
