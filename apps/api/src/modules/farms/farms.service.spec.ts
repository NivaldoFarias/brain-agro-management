/**
 * @fileoverview Unit tests for {@link FarmsService}.
 *
 * Tests all business logic, validation rules, and repository interactions
 * using mocked dependencies and fixture data.
 */

import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { fixtures, TestConstants } from "test/fixtures";
import { Repository } from "typeorm";

import type { SetRequired } from "type-fest";

import { BrazilianState, CropType } from "@agro/shared/enums";

import { Producer } from "@/modules/producers/entities/";

import { CreateFarmDto, UpdateFarmDto } from "./dto";
import { Farm, FarmHarvest, FarmHarvestCrop, Harvest } from "./entities/";
import { FarmsService } from "./farms.service";

describe("FarmsService", () => {
	let service: FarmsService;
	let farmRepository: Repository<Farm>;
	let producerRepository: Repository<Producer>;

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

	const mockFarmRepository = {
		create: mock(),
		save: mock(),
		find: mock(),
		findOne: mock(),
		delete: mock(),
		createQueryBuilder: mock(createMockQueryBuilder) as ReturnType<
			typeof mock<() => Partial<MockQueryBuilder>>
		>,
	};

	const mockProducerRepository = {
		exists: mock(),
	};

	const mockHarvestRepository = {
		findOne: mock(),
	};

	const mockFarmHarvestRepository = {
		createQueryBuilder: mock(),
	};

	const mockFarmHarvestCropRepository = {
		createQueryBuilder: mock(),
	};

	const mockLogger = {
		setContext: mock(),
		info: mock(),
		warn: mock(),
		error: mock(),
		debug: mock(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FarmsService,
				{
					provide: getRepositoryToken(Farm),
					useValue: mockFarmRepository,
				},
				{
					provide: getRepositoryToken(Producer),
					useValue: mockProducerRepository,
				},
				{
					provide: getRepositoryToken(Harvest),
					useValue: mockHarvestRepository,
				},
				{
					provide: getRepositoryToken(FarmHarvest),
					useValue: mockFarmHarvestRepository,
				},
				{
					provide: getRepositoryToken(FarmHarvestCrop),
					useValue: mockFarmHarvestCropRepository,
				},
				{
					provide: `PinoLogger:${FarmsService.name}`,
					useValue: mockLogger,
				},
			],
		}).compile();

		service = module.get<FarmsService>(FarmsService);
		farmRepository = module.get<Repository<Farm>>(getRepositoryToken(Farm));
		producerRepository = module.get<Repository<Producer>>(getRepositoryToken(Producer));

		mockFarmRepository.create.mockReset();
		mockFarmRepository.save.mockReset();
		mockFarmRepository.find.mockReset();
		mockFarmRepository.findOne.mockReset();
		mockFarmRepository.delete.mockReset();
		mockFarmRepository.createQueryBuilder.mockReset();
		mockProducerRepository.exists.mockReset();
		mockHarvestRepository.findOne.mockReset();
		mockFarmHarvestRepository.createQueryBuilder.mockReset();
		mockFarmHarvestCropRepository.createQueryBuilder.mockReset();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
		expect(farmRepository).toBeDefined();
		expect(producerRepository).toBeDefined();
	});

	describe("create", () => {
		let createDto: CreateFarmDto;
		let mockFarm: Farm;

		beforeEach(async () => {
			createDto = await fixtures.farm.valid(TestConstants.NON_EXISTENT_UUID);
			mockFarm = {
				id: "770e9600-g40d-63f6-c938-668877662222",
				name: createDto.name,
				city: createDto.city,
				state: createDto.state,
				totalArea: createDto.totalArea,
				arableArea: createDto.arableArea,
				vegetationArea: createDto.vegetationArea,
				producerId: createDto.producerId,
				producer: {} as Producer,
				farmHarvests: [],
				createdAt: new Date("2025-11-24T10:00:00Z"),
				updatedAt: new Date("2025-11-24T10:00:00Z"),
			};
		});

		it("should create a farm with valid data", async () => {
			mockProducerRepository.exists.mockResolvedValue(true);
			mockFarmRepository.create.mockReturnValue(mockFarm);
			mockFarmRepository.save.mockResolvedValue(mockFarm);

			const result = await service.create(createDto);

			expect(result).toEqual({
				id: mockFarm.id,
				name: mockFarm.name,
				city: mockFarm.city,
				state: mockFarm.state,
				totalArea: mockFarm.totalArea,
				arableArea: mockFarm.arableArea,
				vegetationArea: mockFarm.vegetationArea,
				producerId: mockFarm.producerId,
				crops: [],
				createdAt: mockFarm.createdAt,
				updatedAt: mockFarm.updatedAt,
			});
			expect(mockProducerRepository.exists).toHaveBeenCalledWith({
				where: { id: createDto.producerId },
			});
			expect(mockFarmRepository.save).toHaveBeenCalledWith(mockFarm);
		});

		it("should throw NotFoundException when producer does not exist", async () => {
			mockProducerRepository.exists.mockResolvedValue(false);

			expect(service.create(createDto)).rejects.toThrow(NotFoundException);
			expect(mockFarmRepository.create).not.toHaveBeenCalled();
		});

		it("should throw BadRequestException when area validation fails", async () => {
			const invalidDto: CreateFarmDto = {
				...createDto,
				totalArea: 100,
				arableArea: 70,
				vegetationArea: 50,
			};

			mockProducerRepository.exists.mockResolvedValue(true);

			expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
			expect(mockFarmRepository.create).not.toHaveBeenCalled();
		});

		it("should throw BadRequestException when totalArea is zero", async () => {
			const invalidDto: CreateFarmDto = {
				...createDto,
				totalArea: 0,
			};

			mockProducerRepository.exists.mockResolvedValue(true);

			expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
		});
	});

	describe("findAll", () => {
		it("should return an array of farms", async () => {
			const mockFarms: Array<Farm> = [
				{
					id: "770e9600-g40d-63f6-c938-668877662222",
					name: "Fazenda Boa Vista",
					city: "Campinas",
					state: BrazilianState.SP,
					totalArea: 100.5,
					arableArea: 70,
					vegetationArea: 25,
					producerId: "550e8400-e29b-41d4-a716-446655440000",
					producer: {} as Producer,
					farmHarvests: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			const mockQueryBuilder = createMockQueryBuilder();
			mockQueryBuilder.getManyAndCount.mockResolvedValue([mockFarms, 1]);
			mockFarmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.findAll();

			expect(result.data).toHaveLength(1);
			expect(result.data[0]?.name).toBe("Fazenda Boa Vista");
			expect(result.total).toBe(1);
			expect(mockFarmRepository.createQueryBuilder).toHaveBeenCalledWith("farm");
		});

		it("should return an empty array when no farms exist", async () => {
			const mockQueryBuilder = createMockQueryBuilder();
			mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
			mockFarmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.findAll();

			expect(result.data).toEqual([]);
			expect(result.total).toBe(0);
		});
	});

	describe("findOne", () => {
		const mockFarm: Farm = {
			id: "770e9600-g40d-63f6-c938-668877662222",
			name: "Fazenda Boa Vista",
			city: "Campinas",
			state: BrazilianState.SP,
			totalArea: 100.5,
			arableArea: 70,
			vegetationArea: 25,
			producerId: "550e8400-e29b-41d4-a716-446655440000",
			producer: {} as Producer,
			farmHarvests: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		it("should return a farm by ID", async () => {
			const mockQueryBuilder = createMockQueryBuilder();
			mockQueryBuilder.getOne.mockResolvedValue(mockFarm);
			mockFarmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.findOne(mockFarm.id);

			expect(result.id).toBe(mockFarm.id);
			expect(result.name).toBe(mockFarm.name);
			expect(mockFarmRepository.createQueryBuilder).toHaveBeenCalledWith("farm");
			expect(mockQueryBuilder.where).toHaveBeenCalledWith("farm.id = :id", { id: mockFarm.id });
		});

		it("should throw NotFoundException when farm does not exist", async () => {
			const mockQueryBuilder = createMockQueryBuilder();
			mockQueryBuilder.getOne.mockResolvedValue(null);
			mockFarmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			expect(service.findOne("nonexistent-id")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const mockFarm: Farm = {
			id: "770e9600-g40d-63f6-c938-668877662222",
			name: "Fazenda Boa Vista",
			city: "Campinas",
			state: BrazilianState.SP,
			totalArea: 100.5,
			arableArea: 70,
			vegetationArea: 25,
			producerId: "550e8400-e29b-41d4-a716-446655440000",
			producer: {} as Producer,
			farmHarvests: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		it("should update farm name", async () => {
			const updateDto: UpdateFarmDto = { name: "Fazenda Boa Vista II" };
			const updatedFarm = { ...mockFarm, name: updateDto.name };

			mockFarmRepository.findOne.mockResolvedValue(mockFarm);
			mockFarmRepository.save.mockResolvedValue(updatedFarm);

			const result = await service.update(mockFarm.id, updateDto);

			expect(result.name).toBe("Fazenda Boa Vista II");
			expect(mockFarmRepository.save).toHaveBeenCalled();
		});

		it("should update farm with new producer", async () => {
			const updateDto: SetRequired<UpdateFarmDto, "producerId"> = {
				producerId: "660e9500-f30c-52e5-b827-557766551111",
			};
			const updatedFarm = { ...mockFarm, producerId: updateDto.producerId };

			mockFarmRepository.findOne.mockResolvedValue(mockFarm);
			mockProducerRepository.exists.mockResolvedValue(true);
			mockFarmRepository.save.mockResolvedValue(updatedFarm);

			const result = await service.update(mockFarm.id, updateDto);

			expect(result.producerId).toBe(updateDto.producerId);
			expect(mockProducerRepository.exists).toHaveBeenCalledWith({
				where: { id: updateDto.producerId },
			});
		});

		it("should throw NotFoundException when farm does not exist", async () => {
			const updateDto: UpdateFarmDto = { name: "New Name" };
			mockFarmRepository.findOne.mockResolvedValue(null);

			expect(service.update("nonexistent-id", updateDto)).rejects.toThrow(NotFoundException);
			expect(mockFarmRepository.save).not.toHaveBeenCalled();
		});

		it("should throw NotFoundException when new producer does not exist", async () => {
			const updateDto: UpdateFarmDto = { producerId: "nonexistent-producer" };
			mockFarmRepository.findOne.mockResolvedValue(mockFarm);
			mockProducerRepository.exists.mockResolvedValue(false);

			expect(service.update(mockFarm.id, updateDto)).rejects.toThrow(NotFoundException);
			expect(mockFarmRepository.save).not.toHaveBeenCalled();
		});

		it("should throw BadRequestException when updated areas violate constraints", async () => {
			const updateDto: UpdateFarmDto = { arableArea: 90 };
			mockFarmRepository.findOne.mockResolvedValue(mockFarm);

			expect(service.update(mockFarm.id, updateDto)).rejects.toThrow(BadRequestException);
			expect(mockFarmRepository.save).not.toHaveBeenCalled();
		});
	});

	describe("delete", () => {
		it("should delete a farm", async () => {
			mockFarmRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

			await service.delete("770e9600-g40d-63f6-c938-668877662222");

			expect(mockFarmRepository.delete).toHaveBeenCalledWith(
				"770e9600-g40d-63f6-c938-668877662222",
			);
		});

		it("should throw NotFoundException when farm does not exist", async () => {
			mockFarmRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

			expect(service.delete("nonexistent-id")).rejects.toThrow(NotFoundException);
		});
	});

	describe("findByProducer", () => {
		it("should return farms for a specific producer", async () => {
			const producerId = "550e8400-e29b-41d4-a716-446655440000";
			const mockFarms: Array<Farm> = [
				{
					id: "770e9600-g40d-63f6-c938-668877662222",
					name: "Fazenda Boa Vista",
					city: "Campinas",
					state: BrazilianState.SP,
					totalArea: 100.5,
					arableArea: 70,
					vegetationArea: 25,
					producerId,
					producer: {} as Producer,
					farmHarvests: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			const mockQueryBuilder = createMockQueryBuilder();
			mockQueryBuilder.getMany.mockResolvedValue(mockFarms);
			mockFarmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.findByProducer(producerId);

			expect(result).toHaveLength(1);
			expect(result[0]?.producerId).toBe(producerId);
			expect(mockFarmRepository.createQueryBuilder).toHaveBeenCalledWith("farm");
			expect(mockQueryBuilder.where).toHaveBeenCalledWith("farm.producerId = :producerId", {
				producerId,
			});
		});
	});

	describe("findByState", () => {
		it("should return farms for a specific state", async () => {
			const mockFarms: Array<Farm> = [
				{
					id: "770e9600-g40d-63f6-c938-668877662222",
					name: "Fazenda Boa Vista",
					city: "Campinas",
					state: BrazilianState.SP,
					totalArea: 100.5,
					arableArea: 70,
					vegetationArea: 25,
					producerId: "550e8400-e29b-41d4-a716-446655440000",
					producer: {} as Producer,
					farmHarvests: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			const mockQueryBuilder = createMockQueryBuilder();
			mockQueryBuilder.getMany.mockResolvedValue(mockFarms);
			mockFarmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.findByState(BrazilianState.SP);

			expect(result).toHaveLength(1);
			expect(result[0]?.state).toBe(BrazilianState.SP);
			expect(mockFarmRepository.createQueryBuilder).toHaveBeenCalledWith("farm");
			expect(mockQueryBuilder.where).toHaveBeenCalledWith("farm.state = :state", {
				state: BrazilianState.SP,
			});
		});
	});

	describe("getTotalArea", () => {
		it("should return the total area of all farms", async () => {
			const mockQueryBuilder: Partial<MockQueryBuilder> = {
				select: mock().mockReturnThis(),
				getRawOne: mock().mockResolvedValue({ total: "1234.56" }),
			};

			mockFarmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.getTotalArea();

			expect(result).toBe(1234.56);
			expect(mockQueryBuilder.select).toHaveBeenCalledWith("SUM(farm.totalArea)", "total");
		});

		it("should return 0 when no farms exist", async () => {
			const mockQueryBuilder: Partial<MockQueryBuilder> = {
				select: mock().mockReturnThis(),
				getRawOne: mock().mockResolvedValue({ total: null }),
			};

			mockFarmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.getTotalArea();

			expect(result).toBe(0);
		});
	});

	describe("countByState", () => {
		it("should return farm count grouped by state", async () => {
			const mockQueryBuilder: Partial<MockQueryBuilder> = {
				select: mock().mockReturnThis(),
				addSelect: mock().mockReturnThis(),
				groupBy: mock().mockReturnThis(),
				orderBy: mock().mockReturnThis(),
				getRawMany: mock().mockResolvedValue([
					{ state: "SP", count: "15" },
					{ state: "MG", count: "8" },
				]),
			};

			mockFarmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.countByState();

			expect(result).toEqual([
				{ state: BrazilianState.SP, count: 15 },
				{ state: BrazilianState.MG, count: 8 },
			]);
			expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith("farm.state");
			expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith("count", "DESC");
		});
	});

	describe("getLandUseStats", () => {
		it("should return land use statistics", async () => {
			const mockQueryBuilder: Partial<MockQueryBuilder> = {
				select: mock().mockReturnThis(),
				addSelect: mock().mockReturnThis(),
				getRawOne: mock().mockResolvedValue({
					arableArea: "5230.5",
					vegetationArea: "1847.2",
				}),
			};

			mockFarmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.getLandUseStats();

			expect(result).toEqual({
				arableArea: 5230.5,
				vegetationArea: 1847.2,
			});
			expect(mockQueryBuilder.select).toHaveBeenCalledWith("SUM(farm.arableArea)", "arableArea");
			expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
				"SUM(farm.vegetationArea)",
				"vegetationArea",
			);
		});

		it("should return zeros when no farms exist", async () => {
			const mockQueryBuilder: Partial<MockQueryBuilder> = {
				select: mock().mockReturnThis(),
				addSelect: mock().mockReturnThis(),
				getRawOne: mock().mockResolvedValue({
					arableArea: null,
					vegetationArea: null,
				}),
			};

			mockFarmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.getLandUseStats();

			expect(result).toEqual({
				arableArea: 0,
				vegetationArea: 0,
			});
		});
	});

	describe("getCropsDistribution", () => {
		it("should return crop distribution statistics", async () => {
			const mockQueryBuilder = {
				innerJoin: mock().mockReturnThis(),
				select: mock().mockReturnThis(),
				addSelect: mock().mockReturnThis(),
				groupBy: mock().mockReturnThis(),
				orderBy: mock().mockReturnThis(),
				getRawMany: mock().mockResolvedValue([
					{ cropType: CropType.Soy, count: "15" },
					{ cropType: CropType.Corn, count: "12" },
					{ cropType: CropType.Coffee, count: "8" },
				]),
			};

			mockFarmHarvestCropRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.getCropsDistribution();

			expect(result).toEqual([
				{ cropType: CropType.Soy, count: 15 },
				{ cropType: CropType.Corn, count: 12 },
				{ cropType: CropType.Coffee, count: 8 },
			]);
			expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith("fhc.farmHarvest", "fh");
			expect(mockQueryBuilder.select).toHaveBeenCalledWith("fhc.cropType", "cropType");
			expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith("COUNT(DISTINCT fh.farmId)", "count");
			expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith("fhc.cropType");
			expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith("count", "DESC");
		});

		it("should return empty array when no crops exist", async () => {
			const mockQueryBuilder = {
				innerJoin: mock().mockReturnThis(),
				select: mock().mockReturnThis(),
				addSelect: mock().mockReturnThis(),
				groupBy: mock().mockReturnThis(),
				orderBy: mock().mockReturnThis(),
				getRawMany: mock().mockResolvedValue([]),
			};

			mockFarmHarvestCropRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.getCropsDistribution();

			expect(result).toEqual([]);
		});
	});
});
