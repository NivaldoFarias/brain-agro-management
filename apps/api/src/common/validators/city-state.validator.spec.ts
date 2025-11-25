import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { validate } from "class-validator";
import { Repository } from "typeorm";

import { BrazilianState, City } from "@/database/entities";

import { CreateFarmDto } from "../../farms/dto/create-farm.dto";

import { IsCityInStateConstraint } from "./city-state.validator";

describe("IsCityInStateConstraint", () => {
	let validator: IsCityInStateConstraint;
	let cityRepository: Repository<City>;

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
			],
		}).compile();

		validator = module.get<IsCityInStateConstraint>(IsCityInStateConstraint);
		cityRepository = module.get<Repository<City>>(getRepositoryToken(City));
	});

	describe("validate", () => {
		it("should return true when city exists in the specified state", async () => {
			const mockQueryBuilder = {
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getExists: jest.fn().mockResolvedValue(true),
			};

			jest.spyOn(cityRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder as any);

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

			jest.spyOn(cityRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder as any);

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
			const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

			const mockQueryBuilder = {
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getExists: jest.fn().mockRejectedValue(new Error("Database error")),
			};

			jest.spyOn(cityRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder as any);

			const result = await validator.validate("Campinas", {
				object: { state: BrazilianState.SP },
				property: "city",
				value: "Campinas",
				constraints: [],
				targetName: "CreateFarmDto",
			});

			expect(result).toBe(false);
			expect(consoleErrorSpy).toHaveBeenCalledWith("City validation error:", expect.any(Error));

			consoleErrorSpy.mockRestore();
		});

		it("should perform case-insensitive city name matching", async () => {
			const mockQueryBuilder = {
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getExists: jest.fn().mockResolvedValue(true),
			};

			jest.spyOn(cityRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder as any);

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

	describe("Integration with CreateFarmDto", () => {
		it("should validate successfully with valid city-state combination", async () => {
			const dto = new CreateFarmDto();
			dto.name = "Test Farm";
			dto.city = "Campinas";
			dto.state = BrazilianState.SP;
			dto.totalArea = 100;
			dto.arableArea = 70;
			dto.vegetationArea = 25;
			dto.producerId = "550e8400-e29b-41d4-a716-446655440000";

			const mockQueryBuilder = {
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getExists: jest.fn().mockResolvedValue(true),
			};

			jest.spyOn(cityRepository, "createQueryBuilder").mockReturnValue(mockQueryBuilder as any);

			const errors = await validate(dto);
			const cityErrors = errors.filter((error) => error.property === "city");

			expect(cityErrors).toHaveLength(0);
		});
	});
});
