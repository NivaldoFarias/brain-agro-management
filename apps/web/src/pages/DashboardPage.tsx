import styled from "styled-components";

import type { ReactElement } from "react";

import { Typography } from "@/components/atoms";

/**
 * Dashboard page component displaying agricultural analytics.
 *
 * Shows total metrics, state distribution, crop distribution,
 * and land use statistics for all registered farms.
 */
export function DashboardPage(): ReactElement {
	return (
		<Container>
			<Typography variant="h1">Dashboard</Typography>
			<Typography variant="body">Agricultural analytics and statistics</Typography>
		</Container>
	);
}

const Container = styled.div`
	padding: ${(props) => props.theme.spacing.xl};
`;
