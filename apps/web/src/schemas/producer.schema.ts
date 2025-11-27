import { z } from "zod";

import { validateCNPJ } from "@agro/shared/validators/cnpj.validator";
import { validateCPF } from "@agro/shared/validators/cpf.validator";

/**
 * Zod schema for producer creation form validation.
 *
 * Validates producer data with Brazilian-specific rules for CPF/CNPJ documents.
 * Uses shared validators to ensure document validity according to Brazilian algorithms.
 *
 * @example
 * ```typescript
 * const formData = createProducerSchema.parse({
 *   name: "João Silva",
 *   document: "111.444.777-35"
 * });
 * ```
 */
export const createProducerSchema = z.object({
	name: z
		.string({ message: "Name is required" })
		.min(3, "Name must be at least 3 characters")
		.max(255, "Name must be at most 255 characters")
		.trim(),

	document: z
		.string({ message: "Document is required" })
		.min(11, "Document must have at least 11 digits")
		.max(18, "Document must have at most 18 characters")
		.transform((value) => value.replaceAll(/[^\d]/g, ""))
		.refine((value) => validateCPF(value) || validateCNPJ(value), {
			message: "Invalid CPF or CNPJ",
		}),
});

/**
 * Zod schema for producer update form validation.
 *
 * All fields are optional - only provided fields will be validated and updated.
 *
 * @example
 * ```typescript
 * const formData = updateProducerSchema.parse({
 *   name: "João Silva (Updated)"
 * });
 * ```
 */
export const updateProducerSchema = z.object({
	name: z
		.string()
		.min(3, "Name must be at least 3 characters")
		.max(255, "Name must be at most 255 characters")
		.trim()
		.optional(),

	document: z
		.string()
		.min(11, "Document must have at least 11 digits")
		.max(18, "Document must have at most 18 characters")
		.transform((value) => value.replaceAll(/[^\d]/g, ""))
		.refine((value) => (value.length < 12 ? validateCPF(value) : validateCNPJ(value)), {
			message: "Invalid CPF or CNPJ",
		})
		.optional(),
});

/** Inferred TypeScript type from createProducerSchema */
export type CreateProducerFormData = z.infer<typeof createProducerSchema>;

/** Inferred TypeScript type from updateProducerSchema */
export type UpdateProducerFormData = z.infer<typeof updateProducerSchema>;
