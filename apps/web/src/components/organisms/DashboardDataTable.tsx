import { useTranslation } from "react-i18next";
import styled from "styled-components";

import type { ReactElement } from "react";

/** Props for the {@link DashboardDataTable} component */
interface DashboardDataTableProps<T> {
	/** Table title/heading */
	title: string;

	/** Array of data items to display */
	data?: T[];

	/** Column definitions specifying which fields to display */
	columns: {
		/** Column header label */
		header: string;

		/** Accessor function to get cell value from row data */
		accessor: (row: T) => string | number;

		/** Optional formatter function for cell values */
		format?: (value: string | number) => string;
	}[];

	/** Loading state indicator */
	isLoading?: boolean;

	/** Error message to display */
	error?: string | null;
}

/**
 * Displays tabular data with customizable columns.
 *
 * Used for showing top records like largest farms or most productive producers.
 *
 * @example
 * ```tsx
 * <DashboardDataTable
 *   title="Largest Farms"
 *   data={farms}
 *   columns={[
 *     { header: "Name", accessor: (row) => row.name },
 *     { header: "Area", accessor: (row) => row.totalArea, format: (v) => `${v} ha` }
 *   ]}
 * />
 * ```
 */
export function DashboardDataTable<T>({
	title,
	data,
	columns,
	isLoading,
	error,
}: DashboardDataTableProps<T>): ReactElement {
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
			<TableWrapper>
				<Table>
					<thead>
						<TableRow>
							{columns.map((column, index) => (
								<TableHeader key={index}>{column.header}</TableHeader>
							))}
						</TableRow>
					</thead>
					<tbody>
						{data.map((row, rowIndex) => (
							<TableRow key={rowIndex}>
								{columns.map((column, colIndex) => {
									const value = column.accessor(row);
									const formattedValue = column.format ? column.format(value) : value;
									return <TableCell key={colIndex}>{formattedValue}</TableCell>;
								})}
							</TableRow>
						))}
					</tbody>
				</Table>
			</TableWrapper>
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

const TableWrapper = styled.div`
	overflow-x: auto;
	border-radius: ${(props) => props.theme.borderRadius.md};
	border: 1px solid ${(props) => props.theme.colors.border};
`;

const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
	font-size: ${(props) => props.theme.typography.fontSize.sm};
`;

const TableRow = styled.tr`
	&:not(:last-child) {
		border-bottom: 1px solid ${(props) => props.theme.colors.border};
	}

	tbody &:hover {
		background: ${(props) => props.theme.colors.backgroundAlt};
	}
`;

const TableHeader = styled.th`
	padding: ${(props) => props.theme.spacing.md};
	text-align: left;
	font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
	color: ${(props) => props.theme.colors.text};
	background: ${(props) => props.theme.colors.backgroundAlt};
`;

const TableCell = styled.td`
	padding: ${(props) => props.theme.spacing.md};
	color: ${(props) => props.theme.colors.textSecondary};
`;

const ErrorContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 200px;
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
	min-height: 200px;
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
