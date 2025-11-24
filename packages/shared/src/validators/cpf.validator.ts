import { format as formatCPFLib, isValid as isValidCPF, strip as stripCPF } from "@fnando/cpf";

/**
 * Validates Brazilian CPF (Cadastro de Pessoas Físicas) document numbers.
 *
 * Uses the battle-tested `@fnando/cpf` library which implements the official
 * CPF validation algorithm with verification digits. Accepts both formatted
 * (XXX.XXX.XXX-YY) and unformatted (11 digits) inputs.
 *
 * @param cpf The CPF string to validate (formatted or unformatted)
 *
 * @returns `true` if the CPF is valid, `false` otherwise
 *
 * @example
 * ```typescript
 * validateCPF("123.456.789-09");
 * // => false (invalid check digits)
 *
 * validateCPF("111.444.777-35");
 * // => true (valid CPF)
 *
 * validateCPF("11144477735");
 * // => true (valid CPF, unformatted)
 *
 * validateCPF("000.000.000-00");
 * // => false (known invalid sequence)
 * ```
 *
 * @see {@link https://github.com/fnando/cpf|@fnando/cpf Library Documentation}
 * @see {@link https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/cadastros/cpf|CPF Official Documentation}
 */
export function validateCPF(cpf: string): boolean {
	return isValidCPF(cpf);
}

/**
 * Formats a CPF string with standard Brazilian formatting.
 *
 * Uses the `@fnando/cpf` library to add dots and hyphen, creating the standard
 * CPF format: XXX.XXX.XXX-YY. If the input is invalid, returns the original input.
 *
 * @param cpf The CPF string to format (digits only or already formatted)
 *
 * @returns The formatted CPF string or original input if invalid
 *
 * @example
 * ```typescript
 * formatCPF("11144477735");
 * // => "111.444.777-35"
 *
 * formatCPF("111.444.777-35");
 * // => "111.444.777-35"
 *
 * formatCPF("12345");
 * // => "12345" (invalid length, returns as-is)
 * ```
 *
 * @see {@link formatCPFLib} for the underlying formatting function
 */
export function formatCPF(cpf: string): string {
	return formatCPFLib(cpf);
}

/**
 * Removes all formatting characters from a CPF string.
 *
 * Strips dots, hyphens, and spaces to return only the numeric digits.
 * Useful for storing CPF values in databases or performing comparisons.
 *
 * @param cpf The CPF string to strip (formatted or unformatted)
 *
 * @returns The CPF string with only numeric digits
 *
 * @example
 * ```typescript
 * stripCPFFormatting("111.444.777-35");
 * // => "11144477735"
 *
 * stripCPFFormatting("111 444 777 35");
 * // => "11144477735"
 *
 * stripCPFFormatting("11144477735");
 * // => "11144477735"
 * ```
 */
export function stripCPFFormatting(cpf: string): string {
	return stripCPF(cpf);
}
