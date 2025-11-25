import * as cnpj from "@fnando/cnpj";
import * as cpf from "@fnando/cpf";

function generateSafeCpf(options?: { formatted?: boolean }): string {
	const generatedCpf = cpf.generate(options?.formatted ?? false);

	if (!generatedCpf || typeof generatedCpf !== "string") {
		throw new Error("Failed to generate a valid CPF");
	}

	return generatedCpf;
}

function generateSafeCnpj(options?: { formatted?: boolean }): string {
	const generatedCnpj = cnpj.generate(options?.formatted ?? false);

	if (!generatedCnpj || typeof generatedCnpj !== "string") {
		throw new Error("Failed to generate a valid CNPJ");
	}

	return generatedCnpj;
}

export const generateDocument = {
	/**
	 * Generate a random CPF.
	 *
	 * @param options
	 * @param options.formatted if `true`, it will format using `.` and `-`
	 *
	 * @returns the generated CPF. ex.: `"123.456.789-09"`, if formatted is set to `true`
	 *
	 * @example
	 * ```typescript
	 * import { generateDocument } from "@agro/shared/utils";
	 *
	 * const formattedCpf = generateDocument.cpf({ formatted: true });
	 * const unformattedCpf = generateDocument.cpf();
	 * ```
	 */
	cpf: generateSafeCpf,

	/**
	 * Generate a random CNPJ.
	 *
	 * @param options
	 * @param options.formatted if `true`, it will format using `.` and `-`
	 *
	 * @returns the generated CNPJ. ex.: `"12.345.678/0001-95"`, if formatted is set to `true`
	 *
	 * @example
	 * ```typescript
	 * import { generateDocument } from "@agro/shared/utils";
	 *
	 * const formattedCnpj = generateDocument.cnpj({ formatted: true });
	 * const unformattedCnpj = generateDocument.cnpj();
	 * ```
	 */
	cnpj: generateSafeCnpj,
};
