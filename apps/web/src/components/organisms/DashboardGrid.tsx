import styled from "styled-components";

import type { ReactElement, ReactNode } from "react";

/** Props for the DashboardGrid component */
interface DashboardGridProps {
	/** Grid children (dashboard items) */
	children: ReactNode;

	/**
	 * Number of columns for large screens
	 *
	 * @default 2
	 */
	columns?: 1 | 2 | 3 | 4;
}

/**
 * Responsive grid layout for dashboard components.
 *
 * Automatically adjusts column count based on screen size.
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: configurable (default 2)
 *
 * @example
 * ```tsx
 * <DashboardGrid columns={3}>
 *   <DashboardStatCard {...} />
 *   <DashboardBarChart {...} />
 *   <DashboardPieChart {...} />
 * </DashboardGrid>
 * ```
 */
export function DashboardGrid({ children, columns = 2 }: DashboardGridProps): ReactElement {
	return <Grid $columns={columns}>{children}</Grid>;
}

const Grid = styled.div<{ $columns: number }>`
	display: grid;
	grid-template-columns: repeat(${(props) => props.$columns}, 1fr);
	gap: ${(props) => props.theme.spacing.xl};

	@media (max-width: ${(props) => props.theme.breakpoints.lg}) {
		grid-template-columns: repeat(2, 1fr);
	}

	@media (max-width: ${(props) => props.theme.breakpoints.md}) {
		grid-template-columns: 1fr;
		gap: ${(props) => props.theme.spacing.lg};
	}
`;
