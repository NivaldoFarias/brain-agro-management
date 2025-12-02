import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import type { ReactElement } from "react";

import { DashboardBarChart } from "@/components/organisms/DashboardBarChart";
import { DashboardDataTable } from "@/components/organisms/DashboardDataTable";
import { DashboardGauge } from "@/components/organisms/DashboardGauge";
import { DashboardGrid } from "@/components/organisms/DashboardGrid";
import { DashboardPieChart } from "@/components/organisms/DashboardPieChart";
import { DashboardStatCard } from "@/components/organisms/DashboardStatCard";
import { PageContainer } from "@/components/templates/PageContainer";
import { AreaIcon, FarmIcon, TrendingUpIcon, UsersIcon } from "@/components/ui/Icon";
import { useGetDashboardStatsQuery } from "@/store/api/dashboardApi";

/**
 * Enhanced dashboard page displaying comprehensive agricultural analytics.
 *
 * Shows totals, averages, distributions, top records, and land efficiency
 * metrics across all registered farms and producers. Uses a single optimized
 * API call for all data.
 *
 * ## Performance
 * - Single aggregated API request
 * - Memoized chart transformations
 * - Efficient skeleton loading states
 *
 * @example
 * ```tsx
 * <Route path="/dashboard" element={<DashboardPage />} />
 * ```
 */
