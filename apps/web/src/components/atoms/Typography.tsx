import styled from "styled-components";

import type { HTMLAttributes, ReactNode } from "react";
import type React from "react";

/** Typography variant types following design system hierarchy */
export type TypographyVariant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "bodySmall" | "caption" | "label";

/**
 * Props for the Typography component.
 */
export interface TypographyProps extends HTMLAttributes<HTMLElement> {
	/** Typography variant */
	variant?: TypographyVariant;

	/** Text content */
	children: ReactNode;

	/** HTML element to render */
	as?: keyof React.JSX.IntrinsicElements;

	/** Text alignment */
	align?: "left" | "center" | "right";

	/** Text color override */
	color?: string;
}

/**
 * Typography component with consistent text styling.
 *
 * Provides semantic heading and text variants following the design system.
 * Supports custom HTML elements and alignment options.
 *
 * @example
 * ```tsx
 * <Typography variant="h1">Dashboard</Typography>
 * <Typography variant="body">Producer information</Typography>
 * <Typography variant="caption" color="textSecondary">
 *   Last updated 5 minutes ago
 * </Typography>
 * ```
 */
export function Typography({ variant = "body", children, as, align = "left", color, ...props }: TypographyProps) {
	const defaultElement = getDefaultElement(variant);
	const Component = as ?? defaultElement;

	return (
		<StyledText as={Component} variant={variant} align={align} color={color} {...props}>
			{children}
		</StyledText>
	);
}

/**
 * Gets the default HTML element for each typography variant.
 */
function getDefaultElement(variant: TypographyVariant): keyof React.JSX.IntrinsicElements {
	switch (variant) {
		case "h1": {
			return "h1";
		}
		case "h2": {
			return "h2";
		}
		case "h3": {
			return "h3";
		}
		case "h4": {
			return "h4";
		}
		case "h5": {
			return "h5";
		}
		case "h6": {
			return "h6";
		}
		case "label": {
			return "label";
		}
		case "caption": {
			return "span";
		}
		default: {
			return "p";
		}
	}
}

const StyledText = styled.p<{ variant: TypographyVariant; align: string; color?: string }>`
	font-family: ${(props) =>
		props.variant.startsWith("h") ? props.theme.typography.fontFamily.heading : props.theme.typography.fontFamily.base};
	text-align: ${(props) => props.align};
	color: ${(props) =>
		props.color ? props.theme.colors[props.color as keyof typeof props.theme.colors] : props.theme.colors.text};
	margin: 0;

	${(props) => {
		switch (props.variant) {
			case "body":
			default: {
				return `
        font-size: ${props.theme.typography.fontSize.base};
        font-weight: ${props.theme.typography.fontWeight.normal};
        line-height: ${props.theme.typography.lineHeight.normal};
      `;
			}
			case "h1": {
				return `
					font-size: ${props.theme.typography.fontSize["4xl"]};
					font-weight: ${props.theme.typography.fontWeight.bold};
					line-height: ${props.theme.typography.lineHeight.tight};
					margin-bottom: ${props.theme.spacing.lg};
				`;
			}
			case "h2": {
				return `
					font-size: ${props.theme.typography.fontSize["3xl"]};
					font-weight: ${props.theme.typography.fontWeight.bold};
					line-height: ${props.theme.typography.lineHeight.tight};
					margin-bottom: ${props.theme.spacing.md};
				`;
			}
			case "h3": {
				return `
					font-size: ${props.theme.typography.fontSize["2xl"]};
					font-weight: ${props.theme.typography.fontWeight.semibold};
					line-height: ${props.theme.typography.lineHeight.tight};
					margin-bottom: ${props.theme.spacing.md};
				`;
			}
			case "h4": {
				return `
					font-size: ${props.theme.typography.fontSize.xl};
					font-weight: ${props.theme.typography.fontWeight.semibold};
					line-height: ${props.theme.typography.lineHeight.normal};
					margin-bottom: ${props.theme.spacing.sm};
				`;
			}
			case "h5": {
				return `
					font-size: ${props.theme.typography.fontSize.lg};
					font-weight: ${props.theme.typography.fontWeight.medium};
					line-height: ${props.theme.typography.lineHeight.normal};
					margin-bottom: ${props.theme.spacing.sm};
				`;
			}
			case "h6": {
				return `
					font-size: ${props.theme.typography.fontSize.base};
					font-weight: ${props.theme.typography.fontWeight.medium};
					line-height: ${props.theme.typography.lineHeight.normal};
					margin-bottom: ${props.theme.spacing.sm};
				`;
			}
			case "bodySmall": {
				return `
					font-size: ${props.theme.typography.fontSize.sm};
					font-weight: ${props.theme.typography.fontWeight.normal};
					line-height: ${props.theme.typography.lineHeight.normal};
				`;
			}
			case "caption": {
				return `
					font-size: ${props.theme.typography.fontSize.xs};
					font-weight: ${props.theme.typography.fontWeight.normal};
					line-height: ${props.theme.typography.lineHeight.normal};
					color: ${props.theme.colors.textSecondary};
				`;
			}
			case "label": {
				return `
					font-size: ${props.theme.typography.fontSize.sm};
					font-weight: ${props.theme.typography.fontWeight.medium};
					line-height: ${props.theme.typography.lineHeight.normal};
				`;
			}
		}
	}}
`;
