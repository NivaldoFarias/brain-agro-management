import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectPinoLogger } from "nestjs-pino";
import { Repository } from "typeorm";

import type {
	CityDistributionDto,
	DashboardStatsDto,
	FarmSummaryDto,
	ProducerSummaryDto,
} from "./dto";
import type { PinoLogger } from "nestjs-pino";
import type {
	CropDistribution,
	StateDistribution,
} from "node_modules/@agro/shared/src/types/dashboard.types";

import type { CitiesByState } from "@agro/shared/types";

import { BrazilianState, CropType, OrderBy } from "@agro/shared/utils";

import { City } from "@/modules/cities/entities/city.entity";
import { Farm } from "@/modules/farms/entities/farm.entity";
import { Producer } from "@/modules/producers/entities/producer.entity";

/**
 * Service responsible for aggregating dashboard statistics.
 *
 * Orchestrates queries across farms and producers to provide comprehensive
 * dashboard metrics in a single optimized response. Uses parallel query
 * execution for improved performance.
 *
 * @example
 * ```typescript
 * // In a controller
 * constructor(private readonly dashboardService: DashboardService) {}
 *
 * async getStats() {
 *   return this.dashboardService.getStats();
 * }
 * ```
 */
@Injectable()
export class DashboardService {
	constructor(
		@InjectRepository(City)
		private readonly cityRepository: Repository<City>,

		@InjectRepository(Farm)
		private readonly farmRepository: Repository<Farm>,

		@InjectRepository(Producer)
		private readonly producerRepository: Repository<Producer>,

		@InjectPinoLogger(DashboardService.name)
		private readonly logger: PinoLogger,
	) {}

