import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import type { FormEvent, ReactElement } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useLoginMutation } from "@/store/api/authApi";
import { ROUTES } from "@/utils/";

/**
 * Login page component with authentication form.
 *
 * Provides email/password form for user authentication.
 * Redirects to dashboard on successful login.
 */
export function LoginPage(): ReactElement {
	const navigate = useNavigate();
	const { login: setAuthToken } = useAuth();
	const toast = useToast();
	const [login, { isLoading }] = useLoginMutation();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | undefined>();

	const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
		event.preventDefault();
		setError(undefined);

		console.log("[LoginPage] handleSubmit called");
		console.log("[LoginPage] Email:", email);

		if (!email || !password) {
			const errorMsg = "Please enter both email and password";
			setError(errorMsg);
			toast.error("Missing credentials", errorMsg);
			return;
		}

		try {
			console.log("[LoginPage] Calling login API...");
			const response = await login({ email, password }).unwrap();
			console.log("[LoginPage] Login API response:", response);

			console.log("[LoginPage] Calling setAuthToken...");
			setAuthToken(response.accessToken, email);
			console.log("[LoginPage] setAuthToken completed");

			// Show success toast
			toast.success("Login successful", "Welcome back!");

			// Small delay to ensure state updates
			await new Promise((resolve) => setTimeout(resolve, 100));

			console.log("[LoginPage] Navigating to dashboard...");
			navigate(ROUTES.dashboard, { replace: true });
		} catch (err) {
			console.error("[LoginPage] Login failed:", err);
			const errorMsg = "Invalid credentials. Please try again.";
			setError(errorMsg);
			toast.error("Login failed", errorMsg);
		}
	};

	return (
		<PageContainer>
			<LoginCard>
				<Header>
					<Title>Brain Agriculture</Title>
					<Subtitle>Rural Producer Management System</Subtitle>
				</Header>

				<form onSubmit={handleSubmit}>
					<FormField id="email" label="Email" required>
						<Input
							id="email"
							type="email"
							placeholder="admin@example.com"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								setError(undefined);
							}}
							disabled={isLoading}
							autoFocus
						/>
					</FormField>

					<FormField id="password" label="Password" required>
						<Input
							id="password"
							type="password"
							placeholder="Enter your password"
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								setError(undefined);
							}}
							disabled={isLoading}
						/>
					</FormField>

					{error && <ErrorMessage message={error} />}

					<Button variant="primary" type="submit" disabled={isLoading} isLoading={isLoading} fullWidth>
						{isLoading ? "Signing in..." : "Sign In"}
					</Button>
				</form>

				<DemoCredentials>
					<DemoTitle>Demo Credentials</DemoTitle>
					<DemoText>Email: admin@example.com</DemoText>
					<DemoText>Password: admin123</DemoText>
				</DemoCredentials>
			</LoginCard>
		</PageContainer>
	);
}

const PageContainer = styled.div`
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(
		135deg,
		${(props) => props.theme.colors.primary} 0%,
		${(props) => props.theme.colors.primaryDark} 50%,
		${(props) => props.theme.colors.accent} 100%
	);
	padding: ${(props) => props.theme.spacing.xl};
	position: relative;

	/* Add subtle pattern overlay */
	&::before {
		content: "";
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
		opacity: 0.4;
	}
`;

const LoginCard = styled(Card)`
	width: 100%;
	max-width: 440px;
	padding: ${(props) => props.theme.spacing["3xl"]} ${(props) => props.theme.spacing["2xl"]};
	background: ${(props) => props.theme.colors.surface};
	border: 1px solid ${(props) => props.theme.colors.border};
	box-shadow: ${(props) => props.theme.shadows.xl};
	position: relative;
	z-index: 1;

	form {
		display: flex;
		flex-direction: column;
		gap: ${(props) => props.theme.spacing.lg};
	}

	@media (max-width: ${(props) => props.theme.breakpoints.sm}) {
		padding: ${(props) => props.theme.spacing["2xl"]} ${(props) => props.theme.spacing.lg};
	}
`;

const Header = styled.div`
	text-align: center;
	margin-bottom: ${(props) => props.theme.spacing["2xl"]};
`;

const Title = styled.h1`
	font-size: ${(props) => props.theme.typography.fontSize["4xl"]};
	font-weight: ${(props) => props.theme.typography.fontWeight.bold};
	color: ${(props) => props.theme.colors.primary};
	margin-bottom: ${(props) => props.theme.spacing.sm};
	letter-spacing: -0.025em;

	background: linear-gradient(
		135deg,
		${(props) => props.theme.colors.primary},
		${(props) => props.theme.colors.primaryDark}
	);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
`;

const Subtitle = styled.p`
	font-size: ${(props) => props.theme.typography.fontSize.base};
	color: ${(props) => props.theme.colors.textSecondary};
	font-weight: ${(props) => props.theme.typography.fontWeight.medium};
`;

const DemoCredentials = styled.div`
	margin-top: ${(props) => props.theme.spacing.xl};
	padding: ${(props) => props.theme.spacing.lg};
	background: linear-gradient(
		135deg,
		${(props) => props.theme.colors.primaryLight}15,
		${(props) => props.theme.colors.secondary}10
	);
	border-radius: ${(props) => props.theme.borderRadius.lg};
	border: 1px solid ${(props) => props.theme.colors.primary}30;
	backdrop-filter: blur(10px);
`;

const DemoTitle = styled.p`
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	font-weight: ${(props) => props.theme.typography.fontWeight.bold};
	color: ${(props) => props.theme.colors.primary};
	margin-bottom: ${(props) => props.theme.spacing.sm};
	text-transform: uppercase;
	letter-spacing: 0.05em;
`;

const DemoText = styled.p`
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	color: ${(props) => props.theme.colors.textSecondary};
	font-family: ${(props) => props.theme.typography.fontFamily.mono};
	line-height: 1.8;
`;
