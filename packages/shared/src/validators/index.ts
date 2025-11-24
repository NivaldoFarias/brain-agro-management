/**
 * Validators barrel export module.
 *
 * Provides comprehensive validation functions for Brazilian documents (CPF, CNPJ)
 * and agricultural business rules (farm area constraints).
 *
 * @example
 * ```typescript
 * import { validateCPF, validateCNPJ, validateFarmArea } from '@agro/shared/validators';
 *
 * const isCPFValid = validateCPF("111.444.777-35");
 * const isCNPJValid = validateCNPJ("11.222.333/0001-81");
 * const farmValidation = validateFarmArea(100, 60, 30);
 * ```
 */

export { formatCNPJ, stripCNPJFormatting, validateCNPJ } from "./cnpj.validator";
export { formatCPF, stripCPFFormatting, validateCPF } from "./cpf.validator";
export {
	assertValidFarmArea,
	validateFarmArea,
	type FarmAreaValidationResult,
} from "./farm-area.validator";
