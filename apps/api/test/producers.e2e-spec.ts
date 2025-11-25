import { HttpStatus } from "@nestjs/common";
import request from "supertest";

import type { INestApplication } from "@nestjs/common";
import type { Server } from "node:http";
import type { DataSource } from "typeorm";

import { cleanDatabase, createTestApp } from "./setup";

describe("Producers E2E", () => {
	let app: INestApplication<Server>;
	let server: Server;
	let dataSource: DataSource;

	beforeAll(async () => {
		const result = await createTestApp();
		app = result.app;
		server = app.getHttpServer();
		dataSource = result.dataSource;
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await cleanDatabase(dataSource);
	});

	describe("POST /api/producers", () => {
		it("should create a producer with valid CPF", async () => {
			const createProducerDto = {
				name: "João Silva",
				cpfCnpj: "123.456.789-09",
			};

			const response = await request(server)
				.post("/api/producers")
				.send(createProducerDto)
				.expect(HttpStatus.CREATED);

			expect(response.body).toMatchObject({
				id: expect(String),
				name: "João Silva",
				cpfCnpj: "12345678909",
			});
		});

		it("should create a producer with valid CNPJ", async () => {
			const createProducerDto = {
				name: "Fazendas Reunidas Ltda",
				cpfCnpj: "11.222.333/0001-81",
			};

			const response = await request(server)
				.post("/api/producers")
				.send(createProducerDto)
				.expect(HttpStatus.CREATED);

			expect(response.body).toMatchObject({
				id: expect(String),
				name: "Fazendas Reunidas Ltda",
				cpfCnpj: "11222333000181",
			});
		});

		it("should reject invalid CPF", async () => {
			const createProducerDto = {
				name: "Test Producer",
				cpfCnpj: "123.456.789-00",
			};

			const response = await request(server)
				.post("/api/producers")
				.send(createProducerDto)
				.expect(HttpStatus.BAD_REQUEST);

			expect(response.body.message).toContain("CPF/CNPJ");
		});

		it("should reject missing required fields", async () => {
			await request(server).post("/api/producers").send({}).expect(HttpStatus.BAD_REQUEST);
		});
	});

	describe("GET /api/producers", () => {
		it("should return empty array when no producers exist", async () => {
			const response = await request(server).get("/api/producers").expect(HttpStatus.OK);

			expect(response.body).toEqual([]);
		});

		it("should return all producers", async () => {
			await request(server)
				.post("/api/producers")
				.send({ name: "Producer 1", cpfCnpj: "123.456.789-09" });

			await request(server)
				.post("/api/producers")
				.send({ name: "Producer 2", cpfCnpj: "11.222.333/0001-81" });

			const response = await request(server).get("/api/producers").expect(HttpStatus.OK);

			expect(response.body).toHaveLength(2);
			expect(response.body[0].name).toBe("Producer 1");
			expect(response.body[1].name).toBe("Producer 2");
		});
	});

	describe("GET /api/producers/:id", () => {
		it("should return a producer by id", async () => {
			const createResponse = await request(server)
				.post("/api/producers")
				.send({ name: "Test Producer", cpfCnpj: "123.456.789-09" });

			const producerId = createResponse.body.id;

			const response = await request(server)
				.get(`/api/producers/${producerId}`)
				.expect(HttpStatus.OK);

			expect(response.body).toMatchObject({
				id: producerId,
				name: "Test Producer",
			});
		});

		it("should return 404 for non-existent producer", async () => {
			await request(server)
				.get("/api/producers/550e8400-e29b-41d4-a716-446655440000")
				.expect(HttpStatus.NOT_FOUND);
		});
	});

	describe("PATCH /api/producers/:id", () => {
		it("should update a producer", async () => {
			const createResponse = await request(server)
				.post("/api/producers")
				.send({ name: "Original Name", cpfCnpj: "123.456.789-09" });

			const producerId = createResponse.body.id;

			const response = await request(server)
				.patch(`/api/producers/${producerId}`)
				.send({ name: "Updated Name" })
				.expect(HttpStatus.OK);

			expect(response.body.name).toBe("Updated Name");
		});

		it("should reject invalid CPF/CNPJ on update", async () => {
			const createResponse = await request(server)
				.post("/api/producers")
				.send({ name: "Test Producer", cpfCnpj: "123.456.789-09" });

			const producerId = createResponse.body.id;

			await request(server)
				.patch(`/api/producers/${producerId}`)
				.send({ cpfCnpj: "000.000.000-00" })
				.expect(HttpStatus.BAD_REQUEST);
		});
	});

	describe("DELETE /api/producers/:id", () => {
		it("should delete a producer", async () => {
			const createResponse = await request(server)
				.post("/api/producers")
				.send({ name: "Test Producer", cpfCnpj: "123.456.789-09" });

			const producerId = createResponse.body.id;

			await request(server).delete(`/api/producers/${producerId}`).expect(HttpStatus.OK);

			await request(server).get(`/api/producers/${producerId}`).expect(HttpStatus.NOT_FOUND);
		});

		it("should return 404 when deleting non-existent producer", async () => {
			await request(server)
				.delete("/api/producers/550e8400-e29b-41d4-a716-446655440000")
				.expect(HttpStatus.NOT_FOUND);
		});
	});
});
