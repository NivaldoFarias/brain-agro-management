import type { Response } from "supertest";

import type {
	CreateProducerDto,
	ProducerResponseDto,
	UpdateProducerDto,
} from "@/modules/producers/dto";

import { BaseScenario, TypedResponse } from "./base.scenario";

/**
 * Type-safe scenario builder for producer-related E2E test operations.
 *
 * Provides strongly-typed methods for all producer API endpoints, eliminating
 * manual type assertions and reducing test boilerplate. All methods return
 * promises with inferred response types based on the API contract.
 *
 * @example
 * ```typescript
 * describe('Producers E2E', () => {
 *   let scenario: ProducersScenario;
 *
 *   beforeAll(() => {
 *     scenario = new ProducersScenario(server);
 *   });
 *
 *   it('should create producer', async () => {
 *     const response = await scenario.create({
 *       name: 'João Silva',
 *       document: '123.456.789-09'
 *     });
 *     expect(response.body.id).toBeDefined();
 *   });
 * });
 * ```
 */
export class ProducersScenario extends BaseScenario {
	/** Base path for all producer endpoints */
	private readonly route = "/producers";

	/** The full API path for producer endpoints */
	get path(): string {
		return this.basePath + this.route;
	}

	/**
	 * Creates a new producer.
	 *
	 * @param data Producer creation data (name and document)
	 *
	 * @returns Promise resolving to typed response with created producer
	 *
	 * @example
	 * ```typescript
	 * const response = await scenario.create({
	 *   name: 'João Silva',
	 *   document: '111.444.777-35'
	 * });
	 * expect(response.status).toBe(201);
	 * expect(response.body.name).toBe('João Silva');
	 * ```
	 */
	async create(data: CreateProducerDto): Promise<TypedResponse<ProducerResponseDto>> {
		return this.post<ProducerResponseDto>(this.path, data);
	}

	/**
	 * Retrieves all producers.
	 *
	 * @returns Promise resolving to typed response with producer array
	 *
	 * @example
	 * ```typescript
	 * const response = await scenario.findAll();
	 * expect(response.status).toBe(200);
	 * expect(Array.isArray(response.body)).toBe(true);
	 * ```
	 */
	async findAll(): Promise<TypedResponse<Array<ProducerResponseDto>>> {
		return this.get<Array<ProducerResponseDto>>(this.path);
	}

	/**
	 * Retrieves a single producer by ID.
	 *
	 * @param id Producer UUID
	 *
	 * @returns Promise resolving to typed response with producer data
	 *
	 * @example
	 * ```typescript
	 * const response = await scenario.findById('550e8400-e29b-41d4-a716-446655440000');
	 * expect(response.status).toBe(200);
	 * expect(response.body.id).toBe('550e8400-e29b-41d4-a716-446655440000');
	 * ```
	 */
	async findById(id: string): Promise<TypedResponse<ProducerResponseDto>> {
		return this.get<ProducerResponseDto>(`${this.path}/${id}`);
	}

	/**
	 * Updates an existing producer.
	 *
	 * @param id Producer UUID
	 * @param data Partial producer data to update
	 *
	 * @returns Promise resolving to typed response with updated producer
	 *
	 * @example
	 * ```typescript
	 * const response = await scenario.update('550e8400...', {
	 *   name: 'Updated Name'
	 * });
	 * expect(response.status).toBe(200);
	 * expect(response.body.name).toBe('Updated Name');
	 * ```
	 */
	async update(id: string, data: UpdateProducerDto): Promise<TypedResponse<ProducerResponseDto>> {
		return this.patch<ProducerResponseDto>(`${this.path}/${id}`, data);
	}

	/**
	 * Deletes a producer.
	 *
	 * @param id Producer UUID
	 *
	 * @returns Promise resolving to supertest response
	 *
	 * @example
	 * ```typescript
	 * const response = await scenario.remove('550e8400...');
	 * expect(response.status).toBe(204);
	 * ```
	 */
	async remove(id: string): Promise<Response> {
		return this.delete(`${this.path}/${id}`);
	}
}
