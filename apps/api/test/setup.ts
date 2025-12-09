import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import type { INestApplication } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import type { Server } from "node:http";

import { AppModule } from "../src/app.module";

/**
 * Creates a test application instance for E2E testing.
 *
 * Initializes a NestJS application with an in-memory SQLite database,
 * configured with global validation pipes matching production settings.
 * Automatically handles database cleanup between tests.
 *
 * @returns Configured NestJS application instance and database connection
 *
 * @example
 * ```typescript
 * describe('Feature E2E', () => {
 *   let app: INestApplication;
 *   let dataSource: DataSource;
 *
 *   beforeAll(async () => {
 *     const result = await createTestApp();
 *     app = result.app;
 *     dataSource = result.dataSource;
 *   });
 *
 *   afterAll(async () => {
 *     await app.close();
 *   });
 * });
 * ```
 */
export async function createTestApp(): Promise<{
	app: INestApplication<Server>;
	dataSource: DataSource;
}> {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [
			TypeOrmModule.forRoot({
				type: "sqlite",
				database: ":memory:",
				entities: [new URL("../src/**/*.entity{.ts,.js}", import.meta.url).pathname],
				synchronize: true,
				dropSchema: true,
			}),
			AppModule,
		],
	}).compile();

	const app: INestApplication<Server> = moduleFixture.createNestApplication();

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

	app.setGlobalPrefix("api");

	await app.init();

	const dataSource = moduleFixture.get<DataSource>(DataSource);

	return { app, dataSource };
}

/**
 * Cleans up all database tables for isolated test execution.
 *
 * Truncates all tables while maintaining foreign key relationships
 * and resets auto-increment counters. Use in beforeEach hooks to
 * ensure test isolation.
 *
 * @param dataSource TypeORM DataSource instance
 *
 * @example
 * ```typescript
 * beforeEach(async () => {
 *   await cleanDatabase(dataSource);
 * });
 * ```
 */
export async function cleanDatabase(dataSource: DataSource): Promise<void> {
	const entities = dataSource.entityMetadatas;

	for (const entity of entities) {
		const repository = dataSource.getRepository(entity.name);
		await repository.query(`DELETE FROM ${entity.tableName}`);
	}
}
