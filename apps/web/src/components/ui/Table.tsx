import styled from "styled-components";

import type { ReactNode } from "react";

/** Props for the Table component */
export interface TableProps {
/** Table content (TableHead, TableBody) */
children: ReactNode;

/** Whether table should be full width */
fullWidth?: boolean;
}

/**
 * Responsive table component with consistent styling.
 *
 * Provides a styled table with proper spacing, borders, and hover effects.
 * Should be used with TableHead, TableBody, TableRow, TableHeader, TableCell.
 *
 * @example
 * ```tsx
 * <Table>
 *   <TableHead>
 *     <TableRow>
 *       <TableHeader>Name</TableHeader>
 *       <TableHeader>Document</TableHeader>
 *     </TableRow>
 *   </TableHead>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>João Silva</TableCell>
 *       <TableCell>123.456.789-00</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */
export function Table({ children, fullWidth = false }: TableProps) {
return <StyledTable $fullWidth={fullWidth}>{children}</StyledTable>;
}

/** Table head section */
export function TableHead({ children }: { children: ReactNode }) {
return <StyledTableHead>{children}</StyledTableHead>;
}

/** Table body section */
export function TableBody({ children }: { children: ReactNode }) {
return <StyledTableBody>{children}</StyledTableBody>;
}

/** Table row */
export function TableRow({ children }: { children: ReactNode }) {
return <StyledTableRow>{children}</StyledTableRow>;
}

/** Table header cell */
export function TableHeader({ children }: { children: ReactNode }) {
return <StyledTableHeader>{children}</StyledTableHeader>;
}

/** Table data cell */
export function TableCell({ children }: { children: ReactNode }) {
return <StyledTableCell>{children}</StyledTableCell>;
}

const StyledTable = styled.table<{ $fullWidth: boolean }>`
width: ${(props) => (props.$fullWidth ? "100%" : "auto")};
border-collapse: collapse;
border-spacing: 0;
background-color: ${(props) => props.theme.colors.surface};
border-radius: ${(props) => props.theme.borderRadius.md};
overflow: hidden;
box-shadow: ${(props) => props.theme.shadows.sm};
`;

const StyledTableHead = styled.thead`
background-color: ${(props) => props.theme.colors.backgroundAlt};
border-bottom: 2px solid ${(props) => props.theme.colors.border};
`;

const StyledTableBody = styled.tbody`
background-color: ${(props) => props.theme.colors.surface};
`;

const StyledTableRow = styled.tr`
border-bottom: 1px solid ${(props) => props.theme.colors.borderLight};
transition: background-color ${(props) => props.theme.transitions.fast};

&:last-child {
border-bottom: none;
}

tbody &:hover {
background-color: ${(props) => props.theme.colors.backgroundAlt};
}
`;

const StyledTableHeader = styled.th`
padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
text-align: left;
font-family: ${(props) => props.theme.typography.fontFamily.base};
font-size: ${(props) => props.theme.typography.fontSize.sm};
font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
color: ${(props) => props.theme.colors.textSecondary};
text-transform: uppercase;
letter-spacing: 0.05em;
`;

const StyledTableCell = styled.td`
padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
font-family: ${(props) => props.theme.typography.fontFamily.base};
font-size: ${(props) => props.theme.typography.fontSize.base};
color: ${(props) => props.theme.colors.text};
`;
