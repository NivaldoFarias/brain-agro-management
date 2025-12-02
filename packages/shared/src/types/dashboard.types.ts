import type { BrazilianState, CropType } from "../utils/constants.util";

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
 *   arableArea: 8500.75,
 *   vegetationArea: 3200.25,
 * };
 * ```
 */
export interface LandUseStats {
	/**
	 * Total arable area across all farms in hectares.
	 *
	 * @minimum `0`
	 */
	arableArea: number;

	/**
	 * Total vegetation area across all farms in hectares.
	 *
	 * @minimum `0`
	 */
	vegetationArea: number;
}

/**
 * Standardized response format for paginated list endpoints.
 *
 * Encapsulates an array of data items along with pagination metadata
 * such as total item count, current page, and items per page.
 *
 * @example
 * ```typescript
 * const response: ListAllData<Farm> = {
 *   data: [...],
 *   total: 150,
 *   page: 2,
 *   limit: 25,
 * };
 * ```
 */
export interface ListAllData<T> {
	/** Array of data items */
	data: Array<T>;

	/** Total number of items available */
	total: number;

	/** Current page number */
	page: number;

	/** Number of items per page */
	limit: number;
}
