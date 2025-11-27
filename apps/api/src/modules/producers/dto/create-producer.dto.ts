import { faker } from "@faker-js/faker/locale/pt_BR";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length } from "class-validator";

import { generateDocument } from "@agro/shared/utils";

/**
 * Data Transfer Object for creating a new rural producer.
 *
 * Validates that the producer has a valid name and document (CPF or CNPJ).
 * Document format validation is handled at the service layer using validators
 * from the shared package.
 *
 * @example
 * ```typescript
 * const dto: CreateProducerDto = {
 *   name: "João Silva",
 *   document: "111.444.777-35" // CPF format
 * };
 *
 * const dto2: CreateProducerDto = {
 *   name: "Fazenda ABC Ltda",
 *   document: "11.222.333/0001-81" // CNPJ format
 * };
 * ```
 */
export class CreateProducerDto {
	/**
	 * The full name of the rural producer or company.
	 *
	 * @example "João da Silva"
	 * @example "Agropecuária XYZ Ltda"
	 */
	@ApiProperty({
		description: "Full name of the producer or company",
		example: faker.person.fullName(),
		minLength: 3,
		maxLength: 255,
	})
	@IsNotEmpty({ message: "Name is required" })
	@IsString({ message: "Name must be a string" })
	@Length(3, 255, { message: "Name must be between 3 and 255 characters" })
	name!: string;

	/**
	 * Brazilian document number (CPF for individuals or CNPJ for companies).
	 *
	 * Can be provided in formatted or unformatted style:
	 * - CPF: "111.444.777-35" or "11144477735"
	 * - CNPJ: "11.222.333/0001-81" or "11222333000181"
	 *
	 * Validation is performed at the service layer to ensure the document
	 * follows Brazilian government algorithms.
	 *
	 * @example "111.444.777-35"
	 * @example "11.222.333/0001-81"
	 */
	@ApiProperty({
		description: "CPF or CNPJ document number",
		example: faker.helpers.arrayElement([
			generateDocument.cpf({ formatted: true }),
			generateDocument.cnpj({ formatted: true }),
		]),
		minLength: 11,
		maxLength: 18,
	})
	@IsNotEmpty({ message: "Document is required" })
	@IsString({ message: "Document must be a string" })
	@Length(11, 18, { message: "Document must be a valid CPF or CNPJ" })
	document!: string;
}
