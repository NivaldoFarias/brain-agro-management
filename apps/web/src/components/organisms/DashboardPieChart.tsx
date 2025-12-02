import { useTranslation } from "react-i18next";
import { Cell, Legend, Pie, PieChart as RechartPieChart, ResponsiveContainer, Tooltip } from "recharts";
import styled from "styled-components";

import type { ReactElement } from "react";

/** Props for the {@link DashboardPieChart} component */
interface DashboardPieChartProps {
	/** Chart title/label */
	title: string;

	/** Chart data array with required `name` and `value` fields */
	data?: { name: string; value: number; [key: string]: unknown }[];

	/** Loading state indicator */
	isLoading?: boolean;

	/** Error message to display */
	error?: string | null;

	/** Array of colors for pie slices */
	colors?: string[];
}

const DEFAULT_COLORS = ["#10B981", "#F59E0B", "#8B5CF6", "#3B82F6", "#EF4444", "#EC4899"];

/**
 * Displays a responsive pie chart for showing categorical distribution.
 *
 * Used for metrics like crop distribution and land use percentages.
 *
 * @example
 * ```tsx
 * <DashboardPieChart
 *   title="Crop Distribution"
 *   data={[
 *     { name: "soy", value: 45 },
 *     { name: "corn", value: 30 },
 *   ]}
 *   colors={["#10B981", "#F59E0B"]}
 * />
 * ```
 */
export function DashboardPieChart({
	title,
	data,
	isLoading,
	error,
	colors = DEFAULT_COLORS,
}: DashboardPieChartProps): ReactElement {
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
					<RechartPieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							labelLine={false}
							label={renderLabel}
							outerRadius={100}
							fill="#8884d8"
							dataKey="value"
						>
							{data.map((_, index) => (
								<Cell key={`cell-${String(index)}`} fill={colors[index % colors.length]} />
							))}
						</Pie>
						<Tooltip
							formatter={(value) => `${String(value)}${typeof value === "number" ? "%" : ""}`}
							contentStyle={{
								backgroundColor: "#fff",
								border: "1px solid #e7e5e4",
								borderRadius: "8px",
							}}
						/>
						<Legend />
					</RechartPieChart>
				</ResponsiveContainer>
			</ChartContainer>
		</Container>
	);
}

/**
 * Custom label renderer for pie chart slices
 */
function renderLabel({ value }: { name: string; value: number }): string {
	return `${String(value)}%`;
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
