import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

/**
 * Data Transfer Object for producer responses.
 *
 * Defines the structure of producer data returned by the API. Uses class-transformer
 * decorators to control which fields are exposed in the response.
 *
 * @example
 * ```typescript
 * const response: ProducerResponseDto = {
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   name: "João da Silva",
 *   document: "111.444.777-35",
 *   createdAt: new Date("2025-11-24T10:00:00Z"),
 *   updatedAt: new Date("2025-11-24T10:00:00Z")
 * };
 * ```
 */
@Exclude()
export class ProducerResponseDto {
	/**
	 * Unique identifier for the producer (UUID v4).
	 *
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@ApiProperty({
		description: "Unique identifier (UUID)",
		example: "550e8400-e29b-41d4-a716-446655440000",
		format: "uuid",
	})
	@Expose()
	id!: string;

	/**
	 * Full name of the rural producer or company.
	 *
	 * @example "João da Silva"
	 */
	@ApiProperty({
		description: "Full name of the producer or company",
		example: "João da Silva",
	})
	@Expose()
	name!: string;

	/**
	 * Brazilian document number (CPF or CNPJ).
	 *
	 * Returned in formatted style for better readability:
	 * - CPF: "111.444.777-35"
	 * - CNPJ: "11.222.333/0001-81"
	 *
	 * @example "111.444.777-35"
	 */
	@ApiProperty({
		description: "CPF or CNPJ document number",
		example: "111.444.777-35",
	})
	@Expose()
	document!: string;

	/**
	 * Timestamp when the producer was created.
	 *
	 * @example "2025-11-24T10:00:00.000Z"
	 */
	@ApiProperty({
		description: "Creation timestamp",
		example: "2025-11-24T10:00:00.000Z",
		type: Date,
	})
	@Expose()
	createdAt!: Date;

	/**
	 * Timestamp when the producer was last updated.
	 *
	 * @example "2025-11-24T15:30:00.000Z"
	 */
	@ApiProperty({
		description: "Last update timestamp",
		example: "2025-11-24T15:30:00.000Z",
		type: Date,
	})
	@Expose()
	updatedAt!: Date;
}
