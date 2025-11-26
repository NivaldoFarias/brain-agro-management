import styled, { keyframes } from "styled-components";

import type { HTMLAttributes } from "react";

/** Props for the Spinner component */
export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
	/** Size of the spinner */
	size?: "sm" | "md" | "lg";

	/** Color variant */
	variant?: "primary" | "secondary" | "white";
}

/**
 * Loading spinner component for async operations.
 *
 * Provides visual feedback during data fetching or processing.
 * Automatically handles accessibility with aria-label.
 *
 * @example
 * ```tsx
 * <Spinner size="md" variant="primary" />
 * ```
 */
export function Spinner({ size = "md", variant = "primary", ...props }: SpinnerProps) {
	return (
		<SpinnerContainer aria-label="Loading" role="status" {...props}>
			<SpinnerElement $size={size} $variant={variant} />
			<VisuallyHidden>Loading...</VisuallyHidden>
		</SpinnerContainer>
	);
}

const spin = keyframes`
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
`;

const sizeMap = {
	sm: "16px",
	md: "24px",
	lg: "40px",
};

const borderWidthMap = {
	sm: "2px",
	md: "3px",
	lg: "4px",
};

const SpinnerContainer = styled.div`
	display: inline-flex;
	align-items: center;
	justify-content: center;
`;

const SpinnerElement = styled.div<{ $size: SpinnerProps["size"]; $variant: SpinnerProps["variant"] }>`
	width: ${(props) => sizeMap[props.$size ?? "md"]};
	height: ${(props) => sizeMap[props.$size ?? "md"]};
	border: ${(props) => borderWidthMap[props.$size ?? "md"]} solid;
	border-color: ${(props) => {
		switch (props.$variant) {
			case "white": {
				return "rgba(255, 255, 255, 0.2)";
			}
			case "secondary": {
				return props.theme.colors.secondaryLight;
			}
			default: {
				return props.theme.colors.primaryLight;
			}
		}
	}};
	border-top-color: ${(props) => {
		switch (props.$variant) {
			case "white": {
				return "#ffffff";
			}
			case "secondary": {
				return props.theme.colors.secondary;
			}
			default: {
				return props.theme.colors.primary;
			}
		}
	}};
	border-radius: 50%;
	animation: ${spin} 0.6s linear infinite;
`;

const VisuallyHidden = styled.span`
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
`;
