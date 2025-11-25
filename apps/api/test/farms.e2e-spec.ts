import { HttpStatus } from "@nestjs/common";
import request from "supertest";

import type { INestApplication } from "@nestjs/common";
import type { Server } from "node:http";
import type { DataSource } from "typeorm";

import { BrazilianState } from "../src/database/entities";

import { cleanDatabase, createTestApp } from "./setup";

describe("Farms E2E", () => {
	let app: INestApplication<Server>;
	let server: Server;
	let dataSource: DataSource;
	let producerId: string;

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

		const producerResponse = await request(server)
			.post("/api/producers")
			.send({ name: "Test Producer", cpfCnpj: "123.456.789-09" });

		producerId = producerResponse.body.id;
	});

	describe("POST /api/farms", () => {
		it("should create a farm with valid data", async () => {
			const createFarmDto = {
				name: "Fazenda Boa Vista",
				city: "Campinas",
				state: BrazilianState.SP,
				totalArea: 100.5,
				arableArea: 70,
				vegetationArea: 25,
				producerId,
			};

			const response = await request(server)
				.post("/api/farms")
				.send(createFarmDto)
				.expect(HttpStatus.CREATED);

			expect(response.body).toMatchObject({
				id: expect(String),
				name: "Fazenda Boa Vista",
				city: "Campinas",
				state: BrazilianState.SP,
				totalArea: 100.5,
				arableArea: 70,
				vegetationArea: 25,
			});
		});

		it("should reject farm with invalid area constraints", async () => {
			const createFarmDto = {
				name: "Invalid Farm",
				city: "São Paulo",
				state: BrazilianState.SP,
				totalArea: 100,
				arableArea: 80,
				vegetationArea: 30,
				producerId,
			};

			const response = await request(server)
				.post("/api/farms")
				.send(createFarmDto)
				.expect(HttpStatus.BAD_REQUEST);

			expect(response.body.message).toContain("area");
		});

		it("should reject farm with non-existent producer", async () => {
			const createFarmDto = {
				name: "Test Farm",
				city: "São Paulo",
				state: BrazilianState.SP,
				totalArea: 100,
				arableArea: 70,
				vegetationArea: 25,
				producerId: "550e8400-e29b-41d4-a716-446655440000",
			};

			await request(server).post("/api/farms").send(createFarmDto).expect(HttpStatus.NOT_FOUND);
		});

		it("should reject missing required fields", async () => {
			await request(server)
				.post("/api/farms")
				.send({ name: "Incomplete Farm" })
				.expect(HttpStatus.BAD_REQUEST);
		});
	});

	describe("GET /api/farms", () => {
		it("should return empty array when no farms exist", async () => {
			const response = await request(server).get("/api/farms").expect(HttpStatus.OK);

			expect(response.body).toEqual([]);
		});

		it("should return all farms", async () => {
			await request(server).post("/api/farms").send({
				name: "Farm 1",
				city: "Campinas",
				state: BrazilianState.SP,
				totalArea: 100,
				arableArea: 70,
				vegetationArea: 25,
				producerId,
			});

			await request(server).post("/api/farms").send({
				name: "Farm 2",
				city: "Ribeirão Preto",
				state: BrazilianState.SP,
				totalArea: 200,
				arableArea: 150,
				vegetationArea: 40,
				producerId,
			});

			const response = await request(server).get("/api/farms").expect(HttpStatus.OK);

			expect(response.body).toHaveLength(2);
		});
	});

	describe("GET /api/farms/:id", () => {
		it("should return a farm by id", async () => {
			const createResponse = await request(server).post("/api/farms").send({
				name: "Test Farm",
				city: "Campinas",
				state: BrazilianState.SP,
				totalArea: 100,
				arableArea: 70,
				vegetationArea: 25,
				producerId,
			});

			const farmId = createResponse.body.id;

			const response = await request(server).get(`/api/farms/${farmId}`).expect(HttpStatus.OK);

			expect(response.body).toMatchObject({
				id: farmId,
				name: "Test Farm",
			});
		});

		it("should return 404 for non-existent farm", async () => {
			const result = await request(server).get("/api/farms/550e8400-e29b-41d4-a716-446655440000");

			expect(result.status).toBe(HttpStatus.NOT_FOUND);
		});
	});

	describe("PATCH /api/farms/:id", () => {
		it("should update a farm", async () => {
			const createResponse = await request(server).post("/api/farms").send({
				name: "Original Farm",
				city: "Campinas",
				state: BrazilianState.SP,
				totalArea: 100,
				arableArea: 70,
				vegetationArea: 25,
				producerId,
			});

			const farmId = createResponse.body.id;

			const response = await request(server)
				.patch(`/api/farms/${farmId}`)
				.send({ name: "Updated Farm" })
				.expect(HttpStatus.OK);

			expect(response.body.name).toBe("Updated Farm");
		});

		it("should reject invalid area constraints on update", async () => {
			const createResponse = await request(server).post("/api/farms").send({
				name: "Test Farm",
				city: "Campinas",
				state: BrazilianState.SP,
				totalArea: 100,
				arableArea: 70,
				vegetationArea: 25,
				producerId,
			});

			const farmId = createResponse.body.id;

			await request(server)
				.patch(`/api/farms/${farmId}`)
				.send({ arableArea: 90, vegetationArea: 20 })
				.expect(HttpStatus.BAD_REQUEST);
		});
	});

	describe("DELETE /api/farms/:id", () => {
		it("should delete a farm", async () => {
			const createResponse = await request(server).post("/api/farms").send({
				name: "Test Farm",
				city: "Campinas",
				state: BrazilianState.SP,
				totalArea: 100,
				arableArea: 70,
				vegetationArea: 25,
				producerId,
			});

			const farmId = createResponse.body.id;

			await request(server).delete(`/api/farms/${farmId}`).expect(HttpStatus.OK);

			await request(server).get(`/api/farms/${farmId}`).expect(HttpStatus.NOT_FOUND);
		});

		it("should return 404 when deleting non-existent farm", async () => {
			await request(server)
				.delete("/api/farms/550e8400-e29b-41d4-a716-446655440000")
				.expect(HttpStatus.NOT_FOUND);
		});
	});

	describe("GET /api/farms/stats/total-area", () => {
		it("should return zero stats when no farms exist", async () => {
			const response = await request(server)
				.get("/api/farms/stats/total-area")
				.expect(HttpStatus.OK);

			expect(response.body).toMatchObject({
				totalFarms: 0,
				totalHectares: 0,
			});
		});

		it("should calculate total farms and hectares correctly", async () => {
			const numOfFarms = 5;

			for (let index = 0; index < numOfFarms; index++) {
				const result = await request(server)
					.post("/api/farms")
					.send({
						name: `Farm ${String(index + 1)}`,
						city: "Campinas",
						state: BrazilianState.SP,
						totalArea: 100.5,
						arableArea: 70,
						vegetationArea: 25,
						producerId,
					});

				expect(result.status).toBe(HttpStatus.CREATED);
			}

			const response = await request(server)
				.get("/api/farms/stats/total-area")
				.expect(HttpStatus.OK);

			expect(response.body).toMatchObject({
				totalFarms: 2,
				totalHectares: 300.75,
			});
		});
	});

	describe("GET /api/farms/stats/by-state", () => {
		it("should return empty array when no farms exist", async () => {
			const response = await request(server).get("/api/farms/stats/by-state").expect(HttpStatus.OK);

			expect(response.body).toEqual([]);
		});

		it("should group farms by state correctly", async () => {
			await request(server).post("/api/farms").send({
				name: "Farm SP 1",
				city: "Campinas",
				state: BrazilianState.SP,
				totalArea: 100,
				arableArea: 70,
				vegetationArea: 25,
				producerId,
			});

			await request(server).post("/api/farms").send({
				name: "Farm SP 2",
				city: "Ribeirão Preto",
				state: BrazilianState.SP,
				totalArea: 200,
				arableArea: 150,
				vegetationArea: 40,
				producerId,
			});

			await request(server).post("/api/farms").send({
				name: "Farm MG",
				city: "Uberlândia",
				state: BrazilianState.MG,
				totalArea: 150,
				arableArea: 100,
				vegetationArea: 40,
				producerId,
			});

			const response = await request(server).get("/api/farms/stats/by-state").expect(HttpStatus.OK);

			expect(response.body).toHaveLength(2);
			expect(response.body).toContainEqual({
				state: BrazilianState.SP,
				count: 2,
			});
			expect(response.body).toContainEqual({
				state: BrazilianState.MG,
				count: 1,
			});
		});
	});

	describe("GET /api/farms/stats/land-use", () => {
		it("should return zero stats when no farms exist", async () => {
			const response = await request(server).get("/api/farms/stats/land-use").expect(HttpStatus.OK);

			expect(response.body).toMatchObject({
				totalArableArea: 0,
				totalVegetationArea: 0,
			});
		});

		it("should calculate land use correctly", async () => {
			await request(server).post("/api/farms").send({
				name: "Farm 1",
				city: "Campinas",
				state: BrazilianState.SP,
				totalArea: 100,
				arableArea: 70.5,
				vegetationArea: 25.25,
				producerId,
			});

			await request(server).post("/api/farms").send({
				name: "Farm 2",
				city: "Ribeirão Preto",
				state: BrazilianState.SP,
				totalArea: 200,
				arableArea: 150.75,
				vegetationArea: 40.5,
				producerId,
			});

			const response = await request(server).get("/api/farms/stats/land-use").expect(HttpStatus.OK);

			expect(response.body).toMatchObject({
				totalArableArea: 221.25,
				totalVegetationArea: 65.75,
			});
		});
	});
});
