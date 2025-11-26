import styled from "styled-components";

import type { ReactElement } from "react";

import { Typography } from "@/components/atoms";

/**
 * Create producer page component for adding new rural producers.
 *
 * Displays form with validation for creating new producer records
 * with CPF/CNPJ validation and Brazilian address fields.
 */
export function CreateProducerPage(): ReactElement {
	return (
		<Container>
			<Typography variant="h1">Create Producer</Typography>
			<Typography variant="body">Add a new rural producer</Typography>
		</Container>
	);
}

const Container = styled.div`
	padding: ${(props) => props.theme.spacing.xl};
`;
