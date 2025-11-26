import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import type { ReactElement } from "react";

import type { CreateProducerRequest } from "@agro/shared/types/producer.types";

import { Typography } from "@/components/atoms";
import { Card } from "@/components/ui/";
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
	const navigate = useNavigate();
	const [createProducer, { isLoading }] = useCreateProducerMutation();

	const handleSubmit = async (data: CreateProducerRequest) => {
		try {
			await createProducer(data).unwrap();
			// TODO: Show success toast when Toast component is ready
			void navigate(ROUTES.producers.list);
		} catch (error) {
			console.error("Failed to create producer:", error);
			// TODO: Show error toast when Toast component is ready
			alert("Failed to create producer. Please try again.");
		}
	};

	const handleCancel = () => {
		void navigate(ROUTES.producers.list);
	};

	return (
		<Container>
			<Header>
				<Typography variant="h1">Create Producer</Typography>
				<Typography variant="body">Add a new rural producer</Typography>
			</Header>

			<FormCard>
				<ProducerForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Create Producer" />
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
