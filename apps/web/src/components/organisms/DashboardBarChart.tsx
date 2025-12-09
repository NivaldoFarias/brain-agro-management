import { useTranslation } from "react-i18next";
import {
	Bar,
	CartesianGrid,
	Legend,
	BarChart as RechartBarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import styled from "styled-components";

import type { ReactElement } from "react";
import type { BarProps, XAxisProps, YAxisProps } from "recharts";

/** Props for the {@link DashboardBarChart} component */
interface DashboardBarChartProps {
	/** Chart title/label */
	title: string;

	/** Chart data array with required `name` and `value` fields */
	data?: { name: string; value: number; [key: string]: unknown }[];

	/** Loading state indicator */
	isLoading?: boolean;

	/** Error message to display */
	error?: string | null;

	/** Optional Recharts Bar Chart component props overrides */
	overrides?: {
		bar?: Partial<BarProps>;
		xAxis?: Partial<XAxisProps>;
		yAxis?: Partial<YAxisProps>;
	};
}

/**
 * Displays a responsive bar chart for comparing categorical data.
 *
 * Used for metrics like farms by state distribution.
 *
 * @example
 * ```tsx
 * <DashboardBarChart
 *   title="Farms by State"
 *   data={[
 *     { name: "SP", value: 10 },
 *     { name: "MG", value: 8 },
 *   ]}
 * />
 * ```
 */
export function DashboardBarChart({ title, data, isLoading, error, overrides }: DashboardBarChartProps): ReactElement {
	const { t } = useTranslation();

	if (error) {
		return <ErrorContainer>{error}</ErrorContainer>;
	}

	if (isLoading) {
		return <SkeletonContainer />;
	}

	if (!data || data.length === 0) {
		return <EmptyContainer>{t(($) => $.common.noData)}</EmptyContainer>;
	}

	return (
		<Container>
			<Title>{title}</Title>
			<ChartContainer>
				<ResponsiveContainer width="100%" height={300}>
					<RechartBarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
						<XAxis
							dataKey="name"
							angle={-45}
							textAnchor="end"
							height={100}
							style={{ fontSize: "11px" }}
							{...(overrides?.xAxis as unknown as Record<string, unknown>)}
						/>
						<YAxis {...(overrides?.yAxis as unknown as Record<string, unknown>)} />
						<Tooltip
							contentStyle={{
								backgroundColor: "#fff",
								border: "1px solid #e7e5e4",
								borderRadius: "8px",
							}}
						/>
						<Legend />
						<Bar
							dataKey="value"
							fill="#10B981"
							name={t(($) => $.farms.title)}
							radius={[8, 8, 0, 0]}
							label={{ position: "top", fontSize: 10 }}
							{...(overrides?.bar as unknown as Record<string, unknown>)}
						/>
					</RechartBarChart>
				</ResponsiveContainer>
			</ChartContainer>
		</Container>
	);
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.lg};
	padding: ${(props) => props.theme.spacing.xl};
	background: ${(props) => props.theme.colors.surface};
	border: 1px solid ${(props) => props.theme.colors.border};
	border-radius: ${(props) => props.theme.borderRadius.lg};
	box-shadow: ${(props) => props.theme.shadows.sm};
`;

const Title = styled.h3`
	margin: 0;
	font-size: ${(props) => props.theme.typography.fontSize.lg};
	font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
	color: ${(props) => props.theme.colors.text};
`;

const ChartContainer = styled.div`
	width: 100%;
	height: 350px;
`;

const ErrorContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 300px;
	padding: ${(props) => props.theme.spacing.xl};
	background: ${(props) => props.theme.colors.surface};
	border: 1px solid ${(props) => props.theme.colors.error};
	border-radius: ${(props) => props.theme.borderRadius.lg};
	color: ${(props) => props.theme.colors.error};
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	text-align: center;
`;

const EmptyContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 300px;
	padding: ${(props) => props.theme.spacing.xl};
	background: ${(props) => props.theme.colors.surface};
	border: 1px dashed ${(props) => props.theme.colors.border};
	border-radius: ${(props) => props.theme.borderRadius.lg};
	color: ${(props) => props.theme.colors.textSecondary};
	font-size: ${(props) => props.theme.typography.fontSize.sm};
`;

const SkeletonContainer = styled(EmptyContainer)`
	background: linear-gradient(
		90deg,
		${(props) => props.theme.colors.backgroundAlt} 25%,
		${(props) => props.theme.colors.surface} 50%,
		${(props) => props.theme.colors.backgroundAlt} 75%
	);
	background-size: 200% 100%;
	animation: shimmer 2s infinite;

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
`;
