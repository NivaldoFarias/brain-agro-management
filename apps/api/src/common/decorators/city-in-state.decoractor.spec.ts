import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { PinoLogger } from "nestjs-pino";

import type { Repository } from "typeorm";

import { BrazilianState } from "@agro/shared/utils/constants.util";

import { City } from "@/modules/cities/entities/city.entity";

import { IsCityInStateConstraint } from "./city-in-state.decorator";

/**
 * @fileoverview Tests for {@link IsCityInStateConstraint}.
 *
 * Verifies city-state validation logic using IBGE city data.
 */

describe("IsCityInStateConstraint", () => {
	let validator: IsCityInStateConstraint;
	let cityRepository: Repository<City>;

	let logger: PinoLogger;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				IsCityInStateConstraint,
				{
					provide: getRepositoryToken(City),
					useValue: {
						createQueryBuilder: jest.fn(),
					},
				},
				{
					provide: PinoLogger,
					useValue: {
						setContext: jest.fn(),
						error: jest.fn(),
						warn: jest.fn(),
						info: jest.fn(),
					},
				},
			],
		}).compile();

		validator = module.get<IsCityInStateConstraint>(IsCityInStateConstraint);
		cityRepository = module.get<Repository<City>>(getRepositoryToken(City));
		logger = module.get<PinoLogger>(PinoLogger);
	});

	describe("validate", () => {
		it("should return true when city exists in the specified state", async () => {
			const mockQueryBuilder = {
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getExists: jest.fn().mockResolvedValue(true),
			};

			jest.spyOn(cityRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder as never);

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
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getExists: jest.fn().mockResolvedValue(false),
			};

			jest.spyOn(cityRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder as never);

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
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getExists: jest.fn().mockRejectedValue(new Error("Database error")),
			};

			jest.spyOn(cityRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder as never);

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
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getExists: jest.fn().mockResolvedValue(true),
			};

			jest.spyOn(cityRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder as never);

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
