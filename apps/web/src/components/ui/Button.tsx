import styled from "styled-components";

import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Button variant types following design system hierarchy */
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";

/** Button size options for different contexts */
export type ButtonSize = "sm" | "md" | "lg";

/** Props for the Button component */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/** Visual variant of the button */
	variant?: ButtonVariant;

	/** Size variant of the button */
	size?: ButtonSize;

	/** Whether button is in loading state */
	isLoading?: boolean;

	/** Button content */
	children: ReactNode;
}

/**
 * Accessible button component with multiple variants and states.
 *
 * Built on native HTML button element with styled-components theming.
 * Supports loading states, disabled states, and keyboard navigation.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleSubmit}>
 *   Save Producer
 * </Button>
 *
 * <Button variant="danger" size="sm" isLoading>
 *   Deleting...
 * </Button>
 * ```
 */
export function Button({
	variant = "primary",
	size = "md",
	isLoading = false,
	disabled,
	children,
	...props
}: ButtonProps) {
	return (
		<StyledButton
			variant={variant}
			size={size}
			disabled={disabled ?? isLoading}
			aria-busy={isLoading}
			{...props}
		>
			{isLoading ? "Loading..." : children}
		</StyledButton>
	);
}

const StyledButton = styled.button<{ variant: ButtonVariant; size: ButtonSize }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-family: ${(props) => props.theme.typography.fontFamily.base};
	font-weight: ${(props) => props.theme.typography.fontWeight.medium};
	border-radius: ${(props) => props.theme.borderRadius.md};
	border: none;
	cursor: pointer;
	transition: all 200ms ease;
	white-space: nowrap;

	/* Size variants */
	${(props) => {
		switch (props.size) {
			case "md":
			default: {
				return `
          padding: ${props.theme.spacing.sm} ${props.theme.spacing.lg};
          font-size: ${props.theme.typography.fontSize.base};
          min-height: 40px;
        `;
			}
			case "sm": {
				return `
					padding: ${props.theme.spacing.sm} ${props.theme.spacing.md};
					font-size: ${props.theme.typography.fontSize.sm};
					min-height: 32px;
				`;
			}
			case "lg": {
				return `
					padding: ${props.theme.spacing.md} ${props.theme.spacing.xl};
					font-size: ${props.theme.typography.fontSize.lg};
					min-height: 48px;
				`;
			}
		}
	}}

	/* Variant styles */
	${(props) => {
		switch (props.variant) {
			case "primary": {
				return `
					background-color: ${props.theme.colors.primary};
					color: ${props.theme.colors.background};

					&:hover:not(:disabled) {
						background-color: ${props.theme.colors.primaryDark};
					}

					&:focus-visible {
						outline: 2px solid ${props.theme.colors.primary};
						outline-offset: 2px;
					}
				`;
			}
			case "secondary": {
				return `
					background-color: ${props.theme.colors.secondary};
					color: ${props.theme.colors.background};

					&:hover:not(:disabled) {
						background-color: ${props.theme.colors.secondaryDark};
					}

					&:focus-visible {
						outline: 2px solid ${props.theme.colors.secondary};
						outline-offset: 2px;
					}
				`;
			}
			case "tertiary": {
				return `
					background-color: transparent;
					color: ${props.theme.colors.primary};
					border: 1px solid ${props.theme.colors.border};

					&:hover:not(:disabled) {
						background-color: ${props.theme.colors.backgroundAlt};
					}

					&:focus-visible {
						outline: 2px solid ${props.theme.colors.primary};
						outline-offset: 2px;
					}
				`;
			}
			case "danger": {
				return `
					background-color: ${props.theme.colors.error};
					color: ${props.theme.colors.background};

					&:hover:not(:disabled) {
						background-color: #c62828;
					}

					&:focus-visible {
						outline: 2px solid ${props.theme.colors.error};
						outline-offset: 2px;
					}
				`;
			}
		}
	}}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	&:active:not(:disabled) {
		transform: scale(0.98);
	}
`;
