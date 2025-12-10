import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectPinoLogger } from "nestjs-pino";
import { Repository } from "typeorm";

import type { PinoLogger } from "nestjs-pino";

import type { BrazilianState, CropType } from "@agro/shared/enums";
import type { Farm as FarmType, PaginatedResponse } from "@agro/shared/types";

import { ProducerSortField, SortOrder } from "@agro/shared/enums";
import {
	stripCNPJFormatting,
	stripCPFFormatting,
	validateCNPJ,
	validateCPF,
} from "@agro/shared/validators";

import { Farm } from "@/modules/farms/entities";

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

		@InjectPinoLogger(ProducersService.name)
		private readonly logger: PinoLogger,
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

		this.logger.debug({ name }, "Creating new producer");

		const strippedDocument = this.validateAndStripDocument(document);

		await this.checkDuplicateDocument(strippedDocument);

		const producer = this.producerRepository.create({
			name,
			document: strippedDocument,
		});

		const savedProducer = await this.producerRepository.save(producer);

		this.logger.info({ producerId: savedProducer.id, name }, "Producer created successfully");

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

		this.logger.debug({ page, limit, search, sortBy }, "Fetching producers");

		const qb = this.producerRepository
			.createQueryBuilder("producer")
			.leftJoinAndSelect("producer.farms", "farms")
			.leftJoinAndSelect("farms.farmHarvests", "farmHarvests")
			.leftJoinAndSelect("farmHarvests.crops", "crops");

		if (search) qb.andWhere("producer.name LIKE :search", { search: `%${search}%` });

		qb.orderBy(`producer.${sortBy}`, sortOrder as SortOrder);

		const skip = (page - 1) * limit;
		qb.skip(skip).take(limit);

		const [producers, total] = await qb.getManyAndCount();

		this.logger.debug(
			{
				totalFound: total,
				returnedCount: producers.length,
				page,
				totalPages: Math.ceil(total / limit),
			},
			"Producers query completed",
		);

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
		this.logger.debug({ producerId: id }, "Fetching producer by ID");

		const producer = await this.producerRepository
			.createQueryBuilder("producer")
			.leftJoinAndSelect("producer.farms", "farms")
			.leftJoinAndSelect("farms.farmHarvests", "farmHarvests")
			.leftJoinAndSelect("farmHarvests.crops", "crops")
			.where("producer.id = :id", { id })
			.getOne();

		if (!producer) {
			this.logger.warn({ producerId: id }, "Producer not found");
			throw new NotFoundException(`Producer with ID ${id} not found`);
		}

		this.logger.debug({ producerId: id, name: producer.name }, "Producer retrieved successfully");

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
		this.logger.debug(
			{ producerId: id, updates: Object.keys(updateProducerDto) },
			"Updating producer",
		);

		const producer = await this.producerRepository.findOne({ where: { id } });

		if (!producer) {
			this.logger.warn({ producerId: id }, "Producer not found for update");
			throw new NotFoundException(`Producer with ID ${id} not found`);
		}

		if (updateProducerDto.document) {
			this.logger.debug({ producerId: id }, "Validating new document");
			const strippedDocument = this.validateAndStripDocument(updateProducerDto.document);

			if (strippedDocument !== producer.document) {
				await this.checkDuplicateDocument(strippedDocument, id);
				updateProducerDto.document = strippedDocument;
			}
		}

		Object.assign(producer, updateProducerDto);
		const updatedProducer = await this.producerRepository.save(producer);

		this.logger.info(
			{ producerId: updatedProducer.id, name: updatedProducer.name },
			"Producer updated successfully",
		);

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
		this.logger.debug({ producerId: id }, "Deleting producer");

		const result = await this.producerRepository.delete(id);

		if (result.affected === 0) {
			this.logger.warn({ producerId: id }, "Producer not found for deletion");
			throw new NotFoundException(`Producer with ID ${id} not found`);
		}

		this.logger.info({ producerId: id }, "Producer deleted successfully");
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
	 * Determines whether the document is CPF (11 digits) or CNPJ
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

		this.logger.debug({ documentLength: digitsOnly.length }, "Validating document format");

		if (digitsOnly.length === 11) {
			if (!validateCPF(document)) {
				this.logger.warn("Invalid CPF format provided");
				throw new BadRequestException("Invalid CPF format");
			}

			this.logger.debug("CPF validated successfully");

			return stripCPFFormatting(document);
		} else {
			if (!validateCNPJ(document)) {
				this.logger.warn("Invalid CNPJ format provided");

				throw new BadRequestException("Invalid CNPJ format");
			}

			this.logger.debug("CNPJ validated successfully");

			return stripCNPJFormatting(document);
		}
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
		this.logger.debug({ documentLength: document.length }, "Checking for duplicate document");

		const existingProducer = await this.producerRepository.findOne({
			where: { document },
		});

		if (existingProducer && existingProducer.id !== excludeId) {
			this.logger.warn(
				{ existingProducerId: existingProducer.id, excludeId },
				"Duplicate document detected",
			);
			throw new ConflictException(`Producer with document ${document} already exists`);
		}

		this.logger.debug("Document uniqueness verified");
	}

	/**
	 * Maps a Producer entity to a ProducerResponseDto.
	 *
	 * Extracts crops from each farm's harvests and includes them in the response.
	 *
	 * @param producer The producer entity to map (with eagerly loaded farms, farmHarvests, and crops)
	 *
	 * @returns The mapped response DTO with farms containing flattened crops arrays
	 */
	private mapToResponseDto(producer: Producer): ProducerResponseDto {
		const farmsWithCrops =
			producer.farms?.map((farm: Farm) => {
				const cropSet = new Set<string>();

				if (Array.isArray(farm.farmHarvests) && farm.farmHarvests.length > 0) {
					for (const farmHarvest of farm.farmHarvests) {
						const harvestCrops = Array.isArray(farmHarvest.crops) ? farmHarvest.crops : [];

						for (const crop of harvestCrops) {
							if (crop.cropType) cropSet.add(crop.cropType);
						}
					}
				}

				return {
					id: farm.id,
					name: farm.name,
					city: farm.city,
					state: farm.state as BrazilianState,
					totalArea: farm.totalArea,
					arableArea: farm.arableArea,
					vegetationArea: farm.vegetationArea,
					crops: Array.from(cropSet) as Array<CropType>,
					producerId: farm.producerId,
					createdAt: farm.createdAt.toISOString(),
					updatedAt: farm.updatedAt.toISOString(),
				} as FarmType;
			}) ?? [];

		return {
			id: producer.id,
			name: producer.name,
			farms: farmsWithCrops,
			document: producer.document,
			createdAt: producer.createdAt,
			updatedAt: producer.updatedAt,
		};
	}
}