export function DashboardPage(): ReactElement {
	const { t } = useTranslation();
	const { data: stats, isLoading, error } = useGetDashboardStatsQuery();

	/** Transformed state distribution data for bar chart */
	const stateChartData = useMemo(
		() =>
			stats?.distributions.byState.map((item) => ({
				name: t(($) => $.states[item.state]),
				value: item.count,
			})) ?? [],
		[stats?.distributions.byState, t],
	);

	/** Transformed city distribution data for bar chart */
	const cityChartData = useMemo(
		() =>
			stats?.distributions.byCityTop10.map((item) => ({
				name: `${item.city}, ${item.state}`,
				value: item.count,
			})) ?? [],
		[stats?.distributions.byCityTop10],
	);

	/** Transformed producer distribution data for pie chart  */
	const producersChartData = useMemo(() => {
		const totalProducers = stats?.distributions.producersByState.reduce((sum, item) => sum + item.count, 0) ?? 0;

		return (
			stats?.distributions.producersByState.map((item) => ({
				name: t(($) => $.states[item.state]),
				value: totalProducers > 0 ? Math.round((item.count / totalProducers) * 100) : 0,
			})) ?? []
		);
	}, [stats?.distributions.producersByState, t]);

	/** Transformed crop distribution data for pie chart */
	const cropChartData = useMemo(() => {
		if (!stats?.distributions.byCrop) return [];
		const totalCrops = stats.distributions.byCrop.reduce((sum, item) => sum + item.count, 0);
		return stats.distributions.byCrop.map((item) => ({
			name: t(($) => $.crops[item.cropType]),
			value: totalCrops > 0 ? Math.round((item.count / totalCrops) * 100) : 0,
		}));
	}, [stats?.distributions.byCrop, t]);

	/** Transformed land use data for pie chart */
	const landUseChartData = useMemo(() => {
		if (!stats?.landUse) return [];
		const totalLand = stats.landUse.arableArea + stats.landUse.vegetationArea;
		return [
			{
				name: t(($) => $.dashboard.arable),
				value: totalLand > 0 ? Math.round((stats.landUse.arableArea / totalLand) * 100) : 0,
			},
			{
				name: t(($) => $.dashboard.vegetation),
				value: totalLand > 0 ? Math.round((stats.landUse.vegetationArea / totalLand) * 100) : 0,
			},
		];
	}, [stats?.landUse, t]);

	/** Transformed land efficiency data for gauge */
	const landEfficiencyData = useMemo(
		() =>
			stats ?
				[
					{
						name: t(($) => $.dashboard.arable),
						value: stats.averages.arablePercentage,
						color: "#10B981",
					},
					{
						name: t(($) => $.dashboard.vegetation),
						value: stats.averages.vegetationPercentage,
						color: "#F59E0B",
					},
					{
						name: t(($) => $.dashboard.unused),
						value: stats.averages.unusedPercentage,
						color: "#EF4444",
					},
				]
			:	[],
		[stats, t],
	);

	const errorMessage = error ? t(($) => $.dashboard.loadError) : null;

	return (
		<PageContainer>
			<Container>
				<PageHeader>
					<Title>{t(($) => $.dashboard.title)}</Title>
					<Subtitle>{t(($) => $.dashboard.subtitle)}</Subtitle>
				</PageHeader>

				{/* Primary Stats Cards */}
				<DashboardGrid columns={4}>
					<DashboardStatCard
						label={t(($) => $.dashboard.totalFarms)}
						value={stats?.totals.farms ?? 0}
						icon={<FarmIcon size={24} />}
						variant="success"
						isLoading={isLoading}
					/>
					<DashboardStatCard
						label={t(($) => $.dashboard.totalProducers)}
						value={stats?.totals.producers ?? 0}
						icon={<UsersIcon size={24} />}
						variant="info"
						isLoading={isLoading}
					/>
					<DashboardStatCard
						label={t(($) => $.dashboard.totalArea)}
						value={stats?.totals.totalAreaHectares.toFixed(2) ?? "0"}
						unit={t(($) => $.dashboard.hectares)}
						icon={<AreaIcon size={24} />}
						variant="primary"
						isLoading={isLoading}
					/>
					<DashboardStatCard
						label={t(($) => $.dashboard.averageAreaPerFarm)}
						value={stats?.averages.areaPerFarm.toFixed(2) ?? "0"}
						unit={t(($) => $.dashboard.hectares)}
						icon={<TrendingUpIcon size={24} />}
						variant="warning"
						isLoading={isLoading}
					/>
				</DashboardGrid>

				{/* Secondary Stats Cards */}
				<DashboardGrid columns={3}>
					<DashboardStatCard
						label={t(($) => $.dashboard.farmsPerProducer)}
						value={stats?.averages.farmsPerProducer.toFixed(2) ?? "0"}
						icon={<TrendingUpIcon size={24} />}
						variant="success"
						isLoading={isLoading}
					/>
					<DashboardStatCard
						label={t(($) => $.dashboard.landUseEfficiency)}
						value={
							stats ? `${(stats.averages.arablePercentage + stats.averages.vegetationPercentage).toFixed(1)}%` : "0%"
						}
						icon={<AreaIcon size={24} />}
						variant="info"
						isLoading={isLoading}
					/>
					<DashboardStatCard
						label={t(($) => $.dashboard.unusedLand)}
						value={stats?.totals.unusedAreaHectares.toFixed(2) ?? "0"}
						unit={t(($) => $.dashboard.hectares)}
						icon={<AreaIcon size={24} />}
						variant="error"
						isLoading={isLoading}
					/>
				</DashboardGrid>

				{/* Geographic Distribution Section */}
				<SectionTitle>
					{t(($) => $.nav.dashboard)} - {t(($) => $.dashboard.geoDistribution)}
				</SectionTitle>
				<DashboardGrid columns={2}>
					<DashboardBarChart
						title={t(($) => $.dashboard.farmsByState)}
						data={stateChartData}
						isLoading={isLoading}
						error={errorMessage}
					/>
					<DashboardBarChart
						title={t(($) => $.dashboard.farmsByCity)}
						data={cityChartData}
						isLoading={isLoading}
						error={errorMessage}
					/>
				</DashboardGrid>

				<DashboardGrid columns={2}>
					<DashboardPieChart
						title={t(($) => $.dashboard.producersByState)}
						data={producersChartData}
						isLoading={isLoading}
						error={errorMessage}
					/>
					<DashboardGauge
						title={t(($) => $.dashboard.landEfficiency)}
						data={landEfficiencyData}
						isLoading={isLoading}
						error={errorMessage}
					/>
				</DashboardGrid>

				{/* Agricultural Metrics Section */}
				<SectionTitle>{t(($) => $.dashboard.agriculturalMetrics)}</SectionTitle>
				<DashboardGrid columns={2}>
					<DashboardPieChart
						title={t(($) => $.dashboard.cropsDistribution)}
						data={cropChartData}
						isLoading={isLoading}
						error={errorMessage}
						overrides={{ outerRadius: 100 }}
					/>
					<DashboardPieChart
						title={t(($) => $.dashboard.landUseDistribution)}
						data={landUseChartData}
						isLoading={isLoading}
						error={errorMessage}
						colors={["#10B981", "#F59E0B"]}
						overrides={{ outerRadius: 100 }}
					/>
				</DashboardGrid>

				{/* Top Records Section */}
				<SectionTitle>{t(($) => $.dashboard.highlights)}</SectionTitle>
				<DashboardGrid columns={2}>
					<DashboardDataTable
						title={t(($) => $.dashboard.largestFarms)}
						data={stats?.topRecords.largestFarms}
						columns={[
							{
								header: t(($) => $.dashboard.farmName),
								accessor: (row) => row.name,
							},
							{
								header: t(($) => $.dashboard.city),
								accessor: (row) => `${row.city}, ${row.state}`,
							},
							{
								header: t(($) => $.dashboard.area),
								accessor: (row) => row.totalArea,
								format: (value) => `${Number(value).toFixed(2)} ${t(($) => $.dashboard.hectares)}`,
							},
							{
								header: t(($) => $.dashboard.producerName),
								accessor: (row) => row.producerName,
							},
						]}
						isLoading={isLoading}
						error={errorMessage}
					/>
					<DashboardDataTable
						title={t(($) => $.dashboard.mostProductiveProducers)}
						data={stats?.topRecords.mostProductiveProducers}
						columns={[
							{
								header: t(($) => $.dashboard.producerName),
								accessor: (row) => row.name,
							},
							{
								header: t(($) => $.dashboard.farmCount),
								accessor: (row) => row.farmCount,
							},
							{
								header: t(($) => $.dashboard.totalAreaOwned),
								accessor: (row) => row.totalArea,
								format: (value) => `${Number(value).toFixed(2)} ${t(($) => $.dashboard.hectares)}`,
							},
						]}
						isLoading={isLoading}
						error={errorMessage}
					/>
				</DashboardGrid>
			</Container>
		</PageContainer>
	);
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.xl};
`;

const PageHeader = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.sm};
`;

const Title = styled.h1`
	font-size: ${(props) => props.theme.typography.fontSize["3xl"]};
	font-weight: ${(props) => props.theme.typography.fontWeight.bold};
	color: ${(props) => props.theme.colors.text};
	margin: 0;
`;

const Subtitle = styled.p`
	font-size: ${(props) => props.theme.typography.fontSize.base};
	color: ${(props) => props.theme.colors.textSecondary};
	margin: 0;
`;

const SectionTitle = styled.h2`
	margin: ${(props) => props.theme.spacing.xl} 0 0 0;
	font-size: ${(props) => props.theme.typography.fontSize.xl};
	font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
	color: ${(props) => props.theme.colors.text};
	border-bottom: 2px solid ${(props) => props.theme.colors.border};
	padding-bottom: ${(props) => props.theme.spacing.sm};
`;
