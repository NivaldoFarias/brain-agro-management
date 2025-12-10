/**
 * @fileoverview E2E tests for the Farms API.
 *
 * Tests all CRUD operations, validation rules, and statistics endpoints
 * using type-safe scenario builders for reduced boilerplate and improved
 * type inference.
 */
import { HttpStatus } from "@nestjs/common";
import { fixtures, TestConstants } from "@test/fixtures";
import { assertSuccessResponse, createTestScenarios } from "@test/scenarios";
import { cleanDatabase, createTestApp } from "@test/setup";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";

import type { INestApplication } from "@nestjs/common";
import type { TestScenarios } from "@test/scenarios";
import type { Server } from "node:http";
import type { DataSource } from "typeorm";

import type { CreateFarmDto } from "@/modules/farms/dto";

import { BrazilianState } from "@agro/shared/enums";

describe("Farms E2E", () => {
	let app: INestApplication<Server>;
	let server: Server;
	let dataSource: DataSource;
	let producerId: string;
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

		const producerResponse = await scenarios.producers.create(fixtures.producer.validCPF());

		const producer = assertSuccessResponse(producerResponse.body);
		producerId = producer.id;
	});

	describe("POST /api/farms", () => {
		it("should create a farm with valid data", async () => {
			const createFarmDto = await fixtures.farm.valid(producerId);

			const response = await scenarios.farms.create(createFarmDto);

			expect(response.status).toBe(HttpStatus.CREATED);

			const farm = assertSuccessResponse(response.body);

			expect(farm.id).toBeDefined();
			expect(typeof farm.id).toBe("string");
			expect(farm).toMatchObject({
				name: createFarmDto.name,
				city: createFarmDto.city,
				state: createFarmDto.state,
				totalArea: createFarmDto.totalArea,
				arableArea: createFarmDto.arableArea,
				vegetationArea: createFarmDto.vegetationArea,
			});
		});

		it("should reject farm with invalid area constraints", async () => {
			const createFarmDto = fixtures.farm.invalidAreaConstraints(producerId);

			const response = await scenarios.farms.create(createFarmDto);

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
			expect("message" in response.body && response.body.message).toContain("area");
		});

		it("should reject farm with non-existent producer", async () => {
			const createFarmDto = fixtures.farm.withNonExistentProducer();

			const response = await scenarios.farms.create(createFarmDto);

			expect(response.status).toBe(HttpStatus.NOT_FOUND);
		});

		it("should reject missing required fields", async () => {
			const response = await scenarios.farms.create(
				fixtures.farm.incomplete() as unknown as CreateFarmDto,
			);
			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});
	});

	describe("GET /api/farms", () => {
		it("should return empty array when no farms exist", async () => {
			const response = await scenarios.farms.findAll();

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toEqual([]);
		});

		it("should return all farms", async () => {
			await scenarios.farms.create(
				await fixtures.farm.inState(producerId, BrazilianState.SP, "Farm 1"),
			);
			await scenarios.farms.create(
				await fixtures.farm.inState(producerId, BrazilianState.SP, "Farm 2"),
			);

			const response = await scenarios.farms.findAll();

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveLength(2);
		});
	});

	describe("GET /api/farms/:id", () => {
		it("should return a farm by id", async () => {
			const generatedFarm = await fixtures.farm.valid(producerId);
			const createResponse = await scenarios.farms.create(generatedFarm);

			const createdFarm = assertSuccessResponse(createResponse.body);
			const farmId = createdFarm.id;

			const response = await scenarios.farms.findById(farmId);

			expect(response.status).toBe(HttpStatus.OK);

			const farm = assertSuccessResponse(response.body);

			expect(farm).toMatchObject({ id: farmId, name: generatedFarm.name });
		});

		it("should return 404 for non-existent farm", async () => {
			const result = await scenarios.farms.findById(TestConstants.NON_EXISTENT_UUID);
			expect(result.status).toBe(HttpStatus.NOT_FOUND);
		});
	});

	describe("PATCH /api/farms/:id", () => {
		it("should update a farm", async () => {
			const createResponse = await scenarios.farms.create(await fixtures.farm.valid(producerId));

			const createdFarm = assertSuccessResponse(createResponse.body);
			const farmId = createdFarm.id;

			const response = await scenarios.farms.update(farmId, { name: "Updated Farm" });
			expect(response.status).toBe(HttpStatus.OK);

			const updatedFarm = assertSuccessResponse(response.body);
			expect(updatedFarm.name).toBe("Updated Farm");
		});

		it("should reject invalid area constraints on update", async () => {
			const createResponse = await scenarios.farms.create({
				name: "Test Farm",
				city: "Campinas",
				state: BrazilianState.SP,
				totalArea: 100,
				arableArea: 70,
				vegetationArea: 25,
				producerId,
			});

			const createdFarm = assertSuccessResponse(createResponse.body);
			const farmId = createdFarm.id;

			const response = await scenarios.farms.update(farmId, {
				arableArea: 90,
				vegetationArea: 20,
			});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});
	});

	describe("DELETE /api/farms/:id", () => {
		it("should delete a farm", async () => {
			const createResponse = await scenarios.farms.create(await fixtures.farm.valid(producerId));

			const createdFarm = assertSuccessResponse(createResponse.body);
			const farmId = createdFarm.id;

			const deleteResponse = await scenarios.farms.remove(farmId);

			expect(deleteResponse.status).toBe(HttpStatus.OK);

			const getResponse = await scenarios.farms.findById(farmId);
			expect(getResponse.status).toBe(HttpStatus.NOT_FOUND);
		});

		it("should return 404 when deleting non-existent farm", async () => {
			const response = await scenarios.farms.remove("550e8400-e29b-41d4-a716-446655440000");

			expect(response.status).toBe(HttpStatus.NOT_FOUND);
		});
	});

	describe("GET /api/farms/stats/total-area", () => {
		it("should return zero stats when no farms exist", async () => {
			const response = await scenarios.farms.getTotalAreaStats();

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toMatchObject({ totalFarms: 0, totalHectares: 0 });
		});

		it("should calculate total farms and hectares correctly", async () => {
			const numOfFarms = 5;

			for (let index = 0; index < numOfFarms; index++) {
				const result = await scenarios.farms.create({
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

			const response = await scenarios.farms.getTotalAreaStats();

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toMatchObject({
				totalFarms: 2,
				totalHectares: 300.75,
			});
		});
	});

	describe("GET /api/farms/stats/by-state", () => {
		it("should return empty array when no farms exist", async () => {
			const response = await scenarios.farms.getFarmsByState();

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toEqual([]);
		});

		it("should group farms by state correctly", async () => {
			await scenarios.farms.create({
				name: "Farm SP 1",
				city: "Campinas",
				state: BrazilianState.SP,
				totalArea: 100,
				arableArea: 70,
				vegetationArea: 25,
				producerId,
			});

			await scenarios.farms.create({
				name: "Farm SP 2",
				city: "Ribeirão Preto",
				state: BrazilianState.SP,
				totalArea: 200,
				arableArea: 150,
				vegetationArea: 40,
				producerId,
			});

			await scenarios.farms.create({
				name: "Farm MG",
				city: "Uberlândia",
				state: BrazilianState.MG,
				totalArea: 150,
				arableArea: 100,
				vegetationArea: 40,
				producerId,
			});

			const response = await scenarios.farms.getFarmsByState();
			expect(response.status).toBe(HttpStatus.OK);
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
			const response = await scenarios.farms.getLandUseStats();

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toMatchObject({
				totalArableArea: 0,
				totalVegetationArea: 0,
			});
		});

		it("should calculate land use correctly", async () => {
			await scenarios.farms.create({
				name: "Farm 1",
				city: "Campinas",
				state: BrazilianState.SP,
				totalArea: 100,
				arableArea: 70.5,
				vegetationArea: 25.25,
				producerId,
			});

			await scenarios.farms.create({
				name: "Farm 2",
				city: "Ribeirão Preto",
				state: BrazilianState.SP,
				totalArea: 200,
				arableArea: 150.75,
				vegetationArea: 40.5,
				producerId,
			});

			const response = await scenarios.farms.getLandUseStats();
			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toMatchObject({
				totalArableArea: 221.25,
				totalVegetationArea: 65.75,
			});
		});
	});
});
