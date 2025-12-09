import type { BaseListFilterOptions } from "./api";

import type { ProducerSortField } from "@/enums";

/**
 * Producer entity type representing rural producers and agricultural companies.
 *
 * A producer is an individual farmer or agricultural company that owns one or
 * more farms. Each producer is identified by a Brazilian document (CPF for
 * individuals or CNPJ for companies).
 *
 * @example
 * ```typescript
 * const producer: Producer = {
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   name: "João Silva",
 *   document: "111.444.777-35",
 *   createdAt: "2024-01-15T10:30:00.000Z",
 *   updatedAt: "2024-01-15T10:30:00.000Z"
 * };
 * ```
 */
export interface Producer {
	/** Unique identifier (UUID v4) */
	id: string;

	/** Full name of the producer or company */
	name: string;

	/**
	 * Brazilian document number (CPF or CNPJ).
	 *
	 * - CPF format: "111.444.777-35" or "11144477735" (11 digits)
	 * - CNPJ format: "11.222.333/0001-81" or "11222333000181" (14 digits)
	 */
	document: string;

	/** Timestamp when the producer was created */
	createdAt: string;

	/** Timestamp when the producer was last updated */
	updatedAt: string;
}

/**
 * Request payload for creating a new producer.
 *
 * @example
 * ```typescript
 * const request: CreateProducerRequest = {
 *   name: "João Silva",
 *   document: "111.444.777-35"
 * };
 * ```
 */
export interface CreateProducerRequest {
	/**
	 * Full name of the rural producer or company.
	 *
	 * @minLength `3`
	 * @maxLength `255`
	 * @example "João da Silva"
	 */
	name: string;

	/**
	 * Brazilian document number (CPF for individuals or CNPJ for companies).
	 *
	 * Can be provided in formatted or unformatted style. Validation is performed
	 * server-side to ensure the document follows Brazilian government algorithms.
	 *
	 * @minLength `11`
	 * @maxLength `18`
	 * @example "111.444.777-35"
	 * @example "11.222.333/0001-81"
	 */
	document: string;
}

/**
 * Request payload for updating an existing producer.
 *
 * All fields are optional - only provided fields will be updated.
 *
 * @example
 * ```typescript
 * const request: UpdateProducerRequest = {
 *   name: "João Silva (Updated)"
 * };
 * ```
 */
export interface UpdateProducerRequest {
	/**
	 * Full name of the rural producer or company.
	 *
	 * @minLength `3`
	 * @maxLength `255`
	 * @example "João da Silva"
	 */
	name?: string;

	/**
	 * Brazilian document number (CPF or CNPJ).
	 *
	 * @minLength `11`
	 * @maxLength `18`
	 * @example "111.444.777-35"
	 */
	document?: string;
}

/**
 * Paginated response for producer list queries.
 *
 * @example
 * ```typescript
 * const response: ProducersListResponse = {
 *   data: [producer1, producer2],
 *   total: 25,
 *   page: 1,
 *   limit: 10
 * };
 * ```
 */
export interface ProducersListResponse {
	/** Array of producer entities */
	data: Array<Producer>;

	/** Total count of producers matching the query */
	total: number;

	/** Current page number (1-indexed) */
	page: number;

	/** Number of items per page */
	limit: number;
}

export type ProducersFilterOptions = BaseListFilterOptions<ProducerSortField>;
