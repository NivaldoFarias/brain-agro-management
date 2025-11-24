import { format as formatCNPJLib, isValid as isValidCNPJ, strip as stripCNPJ } from "@fnando/cnpj";

/**
 * Validates Brazilian CNPJ (Cadastro Nacional da Pessoa Jurídica) document numbers.
 *
 * Uses the battle-tested `@fnando/cnpj` library which implements the official
 * CNPJ validation algorithm with verification digits. Accepts both formatted
 * (XX.XXX.XXX/XXXX-YY) and unformatted (14 digits) inputs.
 *
 * @param cnpj The CNPJ string to validate (formatted or unformatted)
 *
 * @returns `true` if the CNPJ is valid, `false` otherwise
 *
 * @example
 * ```typescript
 * validateCNPJ("11.222.333/0001-81");
 * // => true (valid CNPJ)
 *
 * validateCNPJ("11222333000181");
 * // => true (valid CNPJ, unformatted)
 *
 * validateCNPJ("00.000.000/0000-00");
 * // => false (known invalid sequence)
 *
 * validateCNPJ("11.222.333/0001-99");
 * // => false (invalid check digits)
 * ```
 *
 * @see {@link https://github.com/fnando/cnpj|@fnando/cnpj Library Documentation}
 * @see {@link https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/cadastros/cnpj|CNPJ Official Documentation}
 */
export function validateCNPJ(cnpj: string): boolean {
	return isValidCNPJ(cnpj);
}

/**
 * Formats a CNPJ string with standard Brazilian formatting.
 *
 * Uses the `@fnando/cnpj` library to add dots, slash, and hyphen, creating
 * the standard CNPJ format: XX.XXX.XXX/XXXX-YY. If the input is invalid,
 * returns the original input.
 *
 * @param cnpj The CNPJ string to format (digits only or already formatted)
 *
 * @returns The formatted CNPJ string or original input if invalid
 *
 * @example
 * ```typescript
 * formatCNPJ("11222333000181");
 * // => "11.222.333/0001-81"
 *
 * formatCNPJ("11.222.333/0001-81");
 * // => "11.222.333/0001-81"
 *
 * formatCNPJ("12345");
 * // => "12345" (invalid length, returns as-is)
 * ```
 *
 * @see {@link formatCNPJLib} for the underlying formatting function
 */
export function formatCNPJ(cnpj: string): string {
	return formatCNPJLib(cnpj);
}

/**
 * Removes all formatting characters from a CNPJ string.
 *
 * Strips dots, slashes, hyphens, and spaces to return only the numeric digits.
 * Useful for storing CNPJ values in databases or performing comparisons.
 *
 * @param cnpj The CNPJ string to strip (formatted or unformatted)
 *
 * @returns The CNPJ string with only numeric digits
 *
 * @example
 * ```typescript
 * stripCNPJFormatting("11.222.333/0001-81");
 * // => "11222333000181"
 *
 * stripCNPJFormatting("11 222 333 0001 81");
 * // => "11222333000181"
 *
 * stripCNPJFormatting("11222333000181");
 * // => "11222333000181"
 * ```
 */
export function stripCNPJFormatting(cnpj: string): string {
	return stripCNPJ(cnpj);
}
