import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { PaginatedResponse } from "@agro/shared/types";

import { ProducerSortField, SortOrder } from "@agro/shared/enums";
import {
	stripCNPJFormatting,
	stripCPFFormatting,
	validateCNPJ,
	validateCPF,
} from "@agro/shared/validators";

import {
	CreateProducerDto,
	FindAllProducersDto,
	ProducerResponseDto,
	UpdateProducerDto,
} from "./dto";
import { Producer } from "./entities/producer.entity";

/**
 * Service responsible for producer business logic and data operations.
 *
 * Handles CRUD operations for rural producers with comprehensive validation
 * of Brazilian documents (CPF/CNPJ). Uses TypeORM's Data Mapper pattern
 * with repository injection for database access.
 *
 * @example
 * ```typescript
 * // In a controller
 * constructor(private readonly producersService: ProducersService) {}
 *
 * async create(dto: CreateProducerDto) {
 *   return this.producersService.create(dto);
 * }
 * ```
 */
@Injectable()
export class ProducersService {
	/**
	 * Creates an instance of ProducersService.
	 *
	 * @param producerRepository TypeORM repository for Producer entity
	 */
	constructor(
		@InjectRepository(Producer)
		private readonly producerRepository: Repository<Producer>,
	) {}

	/**
	 * Creates a new rural producer.
	 *
	 * Validates the document (CPF or CNPJ) using Brazilian government algorithms
	 * and checks for duplicate documents before creating the producer.
	 *
	 * @param createProducerDto The producer data to create
	 *
	 * @returns The created producer
	 *
	 * @throws {BadRequestException} If the document format is invalid
	 * @throws {ConflictException} If a producer with the same document already exists
	 *
	 * @example
	 * ```typescript
	 * const producer = await service.create({
	 *   name: "João da Silva",
	 *   document: "111.444.777-35"
	 * });
	 * ```
	 */
	public async create(createProducerDto: CreateProducerDto): Promise<ProducerResponseDto> {
		const { name, document } = createProducerDto;

		const strippedDocument = this.validateAndStripDocument(document);

		await this.checkDuplicateDocument(strippedDocument);

		const producer = this.producerRepository.create({
			name,
			document: strippedDocument,
		});

		const savedProducer = await this.producerRepository.save(producer);

		return this.mapToResponseDto(savedProducer);
	}

	/**
	 * Retrieves all producers with pagination, sorting, and search.
	 *
	 * Supports filtering by name search with configurable sorting and pagination.
	 * Uses TypeORM QueryBuilder for efficient database queries.
	 *
	 * @param query Query parameters for pagination, sorting, and search
	 *
	 * @returns Paginated response with producers and metadata
	 *
	 * @example
	 * ```typescript
	 * const result = await service.findAll({
	 *   page: 1,
	 *   limit: 10,
	 *   sortBy: ProducerSortField.Name,
	 *   sortOrder: SortOrder.Ascending,
	 *   search: "Silva"
	 * });
	 * console.log(`Found ${result.total} producers`);
	 * ```
	 */
	public async findAll(
		query: FindAllProducersDto = {},
	): Promise<PaginatedResponse<ProducerResponseDto>> {
		const {
			page = 1,
			limit = 10,
			sortBy = ProducerSortField.Name,
			sortOrder = SortOrder.Ascending,
			search,
		} = query;

		const qb = this.producerRepository
			.createQueryBuilder("producer")
			.leftJoinAndSelect("producer.farms", "farms");

		if (search) qb.andWhere("producer.name ILIKE :search", { search: `%${search}%` });

		qb.orderBy(`producer.${sortBy}`, sortOrder as SortOrder);

		const skip = (page - 1) * limit;
		qb.skip(skip).take(limit);

		const [producers, total] = await qb.getManyAndCount();

		return {
			data: producers.map((producer) => this.mapToResponseDto(producer)),
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		};
	}

	/**
	 * Retrieves a single producer by ID.
	 *
	 * @param id The UUID of the producer to retrieve
	 *
	 * @returns The producer with the specified ID
	 *
	 * @throws {NotFoundException} If the producer does not exist
	 *
	 * @example
	 * ```typescript
	 * const producer = await service.findOne("550e8400-e29b-41d4-a716-446655440000");
	 * ```
	 */
	public async findOne(id: string): Promise<ProducerResponseDto> {
		const producer = await this.producerRepository.findOne({
			where: { id },
			relations: { farms: true },
		});

		if (!producer) {
			throw new NotFoundException(`Producer with ID ${id} not found`);
		}

		return this.mapToResponseDto(producer);
	}

