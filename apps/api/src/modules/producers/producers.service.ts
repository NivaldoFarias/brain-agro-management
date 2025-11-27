import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { OrderBy } from "@agro/shared/utils";
import {
	stripCNPJFormatting,
	stripCPFFormatting,
	validateCNPJ,
	validateCPF,
} from "@agro/shared/validators";

import { CreateProducerDto, ProducerResponseDto, UpdateProducerDto } from "./dto";
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
	 * @param producerRepository - TypeORM repository for Producer entity
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
	 * @param createProducerDto - The producer data to create
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
	async create(createProducerDto: CreateProducerDto): Promise<ProducerResponseDto> {
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
	 * Retrieves all producers from the database.
	 *
	 * @returns Array of all producers
	 *
	 * @example
	 * ```typescript
	 * const producers = await service.findAll();
	 * console.log(`Found ${producers.length} producers`);
	 * ```
	 */
	async findAll(): Promise<Array<ProducerResponseDto>> {
		const producers = await this.producerRepository.find({
			order: { name: OrderBy.Ascending },
		});

		return producers.map((producer) => this.mapToResponseDto(producer));
	}

	/**
	 * Retrieves a single producer by ID.
	 *
	 * @param id - The UUID of the producer to retrieve
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
	async findOne(id: string): Promise<ProducerResponseDto> {
		const producer = await this.producerRepository.findOne({
			where: { id },
			relations: ["farms"],
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
	 * @param id - The UUID of the producer to update
	 * @param updateProducerDto - The fields to update
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
	async update(id: string, updateProducerDto: UpdateProducerDto): Promise<ProducerResponseDto> {
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
	 * @param id - The UUID of the producer to delete
	 *
	 * @throws {NotFoundException} If the producer does not exist
	 *
	 * @example
	 * ```typescript
	 * await service.delete("550e8400-e29b-41d4-a716-446655440000");
	 * ```
	 */
	async delete(id: string): Promise<void> {
		const result = await this.producerRepository.delete(id);

		if (result.affected === 0) {
			throw new NotFoundException(`Producer with ID ${id} not found`);
		}
	}

	/**
	 * Validates a Brazilian document (CPF or CNPJ) and strips formatting.
	 *
	 * Determines whether the document is CPF (11 digits) or CNPJ (14 digits)
	 * and validates using the appropriate algorithm.
	 *
	 * @param document - The document to validate (formatted or unformatted)
	 *
	 * @returns The document without formatting (digits only)
	 *
	 * @throws {BadRequestException} If the document format is invalid
	 *
	 * @private
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
	 * @param document - The document to check (already stripped of formatting)
	 * @param excludeId - Optional producer ID to exclude from the check (for updates)
	 *
	 * @throws {ConflictException} If the document is already in use
	 *
	 * @private
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
	 * @param producer - The producer entity to map
	 *
	 * @returns The mapped response DTO
	 *
	 * @private
	 */
	private mapToResponseDto(producer: Producer): ProducerResponseDto {
		return {
			id: producer.id,
			name: producer.name,
			document: producer.document,
			createdAt: producer.createdAt,
			updatedAt: producer.updatedAt,
		};
	}
}
