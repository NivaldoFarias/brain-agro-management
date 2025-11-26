import styled from "styled-components";

import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Button variant types following design system hierarchy */
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";

/** Button size options for different contexts */
export type ButtonSize = "small" | "sm" | "md" | "lg";

/** Props for the Button component */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/** Visual variant of the button */
	variant?: ButtonVariant;

	/** Size variant of the button */
	size?: ButtonSize;

	/** Whether button is in loading state */
	isLoading?: boolean;

	/** Whether button should take full width */
	fullWidth?: boolean;

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
	fullWidth = false,
	disabled,
	children,
	...props
}: ButtonProps) {
	return (
		<StyledButton
			variant={variant}
			size={size}
			$fullWidth={fullWidth}
			disabled={disabled ?? isLoading}
			aria-busy={isLoading}
			{...props}
		>
			{isLoading ? "Loading..." : children}
		</StyledButton>
	);
}

const StyledButton = styled.button<{ variant: ButtonVariant; size: ButtonSize; $fullWidth: boolean }>`
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
	width: ${(props) => (props.$fullWidth ? "100%" : "auto")};

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
			case "small":
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
					background: linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.primaryDark});
					color: white;
					box-shadow: ${props.theme.shadows.sm};
					border: 1px solid transparent;

					&:hover:not(:disabled) {
						background: linear-gradient(135deg, ${props.theme.colors.primaryDark}, ${props.theme.colors.primary});
						box-shadow: ${props.theme.shadows.md};
						transform: translateY(-1px);
					}

					&:active:not(:disabled) {
						transform: translateY(0);
						box-shadow: ${props.theme.shadows.sm};
					}

					&:focus-visible {
						outline: 2px solid ${props.theme.colors.primary};
						outline-offset: 2px;
					}
				`;
			}
			case "secondary": {
				return `
					background: ${props.theme.colors.secondary};
					color: white;
					box-shadow: ${props.theme.shadows.sm};

					&:hover:not(:disabled) {
						background: ${props.theme.colors.secondaryDark};
						box-shadow: ${props.theme.shadows.md};
						transform: translateY(-1px);
					}

					&:active:not(:disabled) {
						transform: translateY(0);
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
					border: 1.5px solid ${props.theme.colors.border};

					&:hover:not(:disabled) {
						background-color: ${props.theme.colors.backgroundAlt};
						border-color: ${props.theme.colors.primary};
					}

					&:focus-visible {
						outline: 2px solid ${props.theme.colors.primary};
						outline-offset: 2px;
					}
				`;
			}
			case "danger": {
				return `
					background: ${props.theme.colors.error};
					color: white;
					box-shadow: ${props.theme.shadows.sm};

					&:hover:not(:disabled) {
						background: #DC2626;
						box-shadow: ${props.theme.shadows.md};
						transform: translateY(-1px);
					}

					&:active:not(:disabled) {
						transform: translateY(0);
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
		transform: none !important;
	}
`;
