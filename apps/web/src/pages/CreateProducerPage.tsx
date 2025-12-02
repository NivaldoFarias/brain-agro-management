import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import type { ReactElement } from "react";

import type { CreateProducerRequest } from "@agro/shared/types";

import { Typography } from "@/components/atoms";
import { Card } from "@/components/ui/";
import { useToast } from "@/contexts";
import { ProducerForm } from "@/features";
import { useCreateProducerMutation } from "@/store/api";
import { ROUTES } from "@/utils/";

/**
 * Create producer page component for adding new rural producers.
 *
 * Displays form with validation for creating new producer records
 * with CPF/CNPJ validation and Brazilian address fields.
 */
export function CreateProducerPage(): ReactElement {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const toast = useToast();
	const [createProducer, { isLoading }] = useCreateProducerMutation();

	const handleSubmit = async (data: CreateProducerRequest) => {
		try {
			await createProducer(data).unwrap();

			toast.success(
				t(($) => $.producers.createSuccess),
				t(($) => $.producers.producerAdded),
			);

			await navigate(ROUTES.producers.list);
		} catch (error) {
			console.error(
				t(($) => $.producers.createError),
				error,
			);
			toast.error(
				t(($) => $.producers.createError),
				t(($) => $.common.retry),
			);
		}
	};

	return (
		<Container>
			<Header>
				<Typography variant="h1">{t(($) => $.producers.createProducer)}</Typography>
				<Typography variant="body">{t(($) => $.producers.addNewProducer)}</Typography>
			</Header>

			<FormCard>
				<ProducerForm onSubmit={handleSubmit} isLoading={isLoading} />
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
