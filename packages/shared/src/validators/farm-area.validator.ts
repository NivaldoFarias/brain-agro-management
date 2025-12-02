/**
 * Farm area validation result interface.
 *
 * Contains the validation outcome and optional error message for detailed
 * feedback on farm area validation failures.
 */
export interface FarmAreaValidationResult {
	/** Whether the farm areas are valid */
	isValid: boolean;

	/** Error message if validation failed, undefined otherwise */
	error?: string;
}

/**
 * Validates farm area constraints according to Brazilian agricultural regulations.
 *
 * Ensures that the sum of arable area (área agricultável) and vegetation area
 * (área de vegetação) does not exceed the total farm area. All areas must be
 * non-negative values.
 *
 * Business Rules:
 * - Total area must be greater than 0
 * - Arable area must be greater than or equal to 0
 * - Vegetation area must be greater than or equal to 0
 * - Arable area + Vegetation area must be ≤ Total area
 *
 * @param totalArea Total farm area in hectares
 * @param arableArea Arable/agricultural area in hectares (área agricultável)
 * @param vegetationArea Vegetation/preservation area in hectares (área de vegetação)
 *
 * @returns Validation result with `isValid` boolean and optional `error` message
 *
 * @example
 * ```typescript
 * validateFarmArea(100, 60, 30);
 * // => { isValid: true }
 *
 * validateFarmArea(100, 70, 40);
 * // => { isValid: false, error: "Sum of arable and vegetation areas (110.00 ha) exceeds total area (100.00 ha)" }
 *
 * validateFarmArea(0, 50, 30);
 * // => { isValid: false, error: "Total area must be greater than 0" }
 *
 * validateFarmArea(100, -10, 30);
 * // => { isValid: false, error: "Arable area cannot be negative" }
 * ```
 *
 * @see {@link FarmAreaValidationResult} for the return type structure
 */
export function validateFarmArea(
	totalArea: number,
	arableArea: number,
	vegetationArea: number,
): FarmAreaValidationResult {
	if (totalArea <= 0) {
		return {
			isValid: false,
			error: "Total area must be greater than 0",
		};
	}

	if (arableArea < 0) {
		return {
			isValid: false,
			error: "Arable area cannot be negative",
		};
	}

	if (vegetationArea < 0) {
		return {
			isValid: false,
			error: "Vegetation area cannot be negative",
		};
	}

	const sumOfAreas = arableArea + vegetationArea;

	if (sumOfAreas > totalArea) {
		return {
			isValid: false,
			error: `Sum of arable and vegetation areas (${sumOfAreas.toFixed(2)} ha) exceeds total area (${totalArea.toFixed(2)} ha)`,
		};
	}

	return { isValid: true };
}

/**
 * Validates farm area constraints and throws an error if invalid.
 *
 * Convenience wrapper around {@link validateFarmArea} that throws a descriptive
 * error instead of returning a result object. Useful for input validation in
 * API endpoints or service methods where exceptions are preferred.
 *
 * @param totalArea Total farm area in hectares
 * @param arableArea Arable/agricultural area in hectares
 * @param vegetationArea Vegetation/preservation area in hectares
 *
 * @throws Error with descriptive message if validation fails
 *
 * @example
 * ```typescript
 * try {
 *   assertValidFarmArea(100, 60, 30);
 *   console.log("Areas are valid");
 * } catch (error) {
 *   console.error(error.message);
 * }
 *
 * assertValidFarmArea(100, 70, 40);
 * // throws Error: "Sum of arable and vegetation areas (110.00 ha) exceeds total area (100.00 ha)"
 * ```
 *
 * @see {@link validateFarmArea} for the underlying validation logic
 */
export function assertValidFarmArea(
	totalArea: number,
	arableArea: number,
	vegetationArea: number,
): void {
	const result = validateFarmArea(totalArea, arableArea, vegetationArea);

	if (!result.isValid) throw new Error(result.error);
}
