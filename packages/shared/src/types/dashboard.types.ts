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

/**
 * Summary information for a farm.
 *
 * Used in dashboard top records display.
 */
export interface FarmSummary {
	/** Farm unique identifier */
	id: string;

	/** Farm name */
	name: string;

	/** Brazilian state code */
	state: string;

	/** City name */
	city: string;

	/** Total area in hectares */
	totalArea: number;

	/** Producer name */
	producerName: string;
}

/**
 * Summary information for a producer.
 *
 * Used in dashboard top records display.
 */
export interface ProducerSummary {
	/** Producer unique identifier */
	id: string;

	/** Producer name */
	name: string;

	/** Number of farms owned */
	farmCount: number;

	/** Total area across all farms in hectares */
	totalArea: number;
}

/**
 * City distribution data.
 *
 * Shows farm count grouped by city.
 */
export interface CityDistribution {
	/** City name */
	city: string;

	/** Brazilian state code */
	state: string;

	/** Number of farms in this city */
	count: number;
}

/**
 * Total metrics for the dashboard.
 *
 * Aggregates core statistics across all farms and producers.
 */
export interface DashboardTotals {
	/** Total number of farms */
	farms: number;

	/** Total number of producers */
	producers: number;

	/** Total area across all farms in hectares */
	totalAreaHectares: number;

	/** Total arable area in hectares */
	arableAreaHectares: number;

	/** Total vegetation area in hectares */
	vegetationAreaHectares: number;

	/** Total unused area in hectares */
	unusedAreaHectares: number;
}

/**
 * Average metrics for the dashboard.
 *
 * Provides calculated averages for key performance indicators.
 */
export interface DashboardAverages {
	/** Average farm size in hectares */
	areaPerFarm: number;

	/** Average number of farms per producer */
	farmsPerProducer: number;

	/** Percentage of total area that is arable */
	arablePercentage: number;

	/** Percentage of total area that is vegetation */
	vegetationPercentage: number;

	/** Percentage of total area that is unused */
	unusedPercentage: number;
}

/**
 * Distribution data for the dashboard.
 *
 * Contains geographic and crop distribution information.
 */
export interface DashboardDistributions {
	/** Farm count by state */
	byState: Array<StateDistribution>;

	/** Farm count by crop type */
	byCrop: Array<CropDistribution>;

	/** Top 10 cities by farm count */
	byCityTop10: Array<CityDistribution>;

	/** Producer count by state */
	producersByState: Array<StateDistribution>;
}

/**
 * Top records for the dashboard.
 *
 * Highlights best-performing entities.
 */
export interface DashboardTopRecords {
	/** Top 5 largest farms by area */
	largestFarms: Array<FarmSummary>;

	/** Top 5 producers by farm count */
	mostProductiveProducers: Array<ProducerSummary>;
}

/**
 * Complete dashboard statistics.
 *
 * Aggregates all dashboard metrics in a single response for optimal
 * performance. Replaces multiple individual stat endpoints.
 *
 * @example
 * ```typescript
 * const stats: DashboardStats = {
 *   totals: { farms: 150, producers: 85, ... },
 *   averages: { areaPerFarm: 101.54, ... },
 *   distributions: { byState: [...], ... },
 *   topRecords: { largestFarms: [...], ... },
 *   landUse: { arableArea: 10500.5, ... },
 *   timestamp: "2024-01-15T10:30:00.000Z"
 * };
 * ```
 */
export interface DashboardStats {
	/** Aggregate totals */
	totals: DashboardTotals;

	/** Calculated averages */
	averages: DashboardAverages;

	/** Distribution data */
	distributions: DashboardDistributions;

	/** Top performing records */
	topRecords: DashboardTopRecords;

	/** Land use statistics */
	landUse: LandUseStats;

	/** Timestamp when stats were generated */
	timestamp: string;
}
