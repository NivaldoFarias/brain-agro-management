import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";

/**
 * Data Transfer Object for updating an existing rural producer.
 *
 * All fields are optional to allow partial updates. Only the provided fields
 * will be updated in the database.
 *
 * @example
 * ```typescript
 * // Update only the name
 * const dto: UpdateProducerDto = {
 *   name: "João Silva Santos"
 * };
 *
 * // Update only the document
 * const dto2: UpdateProducerDto = {
 *   document: "222.555.888-46"
 * };
 *
 * // Update both fields
 * const dto3: UpdateProducerDto = {
 *   name: "Fazenda XYZ Ltda",
 *   document: "11.222.333/0001-81"
 * };
 * ```
 */
export class UpdateProducerDto {
	/**
	 * The updated full name of the rural producer or company.
	 *
	 * @example "João da Silva Santos"
	 */
	@ApiPropertyOptional({
		description: "Updated full name of the producer or company",
		example: "João da Silva Santos",
		minLength: 3,
		maxLength: 255,
	})
	@IsOptional()
	@IsString({ message: "Name must be a string" })
	@Length(3, 255, { message: "Name must be between 3 and 255 characters" })
	name?: string;

	/**
	 * The updated Brazilian document number (CPF or CNPJ).
	 *
	 * Can be provided in formatted or unformatted style.
	 * Validation is performed at the service layer.
	 *
	 * @example "222.555.888-46"
	 * @example "22.333.444/0001-92"
	 */
	@ApiPropertyOptional({
		description: "Updated CPF (11 digits) or CNPJ (14 digits) document number",
		example: "222.555.888-46",
		minLength: 11,
		maxLength: 18,
	})
	@IsOptional()
	@IsString({ message: "Document must be a string" })
	@Length(11, 18, { message: "Document must be a valid CPF or CNPJ" })
	document?: string;
}
