import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, Length, Min } from "class-validator";

import { IsCityInState } from "../../common/validators/city-state.validator";
import { BrazilianState } from "../../database/entities";

/**
 * Data Transfer Object for creating a new farm.
 *
 * Validates all required farm information including area measurements and
 * ensures the farm is associated with a valid producer.
 *
 * @example
 * ```typescript
 * const dto: CreateFarmDto = {
 *   name: "Fazenda Boa Vista",
 *   city: "Campinas",
 *   state: BrazilianState.SP,
 *   totalArea: 100.5,
 *   arableArea: 70.0,
 *   vegetationArea: 25.0,
 *   producerId: "550e8400-e29b-41d4-a716-446655440000"
 * };
 * ```
 */
export class CreateFarmDto {
	/**
	 * Name of the farm.
	 *
	 * @example "Fazenda Boa Vista"
	 */
	@ApiProperty({
		description: "Name of the farm",
		example: "Fazenda Boa Vista",
		minLength: 3,
		maxLength: 255,
	})
	@IsNotEmpty({ message: "Farm name is required" })
	@IsString({ message: "Farm name must be a string" })
	@Length(3, 255, { message: "Farm name must be between 3 and 255 characters" })
	name!: string;

	/**
	 * City where the farm is located.
	 *
	 * Must be a valid Brazilian municipality within the specified state.
	 * Validated against IBGE data to ensure accuracy.
	 *
	 * @example "Campinas"
	 */
	@ApiProperty({
		description: "City where the farm is located (must exist in the specified state)",
		example: "Campinas",
		minLength: 2,
		maxLength: 100,
	})
	@IsNotEmpty({ message: "City is required" })
	@IsString({ message: "City must be a string" })
	@Length(2, 100, { message: "City must be between 2 and 100 characters" })
	@IsCityInState({ message: "City must exist within the specified state" })
	city!: string;

	/**
	 * Brazilian state (UF) where the farm is located.
	 *
	 * Must be one of the 27 valid Brazilian state codes.
	 *
	 * @example BrazilianState.SP
	 */
	@ApiProperty({
		description: "Brazilian state (UF)",
		example: "SP",
		enum: BrazilianState,
		enumName: "BrazilianState",
	})
	@IsNotEmpty({ message: "State is required" })
	@IsEnum(BrazilianState, { message: "State must be a valid Brazilian state code" })
	state!: BrazilianState;

	/**
	 * Total area of the farm in hectares.
	 *
	 * Must be greater than zero. The sum of arableArea and vegetationArea
	 * cannot exceed this value (validated at service layer).
	 *
	 * @example 100.5
	 */
	@ApiProperty({
		description: "Total farm area in hectares",
		example: 100.5,
		minimum: 0.01,
	})
	@IsNotEmpty({ message: "Total area is required" })
	@IsNumber({}, { message: "Total area must be a number" })
	@Min(0.01, { message: "Total area must be greater than zero" })
	totalArea!: number;

	/**
	 * Arable area (área agricultável) in hectares.
	 *
	 * Must be greater than or equal to zero. Cannot exceed totalArea when
	 * combined with vegetationArea.
	 *
	 * @example 70.0
	 */
	@ApiProperty({
		description: "Arable area in hectares",
		example: 70,
		minimum: 0,
	})
	@IsNotEmpty({ message: "Arable area is required" })
	@IsNumber({}, { message: "Arable area must be a number" })
	@Min(0, { message: "Arable area cannot be negative" })
	arableArea!: number;

	/**
	 * Vegetation/preservation area in hectares.
	 *
	 * Must be greater than or equal to zero. Cannot exceed totalArea when
	 * combined with arableArea.
	 *
	 * @example 25.0
	 */
	@ApiProperty({
		description: "Vegetation/preservation area in hectares",
		example: 25,
		minimum: 0,
	})
	@IsNotEmpty({ message: "Vegetation area is required" })
	@IsNumber({}, { message: "Vegetation area must be a number" })
	@Min(0, { message: "Vegetation area cannot be negative" })
	vegetationArea!: number;

	/**
	 * UUID of the producer who owns this farm.
	 *
	 * Must reference an existing producer in the database.
	 *
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@ApiProperty({
		description: "UUID of the farm owner (producer)",
		example: "550e8400-e29b-41d4-a716-446655440000",
		format: "uuid",
	})
	@IsNotEmpty({ message: "Producer ID is required" })
	@IsUUID("4", { message: "Producer ID must be a valid UUID" })
	producerId!: string;
}
