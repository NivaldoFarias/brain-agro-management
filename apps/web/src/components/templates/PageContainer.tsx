import styled from "styled-components";

import type { ReactNode } from "react";

/**
 * Props for PageContainer component.
 */
interface PageContainerProps {
	children: ReactNode;
	maxWidth?: string;
}

/**
 * Consistent page container wrapper for all pages.
 *
 * Provides consistent padding and max-width across all pages in the application.
 * Use this as the root container for every page component.
 *
 * @example
 * ```tsx
 * export function DashboardPage() {
 *   return (
 *     <PageContainer>
 *       <h1>Dashboard</h1>
 *       // page content
 *     </PageContainer>
 *   );
 * }
 * ```
 */
export function PageContainer({ children, maxWidth = "1400px" }: PageContainerProps) {
	return <Container $maxWidth={maxWidth}>{children}</Container>;
}

const Container = styled.div<{ $maxWidth: string }>`
	padding: ${(props) => props.theme.spacing.xl};
	max-width: ${(props) => props.$maxWidth};
	width: 100%;
	margin: 0 auto;

	@media (max-width: ${(props) => props.theme.breakpoints.md}) {
		padding: ${(props) => props.theme.spacing.lg};
	}

	@media (max-width: ${(props) => props.theme.breakpoints.sm}) {
		padding: ${(props) => props.theme.spacing.md};
	}
`;
