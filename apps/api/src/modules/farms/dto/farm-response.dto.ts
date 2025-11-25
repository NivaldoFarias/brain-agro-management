import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

import { BrazilianState } from "@/common";

/**
 * Data Transfer Object for farm responses.
 *
 * Defines the structure of farm data returned by the API. Uses class-transformer
 * decorators to control which fields are exposed in the response.
 *
 * @example
 * ```typescript
 * const response: FarmResponseDto = {
 *   id: "770e9600-g40d-63f6-c938-668877662222",
 *   name: "Fazenda Boa Vista",
 *   city: "Campinas",
 *   state: BrazilianState.SP,
 *   totalArea: 100.5,
 *   arableArea: 70.0,
 *   vegetationArea: 25.0,
 *   producerId: "550e8400-e29b-41d4-a716-446655440000",
 *   createdAt: new Date("2025-11-24T10:00:00Z"),
 *   updatedAt: new Date("2025-11-24T10:00:00Z")
 * };
 * ```
 */
@Exclude()
export class FarmResponseDto {
	/**
	 * Unique identifier for the farm (UUID v4).
	 *
	 * @example "770e9600-g40d-63f6-c938-668877662222"
	 */
	@ApiProperty({
		description: "Unique identifier (UUID)",
		example: "770e9600-g40d-63f6-c938-668877662222",
		format: "uuid",
	})
	@Expose()
	id!: string;

	/**
	 * Name of the farm.
	 *
	 * @example "Fazenda Boa Vista"
	 */
	@ApiProperty({
		description: "Name of the farm",
		example: "Fazenda Boa Vista",
	})
	@Expose()
	name!: string;

	/**
	 * City where the farm is located.
	 *
	 * @example "Campinas"
	 */
	@ApiProperty({
		description: "City where the farm is located",
		example: "Campinas",
	})
	@Expose()
	city!: string;

	/**
	 * Brazilian state (UF) where the farm is located.
	 *
	 * @example "SP"
	 */
	@ApiProperty({
		description: "Brazilian state (UF)",
		example: "SP",
		enum: BrazilianState,
		enumName: "BrazilianState",
	})
	@Expose()
	state!: BrazilianState;

	/**
	 * Total area of the farm in hectares.
	 *
	 * @example 100.5
	 */
	@ApiProperty({
		description: "Total farm area in hectares",
		example: 100.5,
	})
	@Expose()
	totalArea!: number;

	/**
	 * Arable area (área agricultável) in hectares.
	 *
	 * @example 70
	 */
	@ApiProperty({
		description: "Arable area in hectares",
		example: 70,
	})
	@Expose()
	arableArea!: number;

	/**
	 * Vegetation/preservation area in hectares.
	 *
	 * @example 25
	 */
	@ApiProperty({
		description: "Vegetation/preservation area in hectares",
		example: 25,
	})
	@Expose()
	vegetationArea!: number;

	/**
	 * UUID of the producer who owns this farm.
	 *
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@ApiProperty({
		description: "UUID of the farm owner (producer)",
		example: "550e8400-e29b-41d4-a716-446655440000",
		format: "uuid",
	})
	@Expose()
	producerId!: string;

	/**
	 * Timestamp when the farm was created.
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
	 * Timestamp when the farm was last updated.
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
