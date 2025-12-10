/**
 * @fileoverview Tests for {@link IsCityInStateConstraint}.
 *
 * Verifies city-state validation logic using IBGE city data.
 */

import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { PinoLogger } from "nestjs-pino";

import type { Repository } from "typeorm";

import { BrazilianState } from "@agro/shared/enums";

import { City } from "@/modules/cities/entities/city.entity";

import { IsCityInStateConstraint } from "./city-in-state.decorator";

describe("IsCityInStateConstraint", () => {
	let validator: IsCityInStateConstraint;
	let cityRepository: Repository<City>;
	let logger: PinoLogger;

	/**
	 * Mock repositories with common methods.
	 */
	interface MockQueryBuilder {
		leftJoinAndSelect: ReturnType<typeof mock>;
		where: ReturnType<typeof mock>;
		andWhere: ReturnType<typeof mock>;
		orderBy: ReturnType<typeof mock>;
		skip: ReturnType<typeof mock>;
		take: ReturnType<typeof mock>;
		select: ReturnType<typeof mock>;
		addSelect: ReturnType<typeof mock>;
		groupBy: ReturnType<typeof mock>;
		getExists: ReturnType<typeof mock>;
		getRawMany: ReturnType<typeof mock>;
		getMany: ReturnType<typeof mock>;
		getOne: ReturnType<typeof mock>;
		getManyAndCount: ReturnType<typeof mock>;
		getRawOne: ReturnType<typeof mock>;
	}

	const createMockQueryBuilder = (): MockQueryBuilder => {
		const qb: Partial<MockQueryBuilder> = {
			getRawMany: mock(),
			getMany: mock(),
			getOne: mock(),
			getManyAndCount: mock(),
			getRawOne: mock(),
			getExists: mock(),
		};

		qb.leftJoinAndSelect = mock(() => qb);
		qb.where = mock(() => qb);
		qb.andWhere = mock(() => qb);
		qb.orderBy = mock(() => qb);
		qb.skip = mock(() => qb);
		qb.take = mock(() => qb);
		qb.select = mock(() => qb);
		qb.addSelect = mock(() => qb);
		qb.groupBy = mock(() => qb);

		return qb as MockQueryBuilder;
	};

	/** Mock repository with common methods */
	const mockRepository = {
		create: mock(),
		save: mock(),
		find: mock(),
		findOne: mock(),
		delete: mock(),
		createQueryBuilder: mock(createMockQueryBuilder) as ReturnType<
			typeof mock<() => Partial<MockQueryBuilder>>
		>,
	};

	const mockLogger = {
		setContext: mock(),
		info: mock(),
		warn: mock(),
		error: mock(),
		debug: mock(),
	};

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				IsCityInStateConstraint,
				{
					provide: getRepositoryToken(City),
					useValue: mockRepository,
				},
				{
					provide: `PinoLogger:${IsCityInStateConstraint.name}`,
					useValue: mockLogger,
				},
			],
		}).compile();

		validator = module.get<IsCityInStateConstraint>(IsCityInStateConstraint);
		cityRepository = module.get<Repository<City>>(getRepositoryToken(City));
		logger = module.get<PinoLogger>(`PinoLogger:${IsCityInStateConstraint.name}`);

		mockRepository.create.mockReset();
		mockRepository.save.mockReset();
		mockRepository.find.mockReset();
		mockRepository.findOne.mockReset();
		mockRepository.delete.mockReset();
		mockRepository.createQueryBuilder.mockReset();
	});

	it("should be defined", () => {
		expect(validator).toBeDefined();
		expect(cityRepository).toBeDefined();
	});

	describe("validate", () => {
		it("should return true when city exists in the specified state", async () => {
			const mockQueryBuilder = createMockQueryBuilder();
			mockQueryBuilder.getExists.mockResolvedValue(true);
			mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await validator.validate("Campinas", {
				object: { state: BrazilianState.SP },
				property: "city",
				value: "Campinas",
				constraints: [],
				targetName: "CreateFarmDto",
			});

			expect(result).toBe(true);
			expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("city");
			expect(mockQueryBuilder.where).toHaveBeenCalledWith("LOWER(city.name) = LOWER(:name)", {
				name: "Campinas",
			});
			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("city.state = :state", {
				state: BrazilianState.SP,
			});
		});

		it("should return false when city does not exist in the specified state", async () => {
			const mockQueryBuilder = createMockQueryBuilder();
			mockQueryBuilder.getExists.mockResolvedValue(false);
			mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await validator.validate("InvalidCity", {
				object: { state: BrazilianState.SP },
				property: "city",
				value: "InvalidCity",
				constraints: [],
				targetName: "CreateFarmDto",
			});

			expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("city");
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
			const mockQueryBuilder = createMockQueryBuilder();
			mockQueryBuilder.getExists.mockRejectedValue(new Error("Database error"));
			mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await validator.validate("Campinas", {
				object: { state: BrazilianState.SP },
				property: "city",
				value: "Campinas",
				constraints: [],
				targetName: "CreateFarmDto",
			});

			expect(result).toBe(false);
			expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("city");
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
			const mockQueryBuilder = createMockQueryBuilder();
			mockQueryBuilder.getExists.mockResolvedValue(true);
			mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await validator.validate("CAMPINAS", {
				object: { state: BrazilianState.SP },
				property: "city",
				value: "CAMPINAS",
				constraints: [],
				targetName: "CreateFarmDto",
			});

			expect(result).toBe(true);
			expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("city");
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
