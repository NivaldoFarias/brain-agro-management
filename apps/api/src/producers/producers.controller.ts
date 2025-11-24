import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateProducerDto, ProducerResponseDto, UpdateProducerDto } from "./dto";
import { ProducersService } from "./producers.service";

/**
 * Controller handling HTTP requests for rural producer management.
 *
 * Provides RESTful endpoints for CRUD operations on producers with
 * comprehensive OpenAPI documentation. All endpoints validate inputs
 * using DTOs and return standardized response objects.
 *
 * @example
 * ```typescript
 * // Usage in NestJS module
 * @Module({
 *   controllers: [ProducersController],
 *   providers: [ProducersService]
 * })
 * ```
 */
@ApiTags("Producers")
@Controller("producers")
export class ProducersController {
	constructor(private readonly producersService: ProducersService) {}

	/**
	 * Creates a new rural producer.
	 *
	 * Validates CPF/CNPJ format and checks for duplicate documents before
	 * creating the producer record.
	 *
	 * @param createProducerDto - Producer data including name and document
	 *
	 * @returns The created producer with generated ID and timestamps
	 *
	 * @throws {BadRequestException} If document format is invalid
	 * @throws {ConflictException} If document is already registered
	 */
	@Post()
	@ApiOperation({ summary: "Create a new producer" })
	@ApiResponse({
		status: 201,
		description: "Producer created successfully",
		type: ProducerResponseDto,
	})
	@ApiResponse({ status: 400, description: "Invalid input data" })
	@ApiResponse({ status: 409, description: "Document already exists" })
	create(@Body() createProducerDto: CreateProducerDto): Promise<ProducerResponseDto> {
		return this.producersService.create(createProducerDto);
	}

	/**
	 * Retrieves all producers.
	 *
	 * Returns producers ordered alphabetically by name.
	 *
	 * @returns Array of all producers
	 */
	@Get()
	@ApiOperation({ summary: "Get all producers" })
	@ApiResponse({
		status: 200,
		description: "List of producers",
		type: [ProducerResponseDto],
	})
	findAll(): Promise<ProducerResponseDto[]> {
		return this.producersService.findAll();
	}

	/**
	 * Retrieves a specific producer by ID.
	 *
	 * Includes the producer's associated farms when using the relations query.
	 *
	 * @param id - UUID of the producer to retrieve
	 *
	 * @returns The producer with the specified ID
	 *
	 * @throws {NotFoundException} If producer with the given ID does not exist
	 */
	@Get(":id")
	@ApiOperation({ summary: "Get producer by ID" })
	@ApiResponse({
		status: 200,
		description: "Producer found",
		type: ProducerResponseDto,
	})
	@ApiResponse({ status: 404, description: "Producer not found" })
	findOne(@Param("id") id: string): Promise<ProducerResponseDto> {
		return this.producersService.findOne(id);
	}

	/**
	 * Updates an existing producer.
	 *
	 * Allows partial updates - only provided fields will be updated.
	 * If document is being updated, validates the new document and checks
	 * for duplicates.
	 *
	 * @param id - UUID of the producer to update
	 * @param updateProducerDto - Fields to update
	 *
	 * @returns The updated producer
	 *
	 * @throws {NotFoundException} If producer with the given ID does not exist
	 * @throws {BadRequestException} If new document format is invalid
	 * @throws {ConflictException} If new document is already in use
	 */
	@Patch(":id")
	@ApiOperation({ summary: "Update producer" })
	@ApiResponse({
		status: 200,
		description: "Producer updated successfully",
		type: ProducerResponseDto,
	})
	@ApiResponse({ status: 400, description: "Invalid input data" })
	@ApiResponse({ status: 404, description: "Producer not found" })
	@ApiResponse({ status: 409, description: "Document already exists" })
	update(
		@Param("id") id: string,
		@Body() updateProducerDto: UpdateProducerDto,
	): Promise<ProducerResponseDto> {
		return this.producersService.update(id, updateProducerDto);
	}

	/**
	 * Deletes a producer.
	 *
	 * Also deletes all associated farms due to CASCADE constraint.
	 *
	 * @param id - UUID of the producer to delete
	 *
	 * @returns Void on successful deletion
	 *
	 * @throws {NotFoundException} If producer with the given ID does not exist
	 */
	@Delete(":id")
	@ApiOperation({ summary: "Delete producer" })
	@ApiResponse({ status: 200, description: "Producer deleted successfully" })
	@ApiResponse({ status: 404, description: "Producer not found" })
	remove(@Param("id") id: string): Promise<void> {
		return this.producersService.delete(id);
	}
}
