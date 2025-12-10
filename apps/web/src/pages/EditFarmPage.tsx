import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import type { ReactElement } from "react";

import type { UpdateFarmRequest } from "@agro/shared/types";

import { ROUTES } from "@agro/shared/constants";

import { Typography } from "@/components/atoms";
import { Card, LoadingState } from "@/components/ui/";
import { useToast } from "@/contexts";
import { FarmForm } from "@/features";
import { useLogger } from "@/hooks";
import { useGetFarmByIdQuery, useUpdateFarmMutation } from "@/store/api";

/**
 * Edit farm page component for updating existing agricultural farms.
 *
 * Loads farm data by ID and displays form for editing with pre-filled values.
 * Handles validation and submission with success/error feedback.
 */
export function EditFarmPage(): ReactElement {
	const logger = useLogger(EditFarmPage.name);
	const { t } = useTranslation();
	const navigate = useNavigate();
	const toast = useToast();
	const { id } = useParams<{ id: string }>();

	const { data: farm, isLoading: isLoadingFarm, error: loadError } = useGetFarmByIdQuery(id ?? "", { skip: !id });
	const [updateFarm, { isLoading: isUpdating }] = useUpdateFarmMutation();

	if (!id) {
		return <Navigate to={ROUTES.web.dashboard} replace />;
	}

	const handleSubmit = async (data: UpdateFarmRequest) => {
		try {
			await updateFarm({ id, ...data }).unwrap();

			toast.success(t(($) => $.farms.updateSuccess));

			await navigate(ROUTES.web.farms.list);
		} catch (error) {
			logger.error(
				t(($) => $.farms.updateError),
				error,
			);
			toast.error(
				t(($) => $.farms.updateError),
				t(($) => $.common.retry),
			);
		}
	};

	if (isLoadingFarm) {
		return (
			<Container>
				<LoadingState message={t(($) => $.common.loading)} />
			</Container>
		);
	}

	if (loadError || !farm) {
		return <Navigate to={ROUTES.web.farms.list} replace />;
	}

	return (
		<Container>
			<Header>
				<Typography variant="h1">{t(($) => $.farms.editFarm)}</Typography>
				<Typography variant="body">{farm.name}</Typography>
			</Header>

			<FormCard>
				<FarmForm
					onSubmit={handleSubmit}
					isLoading={isUpdating}
					producerId={farm.producerId}
					defaultValues={{
						name: farm.name,
						city: farm.city,
						state: farm.state,
						totalArea: farm.totalArea,
						arableArea: farm.arableArea,
						vegetationArea: farm.vegetationArea,
						crops: farm.crops,
					}}
				/>
			</FormCard>
		</Container>
	);
}

const Container = styled.div`
	padding: ${(props) => props.theme.spacing.xl};
	max-width: 800px;
	margin: 0 auto;
`;

const Header = styled.div`
	margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const FormCard = styled(Card)`
	padding: ${(props) => props.theme.spacing.xl};
`;