	/**
	 * Updates an existing producer.
	 *
	 * Allows partial updates - only provided fields will be updated.
	 * If document is being updated, validates the new document and checks
	 * for duplicates.
	 *
	 * @param id The UUID of the producer to update
	 * @param updateProducerDto The fields to update
	 *
	 * @returns The updated producer
	 *
	 * @throws {NotFoundException} If the producer does not exist
	 * @throws {BadRequestException} If the new document format is invalid
	 * @throws {ConflictException} If the new document is already in use
	 *
	 * @example
	 * ```typescript
	 * const updated = await service.update(
	 *   "550e8400-e29b-41d4-a716-446655440000",
	 *   { name: "João Silva Santos" }
	 * );
	 * ```
	 */
	public async update(
		id: string,
		updateProducerDto: UpdateProducerDto,
	): Promise<ProducerResponseDto> {
		const producer = await this.producerRepository.findOne({ where: { id } });

		if (!producer) {
			throw new NotFoundException(`Producer with ID ${id} not found`);
		}

		if (updateProducerDto.document) {
			const strippedDocument = this.validateAndStripDocument(updateProducerDto.document);

			if (strippedDocument !== producer.document) {
				await this.checkDuplicateDocument(strippedDocument, id);
				updateProducerDto.document = strippedDocument;
			}
		}

		Object.assign(producer, updateProducerDto);
		const updatedProducer = await this.producerRepository.save(producer);

		return this.mapToResponseDto(updatedProducer);
	}

	/**
	 * Deletes a producer by ID.
	 *
	 * Note: This will also cascade delete all associated farms due to
	 * the database foreign key constraint with ON DELETE CASCADE.
	 *
	 * @param id The UUID of the producer to delete
	 *
	 * @throws {NotFoundException} If the producer does not exist
	 *
	 * @example
	 * ```typescript
	 * await service.delete("550e8400-e29b-41d4-a716-446655440000");
	 * ```
	 */
	public async delete(id: string): Promise<void> {
		const result = await this.producerRepository.delete(id);

		if (result.affected === 0) {
			throw new NotFoundException(`Producer with ID ${id} not found`);
		}
	}

	/**
	 * Gets the total count of all producers.
	 *
	 * @returns Total producer count
	 */
	public async getTotalCount(): Promise<number> {
		return this.producerRepository.count();
	}

	/**
	 * Validates a Brazilian document (CPF or CNPJ) and strips formatting.
	 *
	 * Determines whether the document is CPF (11 digits) or CNPJ (14 digits)
	 * and validates using the appropriate algorithm.
	 *
	 * @param document The document to validate (formatted or unformatted)
	 *
	 * @returns The document without formatting (digits only)
	 *
	 * @throws {BadRequestException} If the document format is invalid
	 *
	 */
	private validateAndStripDocument(document: string): string {
		const digitsOnly = document.replaceAll(/\D/g, "");

		if (digitsOnly.length === 11) {
			if (!validateCPF(document)) throw new BadRequestException("Invalid CPF format");

			return stripCPFFormatting(document);
		}

		if (digitsOnly.length === 14) {
			if (!validateCNPJ(document)) throw new BadRequestException("Invalid CNPJ format");

			return stripCNPJFormatting(document);
		}

		throw new BadRequestException("Document must be a valid CPF or CNPJ");
	}

	/**
	 * Checks if a document is already registered in the database.
	 *
	 * @param document The document to check (already stripped of formatting)
	 * @param excludeId Optional producer ID to exclude from the check (for updates)
	 *
	 * @throws {ConflictException} If the document is already in use
	 *
	 */
	private async checkDuplicateDocument(document: string, excludeId?: string): Promise<void> {
		const existingProducer = await this.producerRepository.findOne({
			where: { document },
		});

		if (existingProducer && existingProducer.id !== excludeId) {
			throw new ConflictException(`Producer with document ${document} already exists`);
		}
	}

	/**
	 * Maps a Producer entity to a ProducerResponseDto.
	 *
	 * @param producer The producer entity to map
	 *
	 * @returns The mapped response DTO
	 */
	private mapToResponseDto(producer: Producer): ProducerResponseDto {
		return {
			id: producer.id,
			name: producer.name,
			farms: producer.farms,
			document: producer.document,
			createdAt: producer.createdAt,
			updatedAt: producer.updatedAt,
		};
	}
}
