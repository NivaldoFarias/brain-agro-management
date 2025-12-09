import { ApiProperty } from "@nestjs/swagger";

import type { CropDistribution, LandUseStats, StateDistribution } from "@agro/shared/types";

/**
 * Summary information for a farm.
 *
 * Used in dashboard top records display.
 */
export class FarmSummaryDto {
	@ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
	id!: string;

	@ApiProperty({ example: "Fazenda Boa Vista" })
	name!: string;

	@ApiProperty({ example: "SP" })
	state!: string;

	@ApiProperty({ example: "Campinas" })
	city!: string;

	@ApiProperty({ example: 1250.75 })
	totalArea!: number;

	@ApiProperty({ example: "João da Silva" })
	producerName!: string;
}

/**
 * Summary information for a producer.
 *
 * Used in dashboard top records display.
 */
export class ProducerSummaryDto {
	@ApiProperty({ example: "660f9500-f51e-74g7-d049-779988773333" })
	id!: string;

	@ApiProperty({ example: "João da Silva" })
	name!: string;

	@ApiProperty({ example: 5 })
	farmCount!: number;

	@ApiProperty({ example: 2500.5 })
	totalArea!: number;
}

/**
 * City distribution data.
 *
 * Shows farm count grouped by city.
 */
export class CityDistributionDto {
	@ApiProperty({ example: "Campinas" })
	city!: string;

	@ApiProperty({ example: "SP" })
	state!: string;

	@ApiProperty({ example: 12 })
	count!: number;
}

/**
 * Total metrics for the dashboard.
 *
 * Aggregates core statistics across all farms and producers.
 */
export class DashboardTotalsDto {
	@ApiProperty({ example: 150 })
	farms!: number;

	@ApiProperty({ example: 85 })
	producers!: number;

	@ApiProperty({ example: 15230.75 })
	totalAreaHectares!: number;

	@ApiProperty({ example: 10500.5 })
	arableAreaHectares!: number;

	@ApiProperty({ example: 3200.25 })
	vegetationAreaHectares!: number;

	@ApiProperty({ example: 1530.0 })
	unusedAreaHectares!: number;
}

/**
 * Average metrics for the dashboard.
 *
 * Provides calculated averages for key performance indicators.
 */
export class DashboardAveragesDto {
	@ApiProperty({ example: 101.54 })
	areaPerFarm!: number;

	@ApiProperty({ example: 1.76 })
	farmsPerProducer!: number;

	@ApiProperty({ example: 68.95 })
	arablePercentage!: number;

	@ApiProperty({ example: 21.01 })
	vegetationPercentage!: number;

	@ApiProperty({ example: 10.04 })
	unusedPercentage!: number;
}

/**
 * Distribution data for the dashboard.
 *
 * Contains geographic and crop distribution information.
 */
export class DashboardDistributionsDto {
	@ApiProperty({ type: [Object], isArray: true })
	byState!: Array<StateDistribution>;

	@ApiProperty({ type: [Object], isArray: true })
	byCrop!: Array<CropDistribution>;

	@ApiProperty({ type: [CityDistributionDto], isArray: true })
	byCityTop10!: Array<CityDistributionDto>;

	@ApiProperty({ type: [Object], isArray: true })
	producersByState!: Array<StateDistribution>;
}

/**
 * Top records for the dashboard.
 *
 * Highlights best-performing entities.
 */
export class DashboardTopRecordsDto {
	@ApiProperty({ type: [FarmSummaryDto], isArray: true })
	largestFarms!: Array<FarmSummaryDto>;

	@ApiProperty({ type: [ProducerSummaryDto], isArray: true })
	mostProductiveProducers!: Array<ProducerSummaryDto>;
}

/**
 * Complete dashboard statistics response.
 *
 * Aggregates all dashboard metrics in a single response for optimal
 * performance. Replaces multiple individual stat endpoints.
 *
 * @example
 * ```typescript
 * const stats: DashboardStatsDto = {
 *   totals: { farms: 150, producers: 85, ... },
 *   averages: { areaPerFarm: 101.54, ... },
 *   distributions: { byState: [...], ... },
 *   topRecords: { largestFarms: [...], ... },
 *   landUse: { arableArea: 10500.5, ... },
 *   timestamp: "2024-01-15T10:30:00.000Z"
 * };
 * ```
 */
export class DashboardStatsDto {
	@ApiProperty({ type: DashboardTotalsDto })
	totals!: DashboardTotalsDto;

	@ApiProperty({ type: DashboardAveragesDto })
	averages!: DashboardAveragesDto;

	@ApiProperty({ type: DashboardDistributionsDto })
	distributions!: DashboardDistributionsDto;

	@ApiProperty({ type: DashboardTopRecordsDto })
	topRecords!: DashboardTopRecordsDto;

	@ApiProperty({ type: Object })
	landUse!: LandUseStats;

	@ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
	timestamp!: string;
}
