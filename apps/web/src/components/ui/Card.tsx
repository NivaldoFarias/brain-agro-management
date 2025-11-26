import styled from "styled-components";

import type { HTMLAttributes, ReactNode } from "react";

/** Props for the Card component */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	/** Card content */
	children: ReactNode;

	/** Card padding variant */
	padding?: "none" | "sm" | "md" | "lg";

	/** Whether card is interactive (hover effect) */
	interactive?: boolean;
}

/**
 * Container component for grouping related content.
 *
 * Provides elevation, border radius, and consistent spacing.
 * Supports interactive variant for clickable cards.
 *
 * @example
 * ```tsx
 * <Card padding="md">
 *   <h2>Producer Information</h2>
 *   <p>Details...</p>
 * </Card>
 * ```
 */
export function Card({ children, padding = "md", interactive = false, ...props }: CardProps) {
	return (
		<StyledCard $padding={padding} $interactive={interactive} {...props}>
			{children}
		</StyledCard>
	);
}

const paddingMap = {
	none: "0",
	sm: "12px",
	md: "16px",
	lg: "24px",
};

const StyledCard = styled.div<{ $padding: CardProps["padding"]; $interactive: boolean }>`
	padding: ${(props) => paddingMap[props.$padding ?? "md"]};
	background-color: ${(props) => props.theme.colors.surface};
	border: 1px solid ${(props) => props.theme.colors.border};
	border-radius: ${(props) => props.theme.borderRadius.xl};
	box-shadow: ${(props) => props.theme.shadows.base};
	transition: all ${(props) => props.theme.transitions.base};
	backdrop-filter: blur(10px);

	${(props) =>
		props.$interactive &&
		`
		cursor: pointer;
		
		&:hover {
			box-shadow: ${props.theme.shadows.lg};
			border-color: ${props.theme.colors.primary};
			transform: translateY(-2px);
		}
		
		&:active {
			transform: translateY(0);
			box-shadow: ${props.theme.shadows.md};
		}
	`}
`;
