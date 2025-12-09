import { zodResolver } from "@hookform/resolvers/zod";
import { Badge, Button, Flex, Grid, Select, Text, TextField } from "@radix-ui/themes";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { ReactElement } from "react";

import type { CreateFarmFormData } from "@/schemas";

import { BrazilianState, CropType } from "@agro/shared/enums";

import { useLocalStorageContext } from "@/contexts/LocalStorageContext";
import { createFarmSchema } from "@/schemas";
import { CROP_TO_COLOR, STORAGE_KEYS } from "@/utils/constants.util";

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
	const storage = useLocalStorageContext();
	const [selectedState, setSelectedState] = useState<string>(defaultValues?.state ?? "");
	const [selectedCity, setSelectedCity] = useState<string>(defaultValues?.city ?? "");

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

	/** Get cities from localStorage and filter by selected state */
	const availableCities = useMemo(() => {
		if (!selectedState) return [];

		const citiesData = storage.getItem<Record<string, string[]>>(STORAGE_KEYS.citiesByState as string);

		return citiesData?.[selectedState] ?? [];
	}, [selectedState, storage]);

	const handleCropToggle = (crop: CropType): void => {
		const newCrops =
			selectedCrops.includes(crop) ?
				selectedCrops.filter((selectedCrop) => selectedCrop !== crop)
			:	[...selectedCrops, crop];

		setSelectedCrops(newCrops);
		setValue("crops", newCrops, { shouldValidate: true });
	};

	/** Handle state change and reset city */
	const handleStateChange = (state: string): void => {
		setSelectedState(state);
		setValue("state", state as BrazilianState, { shouldValidate: true });

		setSelectedCity("");
		setValue("city", "", { shouldValidate: false });
	};

	return (
		<form
			onSubmit={(event) => {
				void handleSubmit(onSubmit)(event);
			}}
			noValidate
			style={{ maxWidth: "800px" }}
		>
			<Flex direction="column" gap="4">
				{/* Farm Name */}
				<label>
					<Text as="div" size="2" weight="medium" mb="1">
						{t(($) => $.farms.name)} <Text color="red">*</Text>
					</Text>
					<Text as="div" size="1" color="gray" mb="1">
						{t(($) => $.farms.nameHint)}
					</Text>
					<TextField.Root
						{...register("name")}
						placeholder="Fazenda Boa Vista"
						disabled={isLoading}
						color={errors.name ? "red" : undefined}
					/>
					{errors.name && (
						<Text size="1" color="red" mt="1">
							{errors.name.message}
						</Text>
					)}
				</label>

				{/* City */}
				<label>
					<Text as="div" size="2" weight="medium" mb="1">
						{t(($) => $.farms.city)} <Text color="red">*</Text>
					</Text>
					<Text as="div" size="1" color="gray" mb="1">
						{t(($) => $.farms.cityHint)}
					</Text>
					<Select.Root
						value={selectedCity}
						onValueChange={(value) => {
							setSelectedCity(value);
							setValue("city", value, { shouldValidate: true });
						}}
						disabled={isLoading || !selectedState || availableCities.length === 0}
					>
						<Select.Trigger
							placeholder={
								!selectedState ? t(($) => $.farms.selectStateFirst)
								: availableCities.length === 0 ?
									t(($) => $.farms.noCitiesAvailable)
								:	t(($) => $.farms.selectCity)
							}
						/>
						<Select.Content>
							{availableCities.map((city) => (
								<Select.Item key={city} value={city}>
									{city}
								</Select.Item>
							))}
						</Select.Content>
					</Select.Root>
					{errors.city && (
						<Text size="1" color="red" mt="1">
							{errors.city.message}
						</Text>
					)}
				</label>

				{/* State */}
				<label>
					<Text as="div" size="2" weight="medium" mb="1">
						{t(($) => $.farms.state)} <Text color="red">*</Text>
					</Text>
					<Text as="div" size="1" color="gray" mb="1">
						{t(($) => $.farms.stateHint)}
					</Text>
					<Select.Root value={selectedState} onValueChange={handleStateChange} disabled={isLoading}>
						<Select.Trigger placeholder={t(($) => $.farms.selectState)} />
						<Select.Content>
							{Object.values(BrazilianState).map((state, index) => (
								<Select.Item key={index} value={state}>
									{t(($) => $.states[state])}
								</Select.Item>
							))}
						</Select.Content>
					</Select.Root>
					{errors.state && (
						<Text size="1" color="red" mt="1">
							{errors.state.message}
						</Text>
					)}
				</label>

				{/* Area Fields */}
				<Grid columns={{ initial: "1", sm: "3" }} gap="3">
					<label>
						<Text as="div" size="2" weight="medium" mb="1">
							{t(($) => $.farms.totalArea)} <Text color="red">*</Text>
						</Text>
						<Text as="div" size="1" color="gray" mb="1">
							{t(($) => $.farms.totalAreaHint)}
						</Text>
						<TextField.Root
							{...register("totalArea", { valueAsNumber: true })}
							type="number"
							step="0.01"
							min="0.01"
							placeholder="100.00"
							disabled={isLoading}
							color={errors.totalArea ? "red" : undefined}
						/>
						{errors.totalArea && (
							<Text size="1" color="red" mt="1">
								{errors.totalArea.message}
							</Text>
						)}
					</label>

					<label>
						<Text as="div" size="2" weight="medium" mb="1">
							{t(($) => $.farms.arableArea)} <Text color="red">*</Text>
						</Text>
						<Text as="div" size="1" color="gray" mb="1">
							{t(($) => $.farms.arableAreaHint)}
						</Text>
						<TextField.Root
							{...register("arableArea", { valueAsNumber: true })}
							type="number"
							step="0.01"
							min="0"
							placeholder="70.00"
							disabled={isLoading}
							color={errors.arableArea ? "red" : undefined}
						/>
						{errors.arableArea && (
							<Text size="1" color="red" mt="1">
								{errors.arableArea.message}
							</Text>
						)}
					</label>

					<label>
						<Text as="div" size="2" weight="medium" mb="1">
							{t(($) => $.farms.vegetationArea)} <Text color="red">*</Text>
						</Text>
						<Text as="div" size="1" color="gray" mb="1">
							{t(($) => $.farms.vegetationAreaHint)}
						</Text>
						<TextField.Root
							{...register("vegetationArea", { valueAsNumber: true })}
							type="number"
							step="0.01"
							min="0"
							placeholder="25.00"
							disabled={isLoading}
							color={errors.vegetationArea ? "red" : undefined}
						/>
						{errors.vegetationArea && (
							<Text size="1" color="red" mt="1">
								{errors.vegetationArea.message}
							</Text>
						)}
					</label>
				</Grid>

				{/* Crops */}
				<label>
					<Text as="div" size="2" weight="medium" mb="1">
						{t(($) => $.farms.crops)} <Text color="red">*</Text>
					</Text>
					<Text as="div" size="1" color="gray" mb="1">
						{t(($) => $.farms.cropsHint)}
					</Text>
					<Flex wrap="wrap" gap="2" mt="2">
						{Object.values(CropType).map((crop) => {
							const isSelected = selectedCrops.includes(crop);

							return (
								<Badge
									key={crop}
									color={CROP_TO_COLOR[crop]}
									variant={isSelected ? "solid" : "soft"}
									size="2"
									style={{ cursor: "pointer" }}
									onClick={() => {
										handleCropToggle(crop);
									}}
								>
									<Flex gap="1" align="center">
										{isSelected && "✓ "}
										{t(($) => $.crops[crop])}
									</Flex>
								</Badge>
							);
						})}
					</Flex>
					{errors.crops && (
						<Text size="1" color="red" mt="1">
							{errors.crops.message}
						</Text>
					)}
				</label>

				{/* Submit Button */}
				<Flex justify="end" mt="2">
					<Button type="submit" disabled={isLoading} loading={isLoading}>
						{t(($) => $.farms.submitLabel)}
					</Button>
				</Flex>
			</Flex>
		</form>
	);
}
