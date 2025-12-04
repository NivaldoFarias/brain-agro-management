import { faker } from "@faker-js/faker/locale/pt_BR";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

import { BrazilianState } from "@agro/shared/utils";

/**
 * Data Transfer Object for city responses.
 *
 * Defines the structure of city data returned by the API. Uses class-transformer
 * decorators to control which fields are exposed in the response.
 *
 * @example
 * ```typescript
 * const response: CityResponseDto = {
 *  id: "770e9600-g40d-63f6-c938-668877662222",
 *  name: "São Paulo",
 *  state: BrazilianState.SP,
 *  ibgeCode: "3550308",
 *  createdAt: new Date("2025-11-24T10:00:00Z"),
 *  updatedAt: new Date("2025-11-24T10:00:00Z")
 * };
 * ```
 */
@Exclude()
export class CityResponseDto {
	/**
	 * Unique identifier for the farm (UUID v4).
	 *
	 * @example "770e9600-g40d-63f6-c938-668877662222"
	 */
	@ApiProperty({
		description: "Unique identifier (UUID)",
		example: faker.string.uuid(),
		format: "uuid",
	})
	@Expose()
	id!: string;

	/**
	 * Name of the city.
	 *
	 * @example "São Paulo"
	 */
	@ApiProperty({
		description: "Name of the city",
		example: `São Paulo`,
	})
	@Expose()
	name!: string;

	/**
	 * Brazilian state (UF) where the city is located.
	 *
	 * @example "SP"
	 */
	@ApiProperty({
		description: "Brazilian state (UF)",
		example: BrazilianState.SP,
		enum: BrazilianState,
		enumName: "BrazilianState",
	})
	@Expose()
	state!: string;

	/**
	 * IBGE municipality code (7 digits).
	 *
	 * Unique identifier from Brazilian Institute of Geography and Statistics.
	 *
	 * @example "3550308" // (São Paulo city code)
	 */
	@ApiProperty({
		description: "IBGE municipality code (7 digits)",
		example: "3550308",
	})
	@Expose()
	ibgeCode!: string;

	/**
	 * Timestamp when the city was created.
	 *
	 * @example "2025-11-24T10:00:00.000Z"
	 */
	@ApiProperty({
		description: "Creation timestamp",
		example: faker.date.recent(),
		type: Date,
	})
	@Expose()
	createdAt!: Date;

	/**
	 * Timestamp when the city was last updated.
	 *
	 * @example "2025-11-24T15:30:00.000Z"
	 */
	@ApiProperty({
		description: "Last update timestamp",
		example: faker.date.recent(),
		type: Date,
	})
	@Expose()
	updatedAt!: Date;
}
