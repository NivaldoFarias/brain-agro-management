import styled, { keyframes } from "styled-components";

/** Spinner size options */
export type SpinnerSize = "sm" | "md" | "lg";

/** Props for the Spinner component */
export interface SpinnerProps {
	/** Spinner size variant */
	"size"?: SpinnerSize;

	/** Accessible label for screen readers */
	"aria-label"?: string;
}

/**
 * Loading spinner component with size variants.
 *
 * Provides visual loading feedback with accessible labeling.
 * Use during async operations or data fetching.
 *
 * @example
 * ```tsx
 * {isLoading && (
 *   <Spinner size="lg" aria-label="Loading producers" />
 * )}
 * ```
 */
export function Spinner({ size = "md", ...props }: SpinnerProps) {
	return (
		<StyledSpinner size={size} role="status" aria-label={props["aria-label"] ?? "Loading"} aria-live="polite">
			<VisuallyHidden>{props["aria-label"] ?? "Loading"}</VisuallyHidden>
		</StyledSpinner>
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

const StyledSpinner = styled.div<{ size: SpinnerSize }>`
	display: inline-block;
	border: 2px solid ${(props) => props.theme.colors.border};
	border-top-color: ${(props) => props.theme.colors.primary};
	border-radius: ${(props) => props.theme.borderRadius.full};
	animation: ${spin} 600ms linear infinite;

	${(props) => {
		switch (props.size) {
			case "md":
			default: {
				return `
          width: 32px;
          height: 32px;
          border-width: 2px;
        `;
			}
			case "sm": {
				return `
					width: 16px;
					height: 16px;
					border-width: 2px;
				`;
			}
			case "lg": {
				return `
					width: 48px;
					height: 48px;
					border-width: 3px;
				`;
			}
		}
	}}
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
	border-width: 0;
`;
