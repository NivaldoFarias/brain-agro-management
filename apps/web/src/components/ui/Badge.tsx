import styled from "styled-components";

import type { HTMLAttributes, ReactNode } from "react";

/** Badge variant types for semantic color coding */
export type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

/** Badge size options */
export type BadgeSize = "sm" | "md" | "lg";

/** Props for the Badge component */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	/** Visual variant of the badge */
	variant?: BadgeVariant;

	/** Size variant of the badge */
	size?: BadgeSize;

	/** Badge content */
	children: ReactNode;
}

/**
 * Accessible badge component for displaying labels, statuses, and categories.
 *
 * Built with styled-components and theme tokens. Supports multiple semantic
 * variants for different status types. Renders as a semantic `<span>` element.
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" size="sm">Pending</Badge>
 * <Badge variant="error">Failed</Badge>
 * ```
 */
export function Badge({ variant = "default", size = "md", children, ...props }: BadgeProps) {
	return (
		<StyledBadge variant={variant} size={size} {...props}>
			{children}
		</StyledBadge>
	);
}

const StyledBadge = styled.span<{ variant: BadgeVariant; size: BadgeSize }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-family: ${(props) => props.theme.typography.fontFamily.base};
	font-weight: ${(props) => props.theme.typography.fontWeight.medium};
	border-radius: ${(props) => props.theme.borderRadius.lg};
	border: none;
	white-space: nowrap;
	user-select: none;

	/* Size variants */
	${(props) => {
		switch (props.size) {
			case "sm": {
				return `
					padding: ${props.theme.spacing.xs} ${props.theme.spacing.sm};
					font-size: ${props.theme.typography.fontSize.xs};
					line-height: ${props.theme.typography.lineHeight.tight};
					min-height: 20px;
				`;
			}
			case "lg": {
				return `
					padding: ${props.theme.spacing.sm} ${props.theme.spacing.lg};
					font-size: ${props.theme.typography.fontSize.base};
					line-height: ${props.theme.typography.lineHeight.normal};
					min-height: 32px;
				`;
			}
			case "md":
			default: {
				return `
					padding: ${props.theme.spacing.xs} ${props.theme.spacing.md};
					font-size: ${props.theme.typography.fontSize.sm};
					line-height: ${props.theme.typography.lineHeight.normal};
					min-height: 24px;
				`;
			}
		}
	}}

	/* Variant colors */
	${(props) => {
		switch (props.variant) {
			case "success": {
				return `
					background-color: #D1FAE5;
					color: #065F46;
				`;
			}
			case "warning": {
				return `
					background-color: #FEF3C7;
					color: #78350F;
				`;
			}
			case "error": {
				return `
					background-color: #FEE2E2;
					color: #7F1D1D;
				`;
			}
			case "info": {
				return `
					background-color: #DBEAFE;
					color: #0C2340;
				`;
			}
			case "default":
			default: {
				return `
					background-color: ${props.theme.colors.grey[200]};
					color: ${props.theme.colors.text};
				`;
			}
		}
	}}
`;
