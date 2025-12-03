import { AlertDialog, Button, Flex } from "@radix-ui/themes";

import type { ReactElement } from "react";

/** Props for the ConfirmDialog component */
export interface ConfirmDialogProps {
	/** Whether dialog is open */
	open: boolean;

	/** Callback when dialog open state changes */
	onOpenChange: (open: boolean) => void;

	/** Dialog title */
	title: string;

	/** Dialog description/message */
	description: string;

	/** Text for the confirm button */
	confirmText?: string;

	/** Text for the cancel button */
	cancelText?: string;

	/** Callback when user confirms */
	onConfirm: () => void;

	/** Whether the action is loading */
	isLoading?: boolean;

	/** Color variant for the confirm button */
	color?: "red" | "blue" | "green";
}

/**
 * Confirmation dialog component built on Radix UI Themes AlertDialog.
 *
 * Provides an accessible way to confirm destructive or important actions
 * with keyboard navigation, focus trapping, and ARIA attributes.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Delete Producer"
 *   description="Are you sure you want to delete this producer? This action cannot be undone."
 *   confirmText="Delete"
 *   cancelText="Cancel"
 *   color="red"
 *   onConfirm={handleDelete}
 *   isLoading={isDeleting}
 * />
 * ```
 */
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmText = "Confirm",
	cancelText = "Cancel",
	onConfirm,
	isLoading = false,
	color = "red",
}: ConfirmDialogProps): ReactElement {
	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	return (
		<AlertDialog.Root open={open} onOpenChange={onOpenChange}>
			<AlertDialog.Content maxWidth="450px">
				<AlertDialog.Title>{title}</AlertDialog.Title>
				<AlertDialog.Description size="2">{description}</AlertDialog.Description>

				<Flex gap="3" mt="4" justify="end">
					<AlertDialog.Cancel>
						<Button variant="soft" color="gray" disabled={isLoading}>
							{cancelText}
						</Button>
					</AlertDialog.Cancel>
					<AlertDialog.Action>
						<Button color={color} onClick={handleConfirm} disabled={isLoading} loading={isLoading}>
							{confirmText}
						</Button>
					</AlertDialog.Action>
				</Flex>
			</AlertDialog.Content>
		</AlertDialog.Root>
	);
}
