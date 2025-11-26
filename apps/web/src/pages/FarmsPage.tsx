import styled from "styled-components";

import type { ReactElement } from "react";

import { Typography } from "@/components/atoms";

/**
 * Farms list page component displaying all registered farms.
 *
 * Shows table/list of farms with associated producer information,
 * search, filtering, and pagination capabilities.
 */
export function FarmsPage(): ReactElement {
	return (
		<Container>
			<Typography variant="h1">Farms</Typography>
			<Typography variant="body">Manage agricultural farms</Typography>
		</Container>
	);
}

const Container = styled.div`
	padding: ${(props) => props.theme.spacing.xl};
`;
