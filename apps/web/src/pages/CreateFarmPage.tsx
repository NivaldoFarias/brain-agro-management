import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import type { ReactElement } from "react";

import type { CreateFarmFormData } from "@/schemas";

import { Typography } from "@/components/atoms";
import { Card, EmptyState, LoadingState } from "@/components/ui/";
import { useToast } from "@/contexts";
import { FarmForm } from "@/features";
import { useCreateFarmMutation, useGetProducersQuery } from "@/store/api";
import { ROUTES } from "@/utils/";

/**
 * Create farm page component for adding new agricultural farms.
 *
 * Displays form with validation for creating new farm records
 * with area validation and crop selection.
 */
export function CreateFarmPage(): ReactElement {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const toast = useToast();

	const { data: producersData, isLoading: isLoadingProducers } = useGetProducersQuery({
		page: 1,
		limit: 100,
	});
	const [createFarm, { isLoading: isCreating }] = useCreateFarmMutation();

	const handleSubmit = async (data: CreateFarmFormData) => {
		try {
			await createFarm(data).unwrap();

			toast.success(t("farms.createSuccess"), t("farms.farmAdded"));

			await navigate(ROUTES.farms.list);
		} catch (error) {
			console.error(t("farms.createError"), error);
			toast.error(t("farms.createError"), t("common.retry"));
		}
	};

	if (isLoadingProducers) {
		return (
			<Container>
				<LoadingState message={t("farms.loadingProducers")} />
			</Container>
		);
	}

	if (!producersData || producersData.data.length === 0) {
		return (
			<Container>
				<EmptyState
					title={t("farms.noProducers")}
					description={t("farms.registerNewProducer")}
					action={
						<button
							onClick={() => {
								void navigate(ROUTES.producers.create);
							}}
							style={{ cursor: "pointer" }}
						>
							{t("producers.createProducer")}
						</button>
					}
				/>
			</Container>
		);
	}

	return (
		<Container>
			<Header>
				<Typography variant="h1">{t("farms.createFarm")}</Typography>
				<Typography variant="body">{t("farms.registerNewProperty")}</Typography>
			</Header>

			<FormCard>
				<FarmForm producerId={producersData.data[0]?.id ?? ""} onSubmit={handleSubmit} isLoading={isCreating} />
			</FormCard>
		</Container>
	);
}

const Container = styled.div`
	padding: ${(props) => props.theme.spacing.xl};
	max-width: 900px;
	margin: 0 auto;
`;

const Header = styled.div`
	margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const FormCard = styled(Card)`
	padding: ${(props) => props.theme.spacing.xl};
`;