	/**
	 * Retrieves all dashboard statistics in a single aggregated response.
	 *
	 * Executes multiple database queries in parallel for optimal performance.
	 * Calculates totals, averages, distributions, and top records.
	 *
	 * @returns Complete dashboard statistics
	 *
	 * @example
	 * ```typescript
	 * const stats = await service.getStats();
	 * console.log(`Total farms: ${stats.totals.farms}`);
	 * console.log(`Average area: ${stats.averages.areaPerFarm} ha`);
	 * ```
	 */
	async getStats(): Promise<DashboardStatsDto> {
		this.logger.info("Fetching dashboard statistics");

		const [
			totalFarms,
			totalProducers,
			areaStats,
			farmsByState,
			producersByState,
			farmsByCity,
			largestFarms,
			mostProductiveProducers,
		] = await Promise.all([
			this.getTotalFarms(),
			this.getTotalProducers(),
			this.getAreaStatistics(),
			this.getFarmsByState(),
			this.getProducersByState(),
			this.getFarmsByCity(10),
			this.getLargestFarms(5),
			this.getMostProductiveProducers(5),
		]);

		const unusedArea = areaStats.totalArea - areaStats.arableArea - areaStats.vegetationArea;
		const arablePercentage =
			areaStats.totalArea > 0 ? (areaStats.arableArea / areaStats.totalArea) * 100 : 0;
		const vegetationPercentage =
			areaStats.totalArea > 0 ? (areaStats.vegetationArea / areaStats.totalArea) * 100 : 0;
		const unusedPercentage = areaStats.totalArea > 0 ? (unusedArea / areaStats.totalArea) * 100 : 0;

		return {
			totals: {
				farms: totalFarms,
				producers: totalProducers,
				totalAreaHectares: areaStats.totalArea,
				arableAreaHectares: areaStats.arableArea,
				vegetationAreaHectares: areaStats.vegetationArea,
				unusedAreaHectares: unusedArea,
			},
			averages: {
				areaPerFarm: totalFarms > 0 ? areaStats.totalArea / totalFarms : 0,
				farmsPerProducer: totalProducers > 0 ? totalFarms / totalProducers : 0,
				arablePercentage,
				vegetationPercentage,
				unusedPercentage,
			},
			distributions: {
				byState: farmsByState,
				byCrop: areaStats.cropDistribution,
				byCityTop10: farmsByCity,
				producersByState,
			},
			topRecords: {
				largestFarms,
				mostProductiveProducers,
			},
			landUse: {
				arableArea: areaStats.arableArea,
				vegetationArea: areaStats.vegetationArea,
			},
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Gets total count of farms.
	 *
	 * @returns Total farm count
	 */
	private async getTotalFarms(): Promise<number> {
		return this.farmRepository.count();
	}

	/**
	 * Gets total count of producers.
	 *
	 * @returns Total producer count
	 */
	private async getTotalProducers(): Promise<number> {
		return this.producerRepository.count();
	}

	/**
	 * Gets aggregated area statistics including crop distribution.
	 *
	 * @returns Object containing total, arable, vegetation areas and crop distribution
	 */
	private async getAreaStatistics(): Promise<{
		totalArea: number;
		arableArea: number;
		vegetationArea: number;
		cropDistribution: Array<CropDistribution>;
	}> {
		const areaResult: { total: string; arable: string; vegetation: string } | undefined =
			await this.farmRepository
				.createQueryBuilder("farm")
				.select("SUM(farm.totalArea)", "total")
				.addSelect("SUM(farm.arableArea)", "arable")
				.addSelect("SUM(farm.vegetationArea)", "vegetation")
				.getRawOne();

		const cropResults: Array<{ cropType: string; count: string }> = await this.farmRepository
			.createQueryBuilder("farm")
			.innerJoin("farm.farmHarvests", "fh")
			.innerJoin("fh.crops", "fhc")
			.select("fhc.cropType", "cropType")
			.addSelect("COUNT(DISTINCT farm.id)", "count")
			.groupBy("fhc.cropType")
			.orderBy("count", OrderBy.Descending)
			.getRawMany();

		return {
			totalArea: Number.parseFloat(areaResult?.total ?? "0") || 0,
			arableArea: Number.parseFloat(areaResult?.arable ?? "0") || 0,
			vegetationArea: Number.parseFloat(areaResult?.vegetation ?? "0") || 0,
			cropDistribution: cropResults.map((result) => ({
				cropType: result.cropType as CropType,
				count: Number.parseInt(result.count, 10),
			})),
		};
	}

	/**
	 * Gets farm distribution grouped by state.
	 *
	 * @returns Array of state distributions ordered by count descending
	 */
	private async getFarmsByState(): Promise<Array<StateDistribution>> {
		const results: Array<{ state: string; count: string }> = await this.farmRepository
			.createQueryBuilder("farm")
			.select("farm.state", "state")
			.addSelect("COUNT(farm.id)", "count")
			.groupBy("farm.state")
			.orderBy("count", OrderBy.Descending)
			.getRawMany();

		return results.map((result) => ({
			state: result.state as BrazilianState,
			count: Number.parseInt(result.count, 10),
		}));
	}

	/**
	 * Gets producer distribution grouped by state.
	 *
	 * Aggregates producers by the states where they own farms.
	 *
	 * @returns Array of state distributions ordered by count descending
	 */
	private async getProducersByState(): Promise<Array<StateDistribution>> {
		const results: Array<{ state: string; count: string }> = await this.farmRepository
			.createQueryBuilder("farm")
			.select("farm.state", "state")
			.addSelect("COUNT(DISTINCT farm.producerId)", "count")
			.groupBy("farm.state")
			.orderBy("count", OrderBy.Descending)
			.getRawMany();

		return results.map((result) => ({
			state: result.state as BrazilianState,
			count: Number.parseInt(result.count, 10),
		}));
	}

	/**
	 * Gets farm distribution grouped by city.
	 *
	 * @param limit Maximum number of cities to return
	 *
	 * @returns Array of city distributions ordered by count descending
	 */
	private async getFarmsByCity(limit: number): Promise<Array<CityDistributionDto>> {
		const results: Array<{ city: string; state: string; count: string }> = await this.farmRepository
			.createQueryBuilder("farm")
			.select("farm.city", "city")
			.addSelect("farm.state", "state")
			.addSelect("COUNT(farm.id)", "count")
			.groupBy("farm.city")
			.addGroupBy("farm.state")
			.orderBy("count", OrderBy.Descending)
			.limit(limit)
			.getRawMany();

		return results.map((result) => ({
			city: result.city,
			state: result.state,
			count: Number.parseInt(result.count, 10),
		}));
	}

	/**
	 * Gets the largest farms by total area.
	 *
	 * @param limit Number of farms to return
	 *
	 * @returns Array of farm summaries ordered by area descending
	 */
	private async getLargestFarms(limit: number): Promise<Array<FarmSummaryDto>> {
		const farms = await this.farmRepository.find({
			relations: ["producer"],
			order: { totalArea: OrderBy.Descending },
			take: limit,
		});

		return farms.map((farm) => ({
			id: farm.id,
			name: farm.name,
			state: farm.state,
			city: farm.city,
			totalArea: farm.totalArea,
			producerName: farm.producer.name,
		}));
	}

	/**
	 * Gets producers with the most farms.
	 *
	 * Aggregates farm count and total area per producer.
	 *
	 * @param limit Number of producers to return
	 *
	 * @returns Array of producer summaries ordered by farm count descending
	 */
	private async getMostProductiveProducers(limit: number): Promise<Array<ProducerSummaryDto>> {
		const results: Array<{
			id: string;
			name: string;
			farmCount: string;
			totalArea: string;
		}> = await this.producerRepository
			.createQueryBuilder("producer")
			.innerJoin("producer.farms", "farm")
			.select("producer.id", "id")
			.addSelect("producer.name", "name")
			.addSelect("COUNT(farm.id)", "farmCount")
			.addSelect("SUM(farm.totalArea)", "totalArea")
			.groupBy("producer.id")
			.addGroupBy("producer.name")
			.orderBy("farmCount", OrderBy.Descending)
			.addOrderBy("totalArea", OrderBy.Descending)
			.limit(limit)
			.getRawMany();

		return results.map((result) => ({
			id: result.id,
			name: result.name,
			farmCount: Number.parseInt(result.farmCount, 10),
			totalArea: Number.parseFloat(result.totalArea) || 0,
		}));
	}

	/**
	 * Gets all unique cities grouped by Brazilian state.
	 *
	 * Queries all cities from the database (seeded from IBGE) and organizes
	 * them into a map structure for efficient client-side filtering.
	 *
	 * @returns Object mapping state codes to arrays of cities
	 *
	 * @example
	 * ```typescript
	 * const cities = await service.getCitiesByState();
	 * console.log(cities.SP); // [{ name: "São Paulo", state: "SP" }, ...]
	 * ```
	 */
	async getCitiesByState(): Promise<CitiesByState> {
		this.logger.debug("Fetching cities grouped by state");

		const cities = await this.cityRepository.find({
			select: ["name", "state"],
			order: {
				state: OrderBy.Ascending,
				name: OrderBy.Ascending,
			},
		});

		const citiesByState: CitiesByState = {} as CitiesByState;

		for (const city of cities) {
			citiesByState[city.state as BrazilianState] ??= [];

			citiesByState[city.state as BrazilianState].push(city.name);
		}

		this.logger.debug({ totalCities: cities.length }, "Cities grouped successfully");

		return citiesByState;
	}
}
