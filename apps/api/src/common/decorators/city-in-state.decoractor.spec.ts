/**
 * @fileoverview Tests for {@link IsCityInStateConstraint}.
 *
 * Verifies city-state validation logic using IBGE city data.
 */

import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { PinoLogger } from "nestjs-pino";

import type { Repository } from "typeorm";

import { BrazilianState } from "@agro/shared/enums";

import { City } from "@/modules/cities/entities/city.entity";

import { IsCityInStateConstraint } from "./city-in-state.decorator";

describe("IsCityInStateConstraint", () => {
	let validator: IsCityInStateConstraint;
	let cityRepository: Repository<City>;

	let logger: PinoLogger;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				IsCityInStateConstraint,
				{
					provide: getRepositoryToken(City),
					useValue: {
						createQueryBuilder: mock(),
					},
				},
				{
					provide: `PinoLogger:${IsCityInStateConstraint.name}`,
					useValue: {
						setContext: mock(),
						error: mock(),
						warn: mock(),
						info: mock(),
					},
				},
			],
		}).compile();

		validator = module.get<IsCityInStateConstraint>(IsCityInStateConstraint);
		cityRepository = module.get<Repository<City>>(getRepositoryToken(City));
		logger = module.get<PinoLogger>(`PinoLogger:${IsCityInStateConstraint.name}`);
	});

	describe("validate", () => {
		it("should return true when city exists in the specified state", async () => {
			const mockQueryBuilder = {
				where: mock().mockReturnThis(),
				andWhere: mock().mockReturnThis(),
				getExists: mock().mockResolvedValue(true),
			};

			spyOn(cityRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder as never);

			const result = await validator.validate("Campinas", {
				object: { state: BrazilianState.SP },
				property: "city",
				value: "Campinas",
				constraints: [],
				targetName: "CreateFarmDto",
			});

			expect(result).toBe(true);
			expect(mockQueryBuilder.where).toHaveBeenCalledWith("LOWER(city.name) = LOWER(:name)", {
				name: "Campinas",
			});
			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("city.state = :state", {
				state: BrazilianState.SP,
			});
		});

		it("should return false when city does not exist in the specified state", async () => {
			const mockQueryBuilder = {
				where: mock().mockReturnThis(),
				andWhere: mock().mockReturnThis(),
				getExists: mock().mockResolvedValue(false),
			};

			spyOn(cityRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder as never);

			const result = await validator.validate("InvalidCity", {
				object: { state: BrazilianState.SP },
				property: "city",
				value: "InvalidCity",
				constraints: [],
				targetName: "CreateFarmDto",
			});

			expect(result).toBe(false);
		});

		it("should return false when state is not provided", async () => {
			const result = await validator.validate("Campinas", {
				object: {},
				property: "city",
				value: "Campinas",
				constraints: [],
				targetName: "CreateFarmDto",
			});

			expect(result).toBe(false);
		});

		it("should return false when city is empty", async () => {
			const result = await validator.validate("", {
				object: { state: BrazilianState.SP },
				property: "city",
				value: "",
				constraints: [],
				targetName: "CreateFarmDto",
			});

			expect(result).toBe(false);
		});

		it("should return false and log error when database query fails", async () => {
			const mockQueryBuilder = {
				where: mock().mockReturnThis(),
				andWhere: mock().mockReturnThis(),
				getExists: mock().mockRejectedValue(new Error("Database error")),
			};

			spyOn(cityRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder);

			const result = await validator.validate("Campinas", {
				object: { state: BrazilianState.SP },
				property: "city",
				value: "Campinas",
				constraints: [],
				targetName: "CreateFarmDto",
			});

			expect(result).toBe(false);
			expect(logger.error).toHaveBeenCalledWith(
				expect.objectContaining({
					err: expect.any(Error),
					city: "Campinas",
					state: BrazilianState.SP,
				}),
				"Failed to validate city-state combination",
			);
		});

		it("should perform case-insensitive city name matching", async () => {
			const mockQueryBuilder = {
				where: mock().mockReturnThis(),
				andWhere: mock().mockReturnThis(),
				getExists: mock().mockResolvedValue(true),
			};

			spyOn(cityRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder);

			await validator.validate("CAMPINAS", {
				object: { state: BrazilianState.SP },
				property: "city",
				value: "CAMPINAS",
				constraints: [],
				targetName: "CreateFarmDto",
			});

			expect(mockQueryBuilder.where).toHaveBeenCalledWith("LOWER(city.name) = LOWER(:name)", {
				name: "CAMPINAS",
			});
		});
	});

	describe("defaultMessage", () => {
		it("should return error message with city and state", () => {
			const message = validator.defaultMessage({
				object: { state: BrazilianState.SP },
				property: "city",
				value: "InvalidCity",
				constraints: [],
				targetName: "CreateFarmDto",
			});

			expect(message).toBe("City 'InvalidCity' does not exist in state 'SP'");
		});

		it("should return error message when state is missing", () => {
			const message = validator.defaultMessage({
				object: {},
				property: "city",
				value: "Campinas",
				constraints: [],
				targetName: "CreateFarmDto",
			});

			expect(message).toBe("State must be provided to validate city");
		});
	});
});
