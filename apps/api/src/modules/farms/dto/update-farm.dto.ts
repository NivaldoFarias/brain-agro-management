import { faker } from "@faker-js/faker/locale/pt_BR";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsArray,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Length,
	Min,
} from "class-validator";

import { BrazilianState, CropType } from "@/common";

/**
 * Data Transfer Object for updating an existing farm.
 *
 * All fields are optional to allow partial updates. Only the provided fields
 * will be updated in the database.
 *
 * @example
 * ```typescript
 * // Update only the name and city
 * const dto: UpdateFarmDto = {
 *   name: "Fazenda Boa Vista II",
 *   city: "São Paulo"
 * };
 *
 * // Update area measurements
 * const dto2: UpdateFarmDto = {
 *   totalArea: 120,
 *   arableArea: 80.0,
 *   vegetationArea: 30.0
 * };
 * ```
 */
export class UpdateFarmDto {
	/**
	 * Updated name of the farm.
	 *
	 * @example "Fazenda Boa Vista II"
	 */
	@ApiPropertyOptional({
		description: "Updated name of the farm",
		example: `Fazenda ${faker.location.city()}`,
		minLength: 3,
		maxLength: 255,
	})
	@IsOptional()
	@IsString({ message: "Farm name must be a string" })
	@Length(3, 255, { message: "Farm name must be between 3 and 255 characters" })
	name?: string;

	/**
	 * Updated city where the farm is located.
	 *
	 * @example "São Paulo"
	 */
	@ApiPropertyOptional({
		description: "Updated city where the farm is located",
		example: faker.location.city(),
		minLength: 2,
		maxLength: 100,
	})
	@IsOptional()
	@IsString({ message: "City must be a string" })
	@Length(2, 100, { message: "City must be between 2 and 100 characters" })
	city?: string;

	/**
	 * Updated Brazilian state (UF).
	 *
	 * @example BrazilianState.RJ
	 */
	@ApiPropertyOptional({
		description: "Updated Brazilian state (UF)",
		example: "RJ",
		enum: BrazilianState,
	})
	@IsOptional()
	@IsEnum(BrazilianState, { message: "State must be a valid Brazilian state code" })
	state?: BrazilianState;

	/**
	 * Updated total area of the farm in hectares.
	 *
	 * @example 120
	 */
	@ApiPropertyOptional({
		description: "Updated total farm area in hectares",
		example: faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
		minimum: 0.01,
	})
	@IsOptional()
	@IsNumber({}, { message: "Total area must be a number" })
	@Min(0.01, { message: "Total area must be greater than zero" })
	totalArea?: number;

	/**
	 * Updated arable area (área agricultável) in hectares.
	 *
	 * @example 80
	 */
	@ApiPropertyOptional({
		description: "Updated arable area in hectares",
		example: faker.number.float({ min: 30, max: 300, fractionDigits: 2 }),
		minimum: 0,
	})
	@IsOptional()
	@IsNumber({}, { message: "Arable area must be a number" })
	@Min(0, { message: "Arable area cannot be negative" })
	arableArea?: number;

	/**
	 * Updated vegetation/preservation area in hectares.
	 *
	 * @example 30
	 */
	@ApiPropertyOptional({
		description: "Updated vegetation/preservation area in hectares",
		example: faker.number.float({ min: 10, max: 150, fractionDigits: 2 }),
		minimum: 0,
	})
	@IsOptional()
	@IsNumber({}, { message: "Vegetation area must be a number" })
	@Min(0, { message: "Vegetation area cannot be negative" })
	vegetationArea?: number;

	/**
	 * Updated UUID of the producer who owns this farm.
	 *
	 * @example "660e9500-f30c-52e5-b827-557766551111"
	 */
	@ApiPropertyOptional({
		description: "Updated UUID of the farm owner (producer)",
		example: faker.string.uuid(),
		format: "uuid",
	})
	@IsOptional()
	@IsUUID("4", { message: "Producer ID must be a valid UUID" })
	producerId?: string;

	/**
	 * Updated array of crops to be planted on this farm.
	 *
	 * Replaces existing crop associations for the current harvest.
	 * Pass an empty array to remove all crops.
	 *
	 * @example [CropType.Soy, CropType.Corn]
	 */
	@ApiPropertyOptional({
		description: "Updated array of crops planted on this farm",
		example: [CropType.Soy, CropType.Corn],
		enum: CropType,
		isArray: true,
	})
	@IsOptional()
	@IsArray({ message: "Crops must be an array" })
	@IsEnum(CropType, { each: true, message: "Each crop must be a valid crop type" })
	crops?: Array<CropType>;
}
