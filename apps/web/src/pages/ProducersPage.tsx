import styled from "styled-components";

import type { ReactElement } from "react";

import { Typography } from "@/components/atoms";

/**
 * Producers list page component displaying all rural producers.
 *
 * Shows table/list of producers with search, filtering, and pagination.
 * Provides actions for creating, editing, and deleting producers.
 */
export function ProducersPage(): ReactElement {
	return (
		<Container>
			<Typography variant="h1">Producers</Typography>
			<Typography variant="body">Manage rural producers</Typography>
		</Container>
	);
}

const Container = styled.div`
	padding: ${(props) => props.theme.spacing.xl};
`;
