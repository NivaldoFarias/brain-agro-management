import * as ToastPrimitive from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useState } from "react";
import { keyframes, styled } from "styled-components";

import type { ReactElement, ReactNode } from "react";

/** Toast variant types for different message types */
export type ToastVariant = "success" | "error" | "warning" | "info";

/** Toast message interface */
interface ToastMessage {
	id: string;
	title: string;
	description?: string;
	variant: ToastVariant;
	duration?: number;
}

/** Toast context value interface */
interface ToastContextValue {
	showToast: (message: Omit<ToastMessage, "id">) => void;
	success: (title: string, description?: string) => void;
	error: (title: string, description?: string) => void;
	warning: (title: string, description?: string) => void;
	info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/** Props for ToastProvider component */
interface ToastProviderProps {
	children: ReactNode;
}

/**
 * Toast provider component.
 *
 * Manages toast notifications state and provides functions to show toasts.
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({ children }: ToastProviderProps): ReactElement {
	const [toasts, setToasts] = useState<ToastMessage[]>([]);

	const showToast = useCallback(({ title, description, variant, duration = 5000 }: Omit<ToastMessage, "id">) => {
		const id = `toast-${Date.now()}-${Math.random()}`;
		setToasts((prev) => [...prev, { id, title, description, variant, duration }]);

		// Auto-remove after duration
		setTimeout(() => {
			setToasts((prev) => prev.filter((toast) => toast.id !== id));
		}, duration);
	}, []);

	const success = useCallback(
		(title: string, description?: string) => {
			showToast({ title, description, variant: "success" });
		},
		[showToast],
	);

	const error = useCallback(
		(title: string, description?: string) => {
			showToast({ title, description, variant: "error" });
		},
		[showToast],
	);

	const warning = useCallback(
		(title: string, description?: string) => {
			showToast({ title, description, variant: "warning" });
		},
		[showToast],
	);

	const info = useCallback(
		(title: string, description?: string) => {
			showToast({ title, description, variant: "info" });
		},
		[showToast],
	);

	const value: ToastContextValue = {
		showToast,
		success,
		error,
		warning,
		info,
	};

	return (
		<ToastContext.Provider value={value}>
			{children}
			<ToastPrimitive.Provider swipeDirection="right">
				{toasts.map((toast) => (
					<ToastPrimitive.Root key={toast.id} duration={toast.duration}>
						<ToastContainer variant={toast.variant}>
							<ToastContent>
								<ToastTitle>{toast.title}</ToastTitle>
								{toast.description && <ToastDescription>{toast.description}</ToastDescription>}
							</ToastContent>
							<ToastPrimitive.Close asChild>
								<CloseButton aria-label="Close">×</CloseButton>
							</ToastPrimitive.Close>
						</ToastContainer>
					</ToastPrimitive.Root>
				))}
				<ToastViewport />
			</ToastPrimitive.Provider>
		</ToastContext.Provider>
	);
}

/**
 * Custom hook to access toast context.
 *
 * @throws {Error} If used outside ToastProvider
 *
 * @example
 * ```tsx
 * const toast = useToast();
 * toast.success("Producer created successfully!");
 * toast.error("Failed to delete producer");
 * ```
 */
export function useToast(): ToastContextValue {
	const context = useContext(ToastContext);

	if (context === undefined) {
		throw new Error("useToast must be used within ToastProvider");
	}

	return context;
}

// Animations
const slideIn = keyframes`
  from {
    transform: translateX(calc(100% + 25px));
  }
  to {
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(100% + 25px));
  }
`;

const swipeOut = keyframes`
  from {
    transform: translateX(var(--radix-toast-swipe-end-x));
  }
  to {
    transform: translateX(calc(100% + 25px));
  }
`;

const ToastViewport = styled(ToastPrimitive.Viewport)`
	position: fixed;
	bottom: 0;
	right: 0;
	display: flex;
	flex-direction: column;
	padding: ${(props) => props.theme.spacing.xl};
	gap: ${(props) => props.theme.spacing.md};
	width: 390px;
	max-width: 100vw;
	margin: 0;
	list-style: none;
	z-index: ${(props) => props.theme.zIndex.toast};
	outline: none;

	@media (max-width: ${(props) => props.theme.breakpoints.sm}) {
		width: 100%;
		padding: ${(props) => props.theme.spacing.md};
	}
`;

const ToastContainer = styled.div<{ variant: ToastVariant }>`
	background-color: ${(props) => props.theme.colors.surface};
	border-radius: ${(props) => props.theme.borderRadius.lg};
	box-shadow: ${(props) => props.theme.shadows.lg};
	padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
	display: flex;
	align-items: flex-start;
	gap: ${(props) => props.theme.spacing.md};
	min-height: 60px;
	border-left: 3px solid;
	border-left-color: ${(props) => {
		switch (props.variant) {
			case "success": {
				return props.theme.colors.success;
			}
			case "error": {
				return props.theme.colors.error;
			}
			case "warning": {
				return props.theme.colors.warning;
			}
			case "info": {
				return props.theme.colors.info;
			}
		}
	}};

	&[data-state="open"] {
		animation: ${slideIn} 150ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	&[data-state="closed"] {
		animation: ${slideOut} 100ms ease-in;
	}

	&[data-swipe="move"] {
		transform: translateX(var(--radix-toast-swipe-move-x));
	}

	&[data-swipe="cancel"] {
		transform: translateX(0);
		transition: transform 200ms ease-out;
	}

	&[data-swipe="end"] {
		animation: ${swipeOut} 100ms ease-out;
	}
`;

const ToastContent = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.xs};
	min-width: 0;
`;

const ToastTitle = styled(ToastPrimitive.Title)`
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	font-weight: ${(props) => props.theme.typography.fontWeight.medium};
	color: ${(props) => props.theme.colors.text};
	margin: 0;
	line-height: ${(props) => props.theme.typography.lineHeight.tight};
`;

const ToastDescription = styled(ToastPrimitive.Description)`
	font-size: ${(props) => props.theme.typography.fontSize.xs};
	color: ${(props) => props.theme.colors.textSecondary};
	margin: 0;
	line-height: ${(props) => props.theme.typography.lineHeight.normal};
`;

const CloseButton = styled.button`
	all: unset;
	font-size: ${(props) => props.theme.typography.fontSize.xl};
	color: ${(props) => props.theme.colors.textSecondary};
	cursor: pointer;
	line-height: 1;
	width: 20px;
	height: 20px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: ${(props) => props.theme.borderRadius.base};
	transition: all ${(props) => props.theme.transitions.fast};

	&:hover {
		background-color: ${(props) => props.theme.colors.backgroundAlt};
		color: ${(props) => props.theme.colors.text};
	}

	&:focus-visible {
		outline: 2px solid ${(props) => props.theme.colors.primary};
		outline-offset: 2px;
	}
`;
