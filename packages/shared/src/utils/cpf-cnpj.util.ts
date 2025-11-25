import * as cnpj from "@fnando/cnpj";
import * as cpf from "@fnando/cpf";

function generateSafeCpf(format?: boolean): string {
	const generatedCpf = cpf.generate(format);

	if (!generatedCpf || typeof generatedCpf !== "string") {
		throw new Error("Failed to generate a valid CPF");
	}

	return generatedCpf;
}

function generateSafeCnpj(format?: boolean): string {
	const generatedCnpj = cnpj.generate(format);

	if (!generatedCnpj || typeof generatedCnpj !== "string") {
		throw new Error("Failed to generate a valid CNPJ");
	}

	return generatedCnpj;
}

export const generateDocument = {
	/**
	 * Generate a random CPF.
	 *
	 * @param format if `true`, it will format using `.` and `-`
	 *
	 * @returns the generated CPF. ex.: `"123.456.789-09"`, if formatted is set to `true`
	 *
	 * @example
	 * ```typescript
	 * import { generateDocument } from "@agro/shared/utils";
	 *
	 * const formattedCpf = generateDocument.cpf(true);
	 * const unformattedCpf = generateDocument.cpf(false);
	 * ```
	 */
	cpf: generateSafeCpf,

	/**
	 * Generate a random CNPJ.
	 *
	 * @param format if `true`, it will format using `.` and `-`
	 *
	 * @returns the generated CNPJ. ex.: `"12.345.678/0001-95"`, if formatted is set to `true`
	 *
	 * @example
	 * ```typescript
	 * import { generateDocument } from "@agro/shared/utils";
	 *
	 * const formattedCnpj = generateDocument.cnpj(true);
	 * const unformattedCnpj = generateDocument.cnpj(false);
	 * ```
	 */
	cnpj: generateSafeCnpj,
};
