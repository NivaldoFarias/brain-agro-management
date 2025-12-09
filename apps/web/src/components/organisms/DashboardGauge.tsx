import { useTranslation } from "react-i18next";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import styled from "styled-components";

import type { ReactElement } from "react";
import type { PieProps } from "recharts";

/** Props for the {@link DashboardGauge} component */
interface DashboardGaugeProps {
	/** Gauge title/label */
	title: string;

	/** Gauge data array with required `name`, `value`, and `color` fields */
	data?: { name: string; value: number; color: string }[];

	/** Loading state indicator */
	isLoading?: boolean;

	/** Error message to display */
	error?: string | null;

	/** Optional Recharts Pie component props overrides */
	overrides?: Partial<PieProps>;
}

/**
 * Displays a circular gauge chart for percentage-based metrics.
 *
 * Used for showing land use efficiency breakdown (arable, vegetation, unused).
 *
 * @example
 * ```tsx
 * <DashboardGauge
 *   title="Land Efficiency"
 *   data={[
 *     { name: "Arable", value: 68, color: "#10B981" },
 *     { name: "Vegetation", value: 22, color: "#F59E0B" },
 *     { name: "Unused", value: 10, color: "#EF4444" }
 *   ]}
 * />
 * ```
 */
export function DashboardGauge({ title, data, isLoading, error, overrides }: DashboardGaugeProps): ReactElement {
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
					<PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={90}
							dataKey="value"
							label={({ name, value }: { name: string; value: number }) => `${name}: ${value.toFixed(1)}%`}
							labelLine={false}
							style={{ fontSize: "11px" }}
							{...(overrides as unknown as Record<string, unknown>)}
						>
							{data.map((entry, index) => (
								<Cell key={`cell-${String(index)}`} fill={entry.color} />
							))}
						</Pie>
						<Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
						<Legend />
					</PieChart>
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
