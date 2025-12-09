import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { ReactElement } from "react";

import type { CreateProducerFormData } from "@/schemas";

import { createProducerSchema } from "@/schemas";

/** Props for the ProducerForm component */
export interface ProducerFormProps {
	/** Callback when form is successfully submitted */
	onSubmit: (data: CreateProducerFormData) => void | Promise<void>;

	/** Whether the form is in loading/submitting state */
	isLoading?: boolean;

	/** Initial form values for editing */
	defaultValues?: Partial<CreateProducerFormData>;
}

/**
 * Form component for creating and editing producers.
 *
 * Integrates react-hook-form with Zod validation for type-safe form handling.
 * Validates CPF/CNPJ documents using Brazilian government algorithms.
 *
 * @example
 * ```tsx
 * const [createProducer] = useCreateProducerMutation();
 *
 * <ProducerForm
 *   onSubmit={async (data) => {
 *     await createProducer(data).unwrap();
 *   }}
 *   isLoading={isLoading}
 * />
 * ```
 */
export function ProducerForm({ onSubmit, isLoading = false, defaultValues }: ProducerFormProps): ReactElement {
	const { t } = useTranslation();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateProducerFormData>({
		resolver: zodResolver(createProducerSchema),
		defaultValues,
		mode: "onSubmit",
	});

	return (
		<form
			onSubmit={(event) => {
				void handleSubmit(onSubmit)(event);
			}}
			noValidate
			style={{ maxWidth: "600px" }}
		>
			<Flex direction="column" gap="4">
				{/* Producer Name */}
				<label>
					<Text as="div" size="2" weight="medium" mb="1">
						{t(($) => $.producers.name)} <Text color="red">*</Text>
					</Text>
					<Text as="div" size="1" color="gray" mb="1">
						{t(($) => $.producers.nameHint)}
					</Text>
					<TextField.Root
						{...register("name")}
						placeholder="João da Silva"
						disabled={isLoading}
						color={errors.name ? "red" : undefined}
					/>
					{errors.name && (
						<Text size="1" color="red" mt="1">
							{errors.name.message}
						</Text>
					)}
				</label>

				{/* Document (CPF/CNPJ) */}
				<label>
					<Text as="div" size="2" weight="medium" mb="1">
						{t(($) => $.producers.document)} <Text color="red">*</Text>
					</Text>
					<Text as="div" size="1" color="gray" mb="1">
						{t(($) => $.producers.documentHint)}
					</Text>
					<TextField.Root
						{...register("document")}
						placeholder="111.444.777-35 or 11.222.333/0001-81"
						disabled={isLoading}
						color={errors.document ? "red" : undefined}
					/>
					{errors.document && (
						<Text size="1" color="red" mt="1">
							{errors.document.message}
						</Text>
					)}
				</label>

				{/* Submit Button */}
				<Flex justify="end" mt="2">
					<Button type="submit" disabled={isLoading} loading={isLoading}>
						{t(($) => $.producers.submitLabel)}
					</Button>
				</Flex>
			</Flex>
		</form>
	);
}
