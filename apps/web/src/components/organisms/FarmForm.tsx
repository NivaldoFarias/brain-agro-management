import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import type { ReactElement } from "react";

import type { CreateFarmFormData } from "@/schemas";

import { BrazilianState, CropType } from "@agro/shared/utils";

import { createFarmSchema } from "@/schemas";

import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

/** Props for the FarmForm component */
export interface FarmFormProps {
	/** Callback when form is successfully submitted */
	onSubmit: (data: CreateFarmFormData) => void | Promise<void>;

	/** Whether the form is in loading/submitting state */
	isLoading?: boolean;

	/** Initial form values for editing */
	defaultValues?: Partial<CreateFarmFormData>;

	/** Producer ID to associate the farm with */
	producerId: string;
}

/**
 * Form component for creating and editing farms.
 *
 * Integrates react-hook-form with Zod validation for type-safe form handling.
 * Validates farm areas ensuring arable + vegetation ≤ total area.
 *
 * @example
 * ```tsx
 * const [createFarm] = useCreateFarmMutation();
 *
 * <FarmForm
 *   producerId={producerId}
 *   onSubmit={async (data) => {
 *     await createFarm(data).unwrap();
 *   }}
 *   isLoading={isLoading}
 * />
 * ```
 */
export function FarmForm({ onSubmit, isLoading = false, defaultValues, producerId }: FarmFormProps): ReactElement {
	const { t } = useTranslation();
	const [selectedState, setSelectedState] = useState<string>(defaultValues?.state ?? "");

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm({
		resolver: zodResolver(createFarmSchema),
		defaultValues: {
			name: defaultValues?.name ?? "",
			city: defaultValues?.city ?? "",
			state: defaultValues?.state ?? ("" as BrazilianState),
			totalArea: defaultValues?.totalArea ?? 0,
			arableArea: defaultValues?.arableArea ?? 0,
			vegetationArea: defaultValues?.vegetationArea ?? 0,
			crops: defaultValues?.crops ?? [],
			producerId,
		},
	});

	const [selectedCrops, setSelectedCrops] = useState<CropType[]>(defaultValues?.crops ?? []);

	const handleCropToggle = (crop: CropType): void => {
		const newCrops = selectedCrops.includes(crop) ? selectedCrops.filter((c) => c !== crop) : [...selectedCrops, crop];
		setSelectedCrops(newCrops);
		setValue("crops", newCrops, { shouldValidate: true });
	};

	return (
		<Form
			onSubmit={(event) => {
				void handleSubmit(onSubmit)(event);
			}}
			noValidate
		>
			<FormField id="name" label={t("farms.name")} required error={errors.name?.message} hint={t("farms.nameHint")}>
				<Input
					{...register("name")}
					id="name"
					type="text"
					placeholder="Fazenda Boa Vista"
					hasError={!!errors.name}
					fullWidth
					disabled={isLoading}
				/>
			</FormField>

			<FormField id="city" label={t("farms.city")} required error={errors.city?.message} hint={t("farms.cityHint")}>
				<Input
					{...register("city")}
					id="city"
					type="text"
					placeholder="Campinas"
					hasError={!!errors.city}
					fullWidth
					disabled={isLoading}
				/>
			</FormField>

			<FormField id="state" label={t("farms.state")} required error={errors.state?.message} hint={t("farms.stateHint")}>
				<Select
					value={selectedState}
					onValueChange={(value) => {
						setSelectedState(value);
						setValue("state", value as BrazilianState, { shouldValidate: true });
					}}
					placeholder={t("farms.selectState")}
					disabled={isLoading}
					aria-label={t("farms.state")}
					options={Object.values(BrazilianState).map((state) => ({
						value: state,
						label: t(`states.${state}`),
					}))}
				/>
			</FormField>

			<AreaFieldsGroup>
				<FormField
					id="totalArea"
					label={t("farms.totalArea")}
					required
					error={errors.totalArea?.message}
					hint={t("farms.totalAreaHint")}
				>
					<Input
						{...register("totalArea", { valueAsNumber: true })}
						id="totalArea"
						type="number"
						step="0.01"
						min="0.01"
						placeholder="100.00"
						hasError={!!errors.totalArea}
						fullWidth
						disabled={isLoading}
					/>
				</FormField>

				<FormField
					id="arableArea"
					label={t("farms.arableArea")}
					required
					error={errors.arableArea?.message}
					hint={t("farms.arableAreaHint")}
				>
					<Input
						{...register("arableArea", { valueAsNumber: true })}
						id="arableArea"
						type="number"
						step="0.01"
						min="0"
						placeholder="70.00"
						hasError={!!errors.arableArea}
						fullWidth
						disabled={isLoading}
					/>
				</FormField>

				<FormField
					id="vegetationArea"
					label={t("farms.vegetationArea")}
					required
					error={errors.vegetationArea?.message}
					hint={t("farms.vegetationAreaHint")}
				>
					<Input
						{...register("vegetationArea", { valueAsNumber: true })}
						id="vegetationArea"
						type="number"
						step="0.01"
						min="0"
						placeholder="25.00"
						hasError={!!errors.vegetationArea}
						fullWidth
						disabled={isLoading}
					/>
				</FormField>
			</AreaFieldsGroup>

			<FormField id="crops" label={t("farms.crops")} required error={errors.crops?.message} hint={t("farms.cropsHint")}>
				<CropSelector>
					{Object.values(CropType).map((crop) => (
						<CropCheckbox key={crop}>
							<input
								type="checkbox"
								id={`crop-${crop}`}
								checked={selectedCrops.includes(crop)}
								onChange={() => {
									handleCropToggle(crop);
								}}
								disabled={isLoading}
							/>
							<label htmlFor={`crop-${crop}`}>{crop}</label>
						</CropCheckbox>
					))}
				</CropSelector>
			</FormField>

			<ButtonGroup>
				<Button type="submit" variant="primary" disabled={isLoading} isLoading={isLoading}>
					{t("farms.submitLabel")}
				</Button>
			</ButtonGroup>
		</Form>
	);
}

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.lg};
	max-width: 800px;
`;

const AreaFieldsGroup = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: ${(props) => props.theme.spacing.md};
`;

const CropSelector = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: ${(props) => props.theme.spacing.md};
`;

const CropCheckbox = styled.div`
	display: flex;
	align-items: center;
	gap: ${(props) => props.theme.spacing.sm};

	input[type="checkbox"] {
		width: 20px;
		height: 20px;
		cursor: pointer;

		&:disabled {
			cursor: not-allowed;
			opacity: 0.5;
		}
	}

	label {
		font-size: ${(props) => props.theme.typography.fontSize.sm};
		color: ${(props) => props.theme.colors.text};
		cursor: pointer;
		user-select: none;

		&:has(+ input:disabled) {
			cursor: not-allowed;
			opacity: 0.5;
		}
	}
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: ${(props) => props.theme.spacing.md};
	justify-content: flex-end;
	margin-top: ${(props) => props.theme.spacing.md};
`;
