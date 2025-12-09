import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import type { ReactElement } from "react";

import type { UpdateProducerRequest } from "@agro/shared/types";

import { Typography } from "@/components/atoms";
import { Card, LoadingState } from "@/components/ui/";
import { useToast } from "@/contexts";
import { ProducerForm } from "@/features";
import { useLogger } from "@/hooks";
import { useGetProducerQuery, useUpdateProducerMutation } from "@/store/api";
import { ROUTES } from "@/utils/";

/**
 * Edit producer page component for updating existing rural producers.
 *
 * Loads producer data by ID and displays form for editing with pre-filled values.
 * Handles validation and submission with success/error feedback.
 */
export function EditProducerPage(): ReactElement {
	const logger = useLogger(EditProducerPage.name);
	const { t } = useTranslation();
	const navigate = useNavigate();
	const toast = useToast();
	const { id } = useParams<{ id: string }>();

	const {
		data: producer,
		isLoading: isLoadingProducer,
		error: loadError,
	} = useGetProducerQuery(id ?? "", { skip: !id });
	const [updateProducer, { isLoading: isUpdating }] = useUpdateProducerMutation();

	if (!id) {
		return <Navigate to={ROUTES.dashboard} replace />;
	}

	const handleSubmit = async (data: UpdateProducerRequest) => {
		try {
			await updateProducer({ id, ...data }).unwrap();

			toast.success(t(($) => $.producers.updateSuccess));

			await navigate(ROUTES.producers.list);
		} catch (error) {
			logger.error(
				t(($) => $.producers.updateError),
				error,
			);
			toast.error(
				t(($) => $.producers.updateError),
				t(($) => $.common.retry),
			);
		}
	};

	if (isLoadingProducer) {
		return (
			<Container>
				<LoadingState message={t(($) => $.common.loading)} />
			</Container>
		);
	}

	if (loadError || !producer) {
		return <Navigate to={ROUTES.producers.list} replace />;
	}

	return (
		<Container>
			<Header>
				<Typography variant="h1">{t(($) => $.producers.editProducer)}</Typography>
				<Typography variant="body">{producer.name}</Typography>
			</Header>

			<FormCard>
				<ProducerForm
					onSubmit={handleSubmit}
					isLoading={isUpdating}
					defaultValues={{
						name: producer.name,
						document: producer.document,
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
