import { useTranslation } from "react-i18next";
import styled from "styled-components";

import type { ReactElement } from "react";

import { DashboardBarChart } from "@/components/organisms/DashboardBarChart";
import { DashboardGrid } from "@/components/organisms/DashboardGrid";
import { DashboardPieChart } from "@/components/organisms/DashboardPieChart";
import { DashboardStatCard } from "@/components/organisms/DashboardStatCard";
import { PageContainer } from "@/components/templates/PageContainer";
import { AreaIcon, FarmIcon } from "@/components/ui/Icon";
import {
	useGetCropDistributionQuery,
	useGetLandUseStatsQuery,
	useGetStateDistributionQuery,
	useGetTotalAreaStatsQuery,
	useGetTotalFarmsCountQuery,
} from "@/store/api/dashboardApi";

/**
 * Dashboard page component displaying agricultural analytics.
 *
 * Shows total metrics, state distribution, crop distribution,
 * and land use statistics for all registered farms.
 */
export function DashboardPage(): ReactElement {
	const { t } = useTranslation();

	const { data: totalAreaStats } = useGetTotalAreaStatsQuery(undefined);
	const { data: totalFarmsCount } = useGetTotalFarmsCountQuery(undefined);
	const {
		data: stateDistribution,
		isLoading: isLoadingState,
		error: errorState,
	} = useGetStateDistributionQuery(undefined);
	const {
		data: cropDistribution,
		isLoading: isLoadingCrops,
		error: errorCrops,
	} = useGetCropDistributionQuery(undefined);
	const { data: landUseStats, isLoading: isLoadingLandUse, error: errorLandUse } = useGetLandUseStatsQuery(undefined);

	/** Transformed state distribution data for bar chart */
	const stateChartData =
		stateDistribution?.map((item) => ({
			name: t(($) => $.states[item.state]),
			value: item.count,
		})) ?? [];

	/** Transformed crop distribution data for pie chart */
	const totalCrops = cropDistribution?.reduce((sum, item) => sum + item.count, 0) ?? 0;
	const cropChartData =
		cropDistribution?.map((item) => ({
			name: t(($) => $.crops[item.cropType]),
			value: totalCrops > 0 ? Math.round((item.count / totalCrops) * 100) : 0,
		})) ?? [];

	/** Transformed land use data for pie chart */
	const totalLand = landUseStats ? landUseStats.arableArea + landUseStats.vegetationArea : 0;
	const landUseChartData =
		landUseStats ?
			[
				{
					name: t(($) => $.dashboard.arable),
					value: Math.round((landUseStats.arableArea / totalLand) * 100),
				},
				{
					name: t(($) => $.dashboard.vegetation),
					value: Math.round((landUseStats.vegetationArea / totalLand) * 100),
				},
			]
		:	[];

	return (
		<PageContainer>
			<Container>
				<PageHeader>
					<Title>{t(($) => $.dashboard.title)}</Title>
					<Subtitle>{t(($) => $.dashboard.subtitle)}</Subtitle>
				</PageHeader>

				{/* Stats Cards */}
				<DashboardGrid columns={2}>
					<DashboardStatCard
						label={t(($) => $.dashboard.totalFarms)}
						value={totalFarmsCount ?? 0}
						icon={<FarmIcon size={24} />}
						variant="success"
					/>
					<DashboardStatCard
						label={t(($) => $.dashboard.totalArea)}
						value={totalAreaStats?.toFixed(2) ?? "0"}
						unit="ha"
						icon={<AreaIcon size={24} />}
						variant="info"
					/>
				</DashboardGrid>

				{/* Charts */}
				<ChartsSection>
					<DashboardGrid columns={2}>
						<DashboardBarChart
							title={t(($) => $.dashboard.farmsByState)}
							data={stateChartData}
							isLoading={isLoadingState}
							error={errorState ? t(($) => $.common.error) : null}
						/>
						<DashboardPieChart
							title={t(($) => $.dashboard.cropsDistribution)}
							data={cropChartData}
							isLoading={isLoadingCrops}
							error={errorCrops ? t(($) => $.common.error) : null}
						/>
					</DashboardGrid>

					<DashboardGrid>
						<DashboardPieChart
							title={t(($) => $.dashboard.landUseDistribution)}
							data={landUseChartData}
							isLoading={isLoadingLandUse}
							error={errorLandUse ? t(($) => $.common.error) : null}
							colors={["#10B981", "#F59E0B"]}
						/>
					</DashboardGrid>
				</ChartsSection>
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

const ChartsSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.xl};
`;
