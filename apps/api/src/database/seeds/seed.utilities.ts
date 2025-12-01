import { faker } from "@faker-js/faker/locale/pt_BR";
import { Injectable } from "@nestjs/common";

import { BrazilianState, CropType } from "@agro/shared/utils";

import { CROP_COMBINATIONS, STATE_WEIGHTS } from "./seed.constants";

/**
 * Database seeding utilities provider.
 *
 * Provides reusable helper methods for generating realistic seed data:
 * - Weighted state selection based on agricultural importance
 * - Farm area generation with realistic constraints
 * - Crop combination selection
 *
 * This service follows the Provider pattern and uses Dependency Injection
 * for improved testability and maintainability.
 *
 * @example
 * ```typescript
 * constructor(private readonly seedUtilities: SeedUtilities) {}
 *
 * const state = this.seedUtilities.getWeightedRandomState();
 * const areas = this.seedUtilities.generateFarmAreas();
 * ```
 */
@Injectable()
export class SeedUtilities {
	/**
	 * Generates a weighted random Brazilian state based on agricultural importance.
	 *
	 * Uses cumulative distribution function (CDF) to select states with
	 * probabilities proportional to their agricultural relevance.
	 * States like MT, PR, RS have higher weights due to their agricultural output.
	 *
	 * @returns {BrazilianState} Brazilian state code (e.g., `BrazilianState.MT`)
	 *
	 * @example
	 * ```typescript
	 * const state = this.seedUtilities.getWeightedRandomState();
	 * // Returns states like MT, PR more frequently than AC, RR
	 * ```
	 */
	getWeightedRandomState(): BrazilianState {
		const random = Math.random();
		let cumulative = 0;

		for (const [state, weight] of Object.entries(STATE_WEIGHTS)) {
			cumulative += weight;

			if (random <= cumulative) {
				return state as BrazilianState;
			}
		}

		// Fallback to MT (most agricultural state)
		return BrazilianState.MT;
	}

	/**
	 * Generates realistic farm areas ensuring mathematical constraints are met.
	 *
	 * Creates a farm with:
	 * - Total area: 10 to 5,000 hectares
	 * - Arable area: 30-85% of total area
	 * - Vegetation area: 15-95% of remaining area after arable
	 *
	 * All areas are rounded to 2 decimal places and satisfy:
	 * `arableArea + vegetationArea <= totalArea`
	 *
	 * @returns Farm areas object with total, arable, and vegetation hectares
	 *
	 * @example
	 * ```typescript
	 * const areas = this.seedUtilities.generateFarmAreas();
	 * console.log(areas);
	 * // { totalArea: 1234.56, arableArea: 864.19, vegetationArea: 185.67 }
	 * ```
	 */
	generateFarmAreas(): {
		totalArea: number;
		arableArea: number;
		vegetationArea: number;
	} {
		const totalArea = faker.number.float({ min: 10, max: 5000, fractionDigits: 2 });
		const arablePercentage = faker.number.float({ min: 0.3, max: 0.85, fractionDigits: 2 });
		const arableArea = Number((totalArea * arablePercentage).toFixed(2));
		const remainingArea = totalArea - arableArea;
		const vegetationArea = Number(
			(remainingArea * faker.number.float({ min: 0.15, max: 0.95, fractionDigits: 2 })).toFixed(2),
		);

		return { totalArea, arableArea, vegetationArea };
	}

	/**
	 * Gets a random crop combination for a harvest.
	 *
	 * Selects from predefined realistic crop combinations that represent
	 * common Brazilian farming patterns:
	 * - Monoculture (single crop)
	 * - Crop rotation (soybean/corn)
	 * - Multi-crop systems
	 *
	 * @returns Array of crop types to plant together
	 *
	 * @example
	 * ```typescript
	 * const crops = this.seedUtilities.getRandomCropCombination();
	 * console.log(crops);
	 * // [CropType.Soja, CropType.Milho] or [CropType.Cafe]
	 * ```
	 */
	getRandomCropCombination(): Array<CropType> {
		return faker.helpers.arrayElement(CROP_COMBINATIONS);
	}
}
