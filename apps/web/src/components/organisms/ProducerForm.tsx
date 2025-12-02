import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import type { ReactElement } from "react";

import type { CreateProducerFormData } from "@/schemas";

import { createProducerSchema } from "@/schemas";

import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";

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
		<Form
			onSubmit={(event) => {
				void handleSubmit(onSubmit)(event);
			}}
			noValidate
		>
			<FormField
				id="name"
				label={t(($) => $.producers.name)}
				required
				error={errors.name?.message}
				hint={t(($) => $.producers.nameHint)}
			>
				<Input
					{...register("name")}
					id="name"
					type="text"
					placeholder="João da Silva"
					hasError={!!errors.name}
					fullWidth
					disabled={isLoading}
				/>
			</FormField>

			<FormField
				id="document"
				label={t(($) => $.producers.document)}
				required
				error={errors.document?.message}
				hint={t(($) => $.producers.documentHint)}
			>
				<Input
					{...register("document")}
					id="document"
					type="text"
					placeholder="111.444.777-35 or 11.222.333/0001-81"
					hasError={!!errors.document}
					fullWidth
					disabled={isLoading}
				/>
			</FormField>

			<ButtonGroup>
				<Button type="submit" variant="primary" disabled={isLoading} isLoading={isLoading}>
					{t(($) => $.producers.submitLabel)}
				</Button>
			</ButtonGroup>
		</Form>
	);
}

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.lg};
	max-width: 600px;
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: ${(props) => props.theme.spacing.md};
	justify-content: flex-end;
	margin-top: ${(props) => props.theme.spacing.md};
`;
