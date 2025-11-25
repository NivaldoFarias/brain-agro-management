import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Producer } from "../database/entities";

import { CreateProducerDto, UpdateProducerDto } from "./dto";
import { ProducersService } from "./producers.service";

describe("ProducersService", () => {
	let service: ProducersService;
	let repository: Repository<Producer>;

	/**
	 * Mock repository with common methods.
	 */
	const mockRepository = {
		create: jest.fn(),
		save: jest.fn(),
		find: jest.fn(),
		findOne: jest.fn(),
		delete: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProducersService,
				{
					provide: getRepositoryToken(Producer),
					useValue: mockRepository,
				},
			],
		}).compile();

		service = module.get<ProducersService>(ProducersService);
		repository = module.get<Repository<Producer>>(getRepositoryToken(Producer));

		jest.clearAllMocks();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
		expect(repository).toBeDefined();
	});

	describe("create", () => {
		const createDto: CreateProducerDto = {
			name: "João da Silva",
			document: "111.444.777-35",
		};

		const mockProducer: Producer = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			name: "João da Silva",
			document: "11144477735",
			farms: Promise.resolve([]),
			createdAt: new Date("2025-11-24T10:00:00Z"),
			updatedAt: new Date("2025-11-24T10:00:00Z"),
		};

		it("should create a producer with valid CPF", async () => {
			mockRepository.findOne.mockResolvedValue(null);
			mockRepository.create.mockReturnValue(mockProducer);
			mockRepository.save.mockResolvedValue(mockProducer);

			const result = await service.create(createDto);

			expect(result).toEqual({
				id: mockProducer.id,
				name: mockProducer.name,
				document: mockProducer.document,
				createdAt: mockProducer.createdAt,
				updatedAt: mockProducer.updatedAt,
			});
			expect(mockRepository.create).toHaveBeenCalledWith({
				name: "João da Silva",
				document: "11144477735",
			});
			expect(mockRepository.save).toHaveBeenCalledWith(mockProducer);
		});

		it("should create a producer with valid CNPJ", async () => {
			const cnpjDto: CreateProducerDto = {
				name: "Fazenda ABC Ltda",
				document: "11.222.333/0001-81",
			};

			const mockProducerCNPJ = { ...mockProducer, document: "11222333000181" };
			mockRepository.findOne.mockResolvedValue(null);
			mockRepository.create.mockReturnValue(mockProducerCNPJ);
			mockRepository.save.mockResolvedValue(mockProducerCNPJ);

			const result = await service.create(cnpjDto);

			expect(result.document).toBe("11222333000181");
			expect(mockRepository.create).toHaveBeenCalledWith({
				name: "Fazenda ABC Ltda",
				document: "11222333000181",
			});
		});

		it("should throw BadRequestException for invalid CPF", async () => {
			const invalidDto: CreateProducerDto = {
				name: "João da Silva",
				document: "111.111.111-11",
			};

			await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should throw BadRequestException for invalid CNPJ", async () => {
			const invalidDto: CreateProducerDto = {
				name: "Fazenda ABC Ltda",
				document: "11.111.111/1111-11",
			};

			await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it("should throw ConflictException for duplicate document", async () => {
			mockRepository.findOne.mockResolvedValue(mockProducer);

			await expect(service.create(createDto)).rejects.toThrow(ConflictException);
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
					farms: Promise.resolve([]),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "660e9500-f30c-52e5-b827-557766551111",
					name: "Maria Santos",
					document: "22255588846",
					farms: Promise.resolve([]),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			mockRepository.find.mockResolvedValue(mockProducers);

			const result = await service.findAll();

			expect(result).toHaveLength(2);
			expect(result[0]?.name).toBe("João da Silva");
			expect(result[1]?.name).toBe("Maria Santos");
			expect(mockRepository.find).toHaveBeenCalledWith({
				order: { name: "ASC" },
			});
		});

		it("should return an empty array when no producers exist", async () => {
			mockRepository.find.mockResolvedValue([]);

			const result = await service.findAll();

			expect(result).toEqual([]);
		});
	});

	describe("findOne", () => {
		const mockProducer: Producer = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			name: "João da Silva",
			document: "11144477735",
			farms: Promise.resolve([]),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		it("should return a producer by ID", async () => {
			mockRepository.findOne.mockResolvedValue(mockProducer);

			const result = await service.findOne(mockProducer.id);

			expect(result.id).toBe(mockProducer.id);
			expect(result.name).toBe(mockProducer.name);
			expect(mockRepository.findOne).toHaveBeenCalledWith({
				where: { id: mockProducer.id },
				relations: ["farms"],
			});
		});

		it("should throw NotFoundException when producer does not exist", async () => {
			mockRepository.findOne.mockResolvedValue(null);

			await expect(service.findOne("nonexistent-id")).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		const mockProducer: Producer = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			name: "João da Silva",
			document: "11144477735",
			farms: Promise.resolve([]),
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
			const updateDto: UpdateProducerDto = { document: "222.555.888-46" };
			const updatedProducer = { ...mockProducer, document: "22255588846" };

			mockRepository.findOne.mockResolvedValueOnce(mockProducer).mockResolvedValueOnce(null);
			mockRepository.save.mockResolvedValue(updatedProducer);

			const result = await service.update(mockProducer.id, updateDto);

			expect(result.document).toBe("22255588846");
		});

		it("should throw NotFoundException when producer does not exist", async () => {
			const updateDto: UpdateProducerDto = { name: "New Name" };
			mockRepository.findOne.mockResolvedValue(null);

			await expect(service.update("nonexistent-id", updateDto)).rejects.toThrow(NotFoundException);
			expect(mockRepository.save).not.toHaveBeenCalled();
		});

		it("should throw BadRequestException for invalid document", async () => {
			const updateDto: UpdateProducerDto = { document: "111.111.111-11" };
			mockRepository.findOne.mockResolvedValue(mockProducer);

			await expect(service.update(mockProducer.id, updateDto)).rejects.toThrow(BadRequestException);
			expect(mockRepository.save).not.toHaveBeenCalled();
		});

		it("should throw ConflictException when document is already in use", async () => {
			const updateDto: UpdateProducerDto = { document: "111.444.777-35" }; // Valid CPF
			const existingProducer = { ...mockProducer, id: "different-id", document: "11144477735" };

			// First call: find the producer being updated
			// Second call: find existing producer with the new document
			mockRepository.findOne.mockImplementation(
				(options: { where?: { id?: string; document?: string } }) => {
					if (options?.where?.id === mockProducer.id) {
						return Promise.resolve(mockProducer);
					}
					if (options?.where?.document === "11144477735") {
						return Promise.resolve(existingProducer);
					}
					return Promise.resolve(null);
				},
			);

			await expect(service.update(mockProducer.id, updateDto)).rejects.toThrow(ConflictException);
			expect(mockRepository.save).not.toHaveBeenCalled();
		});
	});

	describe("delete", () => {
		it("should delete a producer", async () => {
			mockRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

			await service.delete("550e8400-e29b-41d4-a716-446655440000");

			expect(mockRepository.delete).toHaveBeenCalledWith("550e8400-e29b-41d4-a716-446655440000");
		});

		it("should throw NotFoundException when producer does not exist", async () => {
			mockRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

			await expect(service.delete("nonexistent-id")).rejects.toThrow(NotFoundException);
		});
	});
});
