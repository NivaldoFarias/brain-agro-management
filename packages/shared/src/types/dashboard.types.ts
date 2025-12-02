import type { BrazilianState, CropType } from "../utils/constants.util";

/**
 * Total area statistics for dashboard overview.
 *
 * Provides aggregated metrics for all farms in the system, including
 * total farm count and sum of all farm areas.
 *
 * @example
 * ```typescript
 * const stats: TotalAreaStats = {
 *   totalFarms: 150,
 *   totalAreaHectares: 12500.50
 * };
 * ```
 */
export interface TotalAreaStats {
	/**
	 * Total number of registered farms.
	 *
	 * @minimum `0`
	 */
	totalFarms?: number;

	/**
	 * Sum of all farm areas in hectares.
	 *
	 * @minimum `0`
	 */
	totalAreaHectares?: number;
}

/**
 * Farm distribution by Brazilian state.
 *
 * Represents the count of farms for a specific state, used for
 * geographic distribution visualization.
 *
 * @example
 * ```typescript
 * const distribution: StateDistribution = {
 *   state: "SP",
 *   count: 45
 * };
 * ```
 */
export interface StateDistribution {
	/**
	 * Brazilian state code (UF).
	 *
	 * @see {@link BrazilianState}
	 */
	state: BrazilianState;

	/**
	 * Number of farms in this state.
	 *
	 * @minimum `0`
	 */
	count: number;
}

/**
 * Crop distribution with count and percentage.
 *
 * Represents how many farms cultivate each crop type, including
 * the percentage relative to total farms with crops.
 *
 * @example
 * ```typescript
 * const distribution: CropDistribution = {
 *   crop: "soy",
 *   count: 85,
 *   percentage: 56.67
 * };
 * ```
 */
export interface CropDistribution {
	/**
	 * Crop type identifier.
	 *
	 * @see {@link CropType}
	 */
	cropType: CropType;

	/**
	 * Number of farms cultivating this crop.
	 *
	 * @minimum `0`
	 */
	count: number;

	/**
	 * Percentage of farms cultivating this crop.
	 *
	 * Calculated as (count / total farms with crops) × 100
	 *
	 * @minimum `0`
	 * @maximum `100`
	 */
	percentage: number;
}

/**
 * Land use statistics showing arable vs vegetation area distribution.
 *
 * Provides aggregated metrics for land usage across all farms,
 * useful for environmental impact analysis.
 *
 * @example
 * ```typescript
 * const stats: LandUseStats = {
 *   arableAreaHectares: 8500.75,
 *   vegetationAreaHectares: 3200.25,
 *   arablePercentage: 72.67,
 *   vegetationPercentage: 27.33
 * };
 * ```
 */
export interface LandUseStats {
	/**
	 * Total arable area across all farms in hectares.
	 *
	 * @minimum `0`
	 */
	arableAreaHectares: number;

	/**
	 * Total vegetation area across all farms in hectares.
	 *
	 * @minimum `0`
	 */
	vegetationAreaHectares: number;

	/**
	 * Percentage of land used for cultivation.
	 *
	 * Calculated as (arableArea / totalArea) × 100
	 *
	 * @minimum `0`
	 * @maximum `100`
	 */
	arablePercentage: number;

	/**
	 * Percentage of land preserved as vegetation.
	 *
	 * Calculated as (vegetationArea / totalArea) × 100
	 *
	 * @minimum `0`
	 * @maximum `100`
	 */
	vegetationPercentage: number;
}
