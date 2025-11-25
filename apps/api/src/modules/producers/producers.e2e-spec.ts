import { HttpStatus } from "@nestjs/common";
import { fixtures, TestConstants } from "@test/fixtures";
import { assertSuccessResponse, createTestScenarios } from "@test/scenarios";
import { cleanDatabase, createTestApp } from "@test/setup";

import type { INestApplication } from "@nestjs/common";
import type { TestScenarios } from "@test/scenarios";
import type { Server } from "node:http";
import type { DataSource } from "typeorm";

describe("Producers E2E", () => {
	let app: INestApplication<Server>;
	let server: Server;
	let dataSource: DataSource;
	let scenarios: TestScenarios;

	beforeAll(async () => {
		const result = await createTestApp();
		app = result.app;
		server = app.getHttpServer();
		dataSource = result.dataSource;

		scenarios = createTestScenarios(server);
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await cleanDatabase(dataSource);
	});

	describe("POST /api/producers", () => {
		it("should create a producer with valid CPF", async () => {
			const createProducerDto = fixtures.producer.validCPF();

			const response = await scenarios.producers.create(createProducerDto);

			expect(response.status).toBe(HttpStatus.CREATED);
			const producer = assertSuccessResponse(response.body);
			expect(producer.id).toBeDefined();
			expect(typeof producer.id).toBe("string");
			expect(producer.name).toBe(createProducerDto.name);
		});

		it("should create a producer with valid CNPJ", async () => {
			const createProducerDto = fixtures.producer.validCNPJ();

			const response = await scenarios.producers.create(createProducerDto);

			expect(response.status).toBe(HttpStatus.CREATED);
			const producer = assertSuccessResponse(response.body);
			expect(producer.id).toBeDefined();
			expect(typeof producer.id).toBe("string");
			expect(producer.name).toBe(createProducerDto.name);
		});

		it("should reject invalid CPF", async () => {
			const createProducerDto = fixtures.producer.invalidCPF();

			const response = await scenarios.producers.create(createProducerDto);

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it("should reject missing required fields", async () => {
			// @ts-expect-error - Intentionally passing incomplete data to test validation
			const response = await scenarios.producers.create(fixtures.producer.incomplete());
			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});
	});

	describe("GET /api/producers", () => {
		it("should return empty array when no producers exist", async () => {
			const response = await scenarios.producers.findAll();

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toEqual([]);
		});

		it("should return all producers", async () => {
			await scenarios.producers.create(fixtures.producer.withName("Producer 1"));
			await scenarios.producers.create(fixtures.producer.validCNPJ());

			const response = await scenarios.producers.findAll();

			expect(response.status).toBe(HttpStatus.OK);
			const producers = assertSuccessResponse(response.body);
			expect(producers).toHaveLength(2);
		});
	});

	describe("GET /api/producers/:id", () => {
		it("should return a producer by id", async () => {
			const createResponse = await scenarios.producers.create(fixtures.producer.validCPF());
			const createdProducer = assertSuccessResponse(createResponse.body);
			const producerId = createdProducer.id;

			const response = await scenarios.producers.findById(producerId);

			expect(response.status).toBe(HttpStatus.OK);
			const producer = assertSuccessResponse(response.body);
			expect(producer.id).toBe(producerId);
		});

		it("should return 404 for non-existent producer", async () => {
			const response = await scenarios.producers.findById(TestConstants.NON_EXISTENT_UUID);
			expect(response.status).toBe(HttpStatus.NOT_FOUND);
		});
	});

	describe("PATCH /api/producers/:id", () => {
		it("should update a producer", async () => {
			const createResponse = await scenarios.producers.create(fixtures.producer.validCPF());
			const createdProducer = assertSuccessResponse(createResponse.body);
			const producerId = createdProducer.id;

			const response = await scenarios.producers.update(producerId, { name: "Updated Name" });

			expect(response.status).toBe(HttpStatus.OK);
			const updatedProducer = assertSuccessResponse(response.body);
			expect(updatedProducer.name).toBe("Updated Name");
		});

		it("should reject invalid CPF/CNPJ on update", async () => {
			const createResponse = await scenarios.producers.create(fixtures.producer.validCPF());
			const createdProducer = assertSuccessResponse(createResponse.body);
			const producerId = createdProducer.id;

			const response = await scenarios.producers.update(producerId, {
				document: TestConstants.INVALID_CPF,
			});
			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});
	});

	describe("DELETE /api/producers/:id", () => {
		it("should delete a producer", async () => {
			const createResponse = await scenarios.producers.create(fixtures.producer.validCPF());
			const createdProducer = assertSuccessResponse(createResponse.body);
			const producerId = createdProducer.id;

			const deleteResponse = await scenarios.producers.remove(producerId);
			expect(deleteResponse.status).toBe(HttpStatus.OK);

			const getResponse = await scenarios.producers.findById(producerId);
			expect(getResponse.status).toBe(HttpStatus.NOT_FOUND);
		});

		it("should return 404 when deleting non-existent producer", async () => {
			const response = await scenarios.producers.remove(TestConstants.NON_EXISTENT_UUID);
			expect(response.status).toBe(HttpStatus.NOT_FOUND);
		});
	});
});
