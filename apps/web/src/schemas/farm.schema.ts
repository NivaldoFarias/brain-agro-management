import { z } from "zod";

import { BrazilianState, CropType } from "@agro/shared/enums";
import { validateFarmArea } from "@agro/shared/validators";

/**
 * Zod schema for farm creation form validation.
 *
 * Validates farm data with Brazilian-specific rules including:
 * - Valid Brazilian state codes
 * - Area validation (arable + vegetation ≤ total)
 * - Crop type enumeration
 *
 * @example
 * ```typescript
 * const formData = createFarmSchema.parse({
 *   name: "Fazenda Boa Vista",
 *   city: "Campinas",
 *   state: "SP",
 *   totalArea: 100.5,
 *   arableArea: 70.0,
 *   vegetationArea: 25.0,
 *   crops: ["soy", "corn"],
 *   producerId: "producer-uuid"
 * });
 * ```
 */
export const createFarmSchema = z
	.object({
		name: z
			.string()
			.min(3, "Farm name must be at least 3 characters")
			.max(255, "Farm name must be at most 255 characters")
			.trim(),

		city: z
			.string()
			.min(2, "City name must be at least 2 characters")
			.max(100, "City name must be at most 100 characters")
			.trim(),

		state: z.enum(BrazilianState, { message: "Please select a valid Brazilian state" }),

		totalArea: z
			.number({ message: "Total area is required" })
			.positive("Total area must be greater than zero")
			.min(0.01, "Total area must be at least 0.01 hectares"),

		arableArea: z
			.number({ message: "Arable area is required" })
			.nonnegative("Arable area cannot be negative")
			.default(0),

		vegetationArea: z
			.number({ message: "Vegetation area is required" })
			.nonnegative("Vegetation area cannot be negative")
			.default(0),

		crops: z
			.array(z.enum(CropType))
			.min(1, "At least one crop must be selected")
			.max(10, "Maximum of 10 crops allowed"),
		producerId: z.uuid(),
	})
	.refine(
		(data) => {
			const validation = validateFarmArea(data.totalArea, data.arableArea, data.vegetationArea);
			return validation.isValid;
		},
		{
			message: "Sum of arable and vegetation areas cannot exceed total area",
			path: ["totalArea"],
		},
	);

/**
 * Zod schema for farm update form validation.
 *
 * All fields are optional except for area validation.
 * When areas are provided, they must still satisfy the constraint:
 * arable + vegetation ≤ total
 *
 * @example
 * ```typescript
 * const formData = updateFarmSchema.parse({
 *   name: "Fazenda Boa Vista (Updated)",
 *   totalArea: 120.0
 * });
 * ```
 */
export const updateFarmSchema = z
	.object({
		name: z
			.string()
			.min(3, "Farm name must be at least 3 characters")
			.max(255, "Farm name must be at most 255 characters")
			.trim()
			.optional(),

		city: z
			.string()
			.min(2, "City name must be at least 2 characters")
			.max(100, "City name must be at most 100 characters")
			.trim()
			.optional(),

		state: z.enum(BrazilianState, { message: "Please select a valid Brazilian state" }).optional(),

		totalArea: z
			.number({ message: "Total area must be a number" })
			.positive("Total area must be greater than zero")
			.min(0.01, "Total area must be at least 0.01 hectares")
			.optional(),

		arableArea: z
			.number({ message: "Arable area must be a number" })
			.nonnegative("Arable area cannot be negative")
			.optional(),

		vegetationArea: z
			.number({ message: "Vegetation area must be a number" })
			.nonnegative("Vegetation area cannot be negative")
			.optional(),

		crops: z
			.array(z.enum(CropType))
			.min(1, "At least one crop must be selected")
			.max(10, "Maximum of 10 crops allowed")
			.optional(),

		producerId: z.uuid().optional(),
	})
	.refine(
		(data) => {
			if (
				data.totalArea !== undefined &&
				data.arableArea !== undefined &&
				data.vegetationArea !== undefined
			) {
				const validation = validateFarmArea(data.totalArea, data.arableArea, data.vegetationArea);
				return validation.isValid;
			}
			return true;
		},
		{
			message: "Sum of arable and vegetation areas cannot exceed total area",
			path: ["totalArea"],
		},
	);

/** Inferred TypeScript type from createFarmSchema */
export type CreateFarmFormData = z.infer<typeof createFarmSchema>;

/** Inferred TypeScript type from updateFarmSchema */
export type UpdateFarmFormData = z.infer<typeof updateFarmSchema>;
