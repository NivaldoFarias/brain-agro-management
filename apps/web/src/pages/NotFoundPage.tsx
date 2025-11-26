import styled from "styled-components";

import type { ReactElement } from "react";

import { Typography } from "@/components/atoms";
import { Button } from "@/components/ui";

/**
 * 404 Not Found page component.
 *
 * Displayed when user navigates to non-existent route.
 * Provides navigation back to home/dashboard.
 */
export function NotFoundPage(): ReactElement {
	return (
		<Container>
			<Typography variant="h1">404</Typography>
			<Typography variant="h3">Page Not Found</Typography>
			<Typography variant="body" color="textSecondary">
				The page you&apos;re looking for doesn&apos;t exist or has been moved.
			</Typography>
			<Button variant="primary" onClick={() => (window.location.href = "/")}>
				Go to Dashboard
			</Button>
		</Container>
	);
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: ${(props) => props.theme.spacing.lg};
	min-height: 100vh;
	padding: ${(props) => props.theme.spacing.xl};
	text-align: center;
`;
