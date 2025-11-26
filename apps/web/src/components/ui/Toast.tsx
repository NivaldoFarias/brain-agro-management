import * as ToastPrimitive from "@radix-ui/react-toast";
import styled from "styled-components";

import type { ReactNode } from "react";

/** Toast variant types for different notification states */
export type ToastVariant = "success" | "error" | "warning" | "info";

/** Props for the Toast component */
export interface ToastProps {
	/** Whether toast is visible */
	open: boolean;

	/** Callback when toast open state changes */
	onOpenChange: (open: boolean) => void;

	/** Toast title */
	title: string;

	/** Toast description */
	description?: string;

	/** Visual variant */
	variant?: ToastVariant;

	/** Duration in milliseconds before auto-dismiss */
	duration?: number;
}

/**
 * Toast notification component built on Radix UI primitives.
 *
 * Provides accessible notifications with auto-dismiss, action buttons,
 * and swipe-to-dismiss gestures. Supports multiple variants for different
 * notification states.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(true);
 *
 * <Toast
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Producer created"
 *   description="João Silva has been successfully added."
 *   variant="success"
 *   duration={5000}
 * />
 * ```
 */
export function Toast({ open, onOpenChange, title, description, variant = "info", duration = 5000 }: ToastProps) {
	return (
		<ToastPrimitive.Root open={open} onOpenChange={onOpenChange} duration={duration}>
			<StyledToast variant={variant}>
				<StyledTitle>{title}</StyledTitle>
				{description && <StyledDescription>{description}</StyledDescription>}
			</StyledToast>
		</ToastPrimitive.Root>
	);
}

/**
 * Toast provider component that manages toast viewport.
 *
 * Must wrap the application to enable toast notifications.
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({ children }: { children: ReactNode }) {
	return (
		<ToastPrimitive.Provider>
			{children}
			<StyledViewport />
		</ToastPrimitive.Provider>
	);
}

const StyledToast = styled(ToastPrimitive.Toast)<{ variant: ToastVariant }>`
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.sm};
	padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
	border-radius: ${(props) => props.theme.borderRadius.md};
	box-shadow: ${(props) => props.theme.shadows.lg};
	background-color: ${(props) => props.theme.colors.surface};
	border-left: 4px solid;
	min-width: 300px;
	max-width: 500px;
	animation: slideIn 200ms ease-out;

	${(props) => {
		switch (props.variant) {
			case "info":
			default: {
				return `border-color: ${props.theme.colors.info};`;
			}
			case "success": {
				return `border-color: ${props.theme.colors.success};`;
			}
			case "error": {
				return `border-color: ${props.theme.colors.error};`;
			}
			case "warning": {
				return `border-color: ${props.theme.colors.warning};`;
			}
		}
	}}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	&[data-state="closed"] {
		animation: slideOut 200ms ease-in;
	}

	@keyframes slideOut {
		from {
			transform: translateX(0);
			opacity: 1;
		}
		to {
			transform: translateX(100%);
			opacity: 0;
		}
	}
`;

const StyledTitle = styled(ToastPrimitive.Title)`
	font-family: ${(props) => props.theme.typography.fontFamily.base};
	font-size: ${(props) => props.theme.typography.fontSize.base};
	font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
	color: ${(props) => props.theme.colors.text};
	margin: 0;
`;

const StyledDescription = styled(ToastPrimitive.Description)`
	font-family: ${(props) => props.theme.typography.fontFamily.base};
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	color: ${(props) => props.theme.colors.textSecondary};
	margin: 0;
	line-height: ${(props) => props.theme.typography.lineHeight.normal};
`;

const StyledViewport = styled(ToastPrimitive.Viewport)`
	position: fixed;
	top: ${(props) => props.theme.spacing.xl};
	right: ${(props) => props.theme.spacing.xl};
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.md};
	max-width: 100vw;
	margin: 0;
	list-style: none;
	z-index: ${(props) => props.theme.zIndex.toast};
	outline: none;
`;
