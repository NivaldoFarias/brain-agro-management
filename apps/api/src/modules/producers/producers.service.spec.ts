/**
 * @fileoverview Unit tests for {@link ProducersService}.
 *
 * Tests all business logic, validation rules, and repository interactions
 * using mocked dependencies and test constants.
 */

import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { fixtures, TestConstants } from "test/fixtures";
import { Repository } from "typeorm";

import { UpdateProducerDto } from "./dto";
import { Producer } from "./entities/producer.entity";
import { ProducersService } from "./producers.service";

describe("ProducersService", () => {
	let service: ProducersService;
	let repository: Repository<Producer>;

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
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProducersService,
				{
					provide: getRepositoryToken(Producer),
					useValue: mockRepository,
				},
				{
					provide: `PinoLogger:${ProducersService.name}`,
					useValue: mockLogger,
				},
			],
		}).compile();

		service = module.get<ProducersService>(ProducersService);
		repository = module.get<Repository<Producer>>(getRepositoryToken(Producer));

		mockRepository.create.mockReset();
		mockRepository.save.mockReset();
		mockRepository.find.mockReset();
		mockRepository.findOne.mockReset();
		mockRepository.delete.mockReset();
		mockRepository.createQueryBuilder.mockReset();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
		expect(repository).toBeDefined();
	});

	describe("create", () => {
		let createDto: ReturnType<typeof fixtures.producer.validCPF>;
		let mockProducer: Producer;

		beforeEach(() => {
			createDto = fixtures.producer.validCPF();
			mockProducer = {
				id: TestConstants.NON_EXISTENT_UUID,
				name: createDto.name,
				document: createDto.document.replaceAll(/\D/g, ""),
				farms: [],
				createdAt: new Date("2025-11-24T10:00:00Z"),
				updatedAt: new Date("2025-11-24T10:00:00Z"),
			};
		});

		it("should create a producer with valid CPF", async () => {
			mockRepository.findOne.mockResolvedValue(null);
			mockRepository.create.mockReturnValue(mockProducer);
			mockRepository.save.mockResolvedValue(mockProducer);

			const result = await service.create(createDto);

			expect(result).toEqual({
				id: mockProducer.id,
				name: mockProducer.name,
				document: mockProducer.document,
				farms: [],
				createdAt: mockProducer.createdAt,
				updatedAt: mockProducer.updatedAt,
			});
			expect(mockRepository.create).toHaveBeenCalled();
			expect(mockRepository.save).toHaveBeenCalledWith(mockProducer);
		});

		it("should create a producer with valid CNPJ", async () => {
			const cnpjDto = fixtures.producer.validCNPJ();
			const mockProducerCNPJ: Producer = {
				...mockProducer,
				...cnpjDto,
			};
			mockRepository.findOne.mockResolvedValue(null);
			mockRepository.create.mockReturnValue(mockProducerCNPJ);
			mockRepository.save.mockResolvedValue(mockProducerCNPJ);

			const result = await service.create(cnpjDto);

			expect(result.document).toBe(cnpjDto.document);
			expect(mockRepository.create).toHaveBeenCalled();
		});

		it("should throw BadRequestException for invalid CPF", async () => {
			const invalidDto = fixtures.producer.invalidCPF();

			expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should throw BadRequestException for invalid CNPJ", async () => {
			const invalidDto = fixtures.producer.invalidCNPJ();

			expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should throw ConflictException for duplicate document", async () => {
			mockRepository.findOne.mockResolvedValue(mockProducer);

			expect(service.create(createDto)).rejects.toThrow(ConflictException);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});
	});

	describe("findAll", () => {
		it("should return an array of producers", async () => {
			const mockProducers: Array<Producer> = [
				{
					id: "550e8400-e29b-41d4-a716-446655440000",
					name: "João da Silva",
					document: "11144477735",
					farms: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "660e9500-f30c-52e5-b827-557766551111",
					name: "Maria Santos",
					document: "22255588846",
					farms: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			const mockQueryBuilder = createMockQueryBuilder();
			mockQueryBuilder.getManyAndCount.mockResolvedValue([mockProducers, mockProducers.length]);
			mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.findAll();

			expect(result.data).toHaveLength(mockProducers.length);

			const first = result.data.at(0);
			const second = result.data.at(1);

			expect(first).toBeDefined();

			if (first) expect(first.name).toBe(mockProducers[0]?.name ?? "");

			expect(second).toBeDefined();

			if (second) expect(second.name).toBe(mockProducers[1]?.name ?? "");
			expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("producer");
		});

		it("should return an empty array when no producers exist", async () => {
			const mockQueryBuilder = createMockQueryBuilder();
			mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
			mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.findAll();

			expect(result.data).toEqual([]);
		});
	});

	describe("findOne", () => {
		const mockProducer: Producer = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			name: "João da Silva",
			document: "11144477735",
			farms: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		it("should return a producer by ID", async () => {
			const mockQueryBuilder = createMockQueryBuilder();
			mockQueryBuilder.getOne.mockResolvedValue(mockProducer);
			mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const result = await service.findOne(mockProducer.id);

			expect(result.id).toBe(mockProducer.id);
			expect(result.name).toBe(mockProducer.name);
			expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("producer");
			expect(mockQueryBuilder.where).toHaveBeenCalledWith("producer.id = :id", {
				id: mockProducer.id,
			});
		});

		it("should throw NotFoundException when producer does not exist", async () => {
			const mockQueryBuilder = createMockQueryBuilder();
			mockQueryBuilder.getOne.mockResolvedValue(null);
			mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			expect(service.findOne("nonexistent-id")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const mockProducer: Producer = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			name: "João da Silva",
			document: "11144477735",
			farms: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		it("should update producer name", async () => {
			const updateDto: UpdateProducerDto = { name: "João Silva Santos" };
			const updatedProducer = { ...mockProducer, name: updateDto.name };

			mockRepository.findOne.mockResolvedValue(mockProducer);
			mockRepository.save.mockResolvedValue(updatedProducer);

			const result = await service.update(mockProducer.id, updateDto);

			expect(result.name).toBe("João Silva Santos");
			expect(mockRepository.save).toHaveBeenCalled();
		});

		it("should update producer document with valid CPF", async () => {
			const newProducer = fixtures.producer.validCPF();
			const updateDto: UpdateProducerDto = { document: newProducer.document };
			const updatedProducer: Producer = {
				...mockProducer,
				document: newProducer.document.replaceAll(/\D/g, ""),
			};

			mockRepository.findOne.mockResolvedValueOnce(mockProducer).mockResolvedValueOnce(null);
			mockRepository.save.mockResolvedValue(updatedProducer);

			const result = await service.update(mockProducer.id, updateDto);

			expect(result.document).toBe(newProducer.document.replaceAll(/\D/g, ""));
		});

		it("should throw NotFoundException when producer does not exist", async () => {
			const updateDto: UpdateProducerDto = { name: "New Name" };
			mockRepository.findOne.mockResolvedValue(null);

			expect(service.update("nonexistent-id", updateDto)).rejects.toThrow(NotFoundException);
			expect(mockRepository.save).not.toHaveBeenCalled();
		});

		it("should throw BadRequestException for invalid document", async () => {
			const updateDto: UpdateProducerDto = { document: fixtures.producer.invalidCPF().document };
			mockRepository.findOne.mockResolvedValue(mockProducer);

			expect(service.update(mockProducer.id, updateDto)).rejects.toThrow(BadRequestException);
			expect(mockRepository.save).not.toHaveBeenCalled();
		});

		it("should throw ConflictException when document is already in use", async () => {
			const newProducer = fixtures.producer.validCPF();
			const newCpfClean = newProducer.document.replaceAll(/\D/g, "");
			const updateDto: UpdateProducerDto = { document: newProducer.document };
			const existingProducer: Producer = {
				...mockProducer,
				id: "different-id",
				document: newCpfClean,
			};

			mockRepository.findOne.mockImplementation(
				(options: { where?: { id?: string; document?: string } }) => {
					if (options.where?.id === mockProducer.id) {
						return Promise.resolve(mockProducer);
					}
					if (options.where?.document === newCpfClean) {
						return Promise.resolve(existingProducer);
					}
					return Promise.resolve(null);
				},
			);

			expect(service.update(mockProducer.id, updateDto)).rejects.toThrow(ConflictException);
			expect(mockRepository.save).not.toHaveBeenCalled();
		});
	});

	describe("delete", () => {
		it("should delete a producer", async () => {
			mockRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

			await service.delete(TestConstants.NON_EXISTENT_UUID);

			expect(mockRepository.delete).toHaveBeenCalledWith("550e8400-e29b-41d4-a716-446655440000");
		});

		it("should throw NotFoundException when producer does not exist", async () => {
			mockRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

			expect(service.delete("nonexistent-id")).rejects.toThrow(NotFoundException);
		});
	});
});
