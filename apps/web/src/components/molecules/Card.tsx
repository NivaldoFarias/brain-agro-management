import styled from "styled-components";

import type { HTMLAttributes, ReactNode } from "react";

/** Props for the Card component */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	/** Card content */
	children: ReactNode;

	/** Whether card has padding */
	padding?: "none" | "sm" | "md" | "lg";

	/** Whether card has hover effect */
	hoverable?: boolean;
}

/**
 * Container card component with consistent styling and elevation.
 *
 * Provides surface container with shadow, border, and optional hover effects.
 * Use for grouping related content and creating visual hierarchy.
 *
 * @example
 * ```tsx
 * <Card padding="md" hoverable>
 *   <Typography variant="h3">Producer Details</Typography>
 *   <Typography variant="body">João Silva</Typography>
 * </Card>
 * ```
 */
export function Card({ children, padding = "md", hoverable = false, ...props }: CardProps) {
	return (
		<StyledCard padding={padding} hoverable={hoverable} {...props}>
			{children}
		</StyledCard>
	);
}

const StyledCard = styled.div<{ padding: "none" | "sm" | "md" | "lg"; hoverable: boolean }>`
	background-color: ${(props) => props.theme.colors.surface};
	border: 1px solid ${(props) => props.theme.colors.border};
	border-radius: ${(props) => props.theme.borderRadius.lg};
	box-shadow: ${(props) => props.theme.shadows.sm};
	transition: all ${(props) => props.theme.transitions.base};

	${(props) => {
		switch (props.padding) {
			case "md":
			default: {
				return `padding: ${props.theme.spacing.md};`;
			}
			case "none": {
				return "padding: 0;";
			}
			case "sm": {
				return `padding: ${props.theme.spacing.sm};`;
			}
			case "lg": {
				return `padding: ${props.theme.spacing.xl};`;
			}
		}
	}}

	${(props) =>
		props.hoverable &&
		`
		cursor: pointer;

		&:hover {
			box-shadow: ${props.theme.shadows.md};
			transform: translateY(-2px);
		}
	`}
`;
