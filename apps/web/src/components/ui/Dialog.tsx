import * as DialogPrimitive from "@radix-ui/react-dialog";
import styled from "styled-components";

import type { ReactNode } from "react";

/** Props for the Dialog component */
export interface DialogProps {
	/** Whether dialog is open */
	open: boolean;

	/** Callback when dialog open state changes */
	onOpenChange: (open: boolean) => void;

	/** Dialog title */
	title: string;

	/** Dialog description */
	description?: string;

	/** Dialog content */
	children: ReactNode;

	/** Trigger element (optional, dialog can be controlled externally) */
	trigger?: ReactNode;
}

/**
 * Accessible modal dialog component built on Radix UI primitives.
 *
 * Provides keyboard navigation, focus trapping, and ARIA attributes
 * out of the box. Supports controlled and uncontrolled modes.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <Dialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Delete Producer"
 *   description="This action cannot be undone."
 *   trigger={<Button variant="danger">Delete</Button>}
 * >
 *   <p>Are you sure you want to delete this producer?</p>
 *   <Button onClick={() => setOpen(false)}>Cancel</Button>
 *   <Button variant="danger" onClick={handleDelete}>Delete</Button>
 * </Dialog>
 * ```
 */
export function Dialog({ open, onOpenChange, title, description, children, trigger }: DialogProps) {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			{trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
			<DialogPrimitive.Portal>
				<StyledOverlay />
				<StyledContent>
					<StyledTitle>{title}</StyledTitle>
					{description && <StyledDescription>{description}</StyledDescription>}
					{children}
				</StyledContent>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

const StyledOverlay = styled(DialogPrimitive.Overlay)`
	position: fixed;
	inset: 0;
	background-color: rgba(0, 0, 0, 0.5);
	animation: fadeIn 200ms ease-out;

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
`;

const StyledContent = styled(DialogPrimitive.Content)`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: ${(props) => props.theme.colors.surface};
	border-radius: ${(props) => props.theme.borderRadius.lg};
	box-shadow: ${(props) => props.theme.shadows.lg};
	padding: ${(props) => props.theme.spacing.xl};
	max-width: 500px;
	width: 90vw;
	max-height: 85vh;
	overflow-y: auto;
	animation: slideIn 200ms ease-out;

	&:focus {
		outline: none;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translate(-50%, -48%) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}
`;

const StyledTitle = styled(DialogPrimitive.Title)`
	font-family: ${(props) => props.theme.typography.fontFamily.heading};
	font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
	font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
	color: ${(props) => props.theme.colors.text};
	margin: 0 0 ${(props) => props.theme.spacing.md} 0;
`;

const StyledDescription = styled(DialogPrimitive.Description)`
	font-family: ${(props) => props.theme.typography.fontFamily.base};
	font-size: ${(props) => props.theme.typography.fontSize.base};
	color: ${(props) => props.theme.colors.textSecondary};
	margin: 0 0 ${(props) => props.theme.spacing.lg} 0;
	line-height: ${(props) => props.theme.typography.lineHeight.normal};
`;
