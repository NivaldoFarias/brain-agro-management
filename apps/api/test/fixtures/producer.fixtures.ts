import { faker } from "@faker-js/faker/locale/pt_BR";

import type { CreateProducerDto } from "@/producers/dto";

import { generateDocument } from "@agro/shared/utils";

/**
 * Producer test data fixtures using Faker.
 *
 * Provides realistic, randomized mock data for testing producer-related
 * functionality. Uses Faker to generate dynamic data while maintaining
 * valid Brazilian CPF/CNPJ formats.
 *
 * @example
 * ```typescript
 * const producer = ProducerFixtures.validCPF();
 * const company = ProducerFixtures.validCNPJ();
 * ```
 */
export const producerFixtures = {
	/**
	 * Valid producer with CPF document.
	 *
	 * Uses Faker to generate realistic Brazilian names and a valid CPF format.
	 *
	 * @returns Valid producer creation data
	 */
	validCPF(): CreateProducerDto {
		return {
			name: faker.person.fullName(),
			document: generateDocument.cpf(true),
		};
	},

	/**
	 * Valid producer with CNPJ document.
	 *
	 * Uses Faker to generate realistic company names and a valid CNPJ format.
	 *
	 * @returns Valid producer creation data
	 */
	validCNPJ(): CreateProducerDto {
		return {
			name: faker.company.name(),
			document: generateDocument.cnpj(true),
		};
	},

	/**
	 * Producer with custom name and valid CPF.
	 *
	 * @param name Custom producer name
	 *
	 * @returns Producer data with specified name
	 */
	withName(name: string): CreateProducerDto {
		return {
			name,
			document: generateDocument.cpf(true),
		};
	},

	/**
	 * Producer with invalid CPF (fails validation).
	 *
	 * @returns Invalid producer data for error testing
	 */
	invalidCPF(): CreateProducerDto {
		return {
			name: faker.person.fullName(),
			document: "123.456.789-00", // Invalid CPF checksum
		};
	},

	/**
	 * Producer with invalid CNPJ (fails validation).
	 *
	 * @returns Invalid producer data for error testing
	 */
	invalidCNPJ(): CreateProducerDto {
		return {
			name: faker.company.name(),
			document: "11.222.333/0001-00", // Invalid CNPJ checksum
		};
	},

	/**
	 * Producer with malformed document.
	 *
	 * @returns Invalid producer data for format testing
	 */
	malformedDocument(): CreateProducerDto {
		return {
			name: faker.person.fullName(),
			document: "invalid-document",
		};
	},

	/**
	 * Producer with empty/missing fields.
	 *
	 * @returns Partial producer data for validation testing
	 */
	incomplete(): Partial<CreateProducerDto> {
		return {
			name: faker.person.fullName(),
			// document is missing
		};
	},
};
