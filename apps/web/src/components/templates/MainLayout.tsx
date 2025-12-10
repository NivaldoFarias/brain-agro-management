import {
	BarChart3 as ChartIcon,
	X as CloseIcon,
	Factory as FarmIcon,
	LogOut as LogOutIcon,
	Menu as MenuIcon,
	Users as UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";

import type { ReactElement, ReactNode } from "react";

import { ROUTES } from "@agro/shared/constants";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

/**
 * Props for MainLayout component.
 */
interface MainLayoutProps {
	children: ReactNode;
}

/**
 * Main application layout with header and sidebar navigation.
 *
 * Provides consistent navigation structure for all authenticated pages.
 * Includes header with user info and logout, sidebar with main navigation links.
 */
export function MainLayout({ children }: MainLayoutProps): ReactElement {
	const { t } = useTranslation();
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const toast = useToast();
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	const handleLogout = (): void => {
		logout();
		toast.info(
			t(($) => $.auth.logoutSuccess),
			t(($) => $.auth.logoutSuccess),
		);
		void navigate(ROUTES.web.auth.login, { replace: true });
	};

	return (
		<LayoutContainer>
			<Header>
				<HeaderLeft>
					<MenuButton
						onClick={() => {
							setIsSidebarOpen(!isSidebarOpen);
						}}
						aria-label="Toggle sidebar"
						aria-expanded={isSidebarOpen}
					>
						{isSidebarOpen ?
							<CloseIcon size={20} />
						:	<MenuIcon size={20} />}
					</MenuButton>
					<Logo>{t(($) => $.app.title)}</Logo>
				</HeaderLeft>
				<HeaderRight>
					<UserInfo>
						<UserEmail>{user?.email}</UserEmail>
					</UserInfo>
					<LogoutButton variant="tertiary" onClick={handleLogout} size="small">
						<LogOutIcon size={16} />
						{t(($) => $.auth.logout)}
					</LogoutButton>
				</HeaderRight>
			</Header>

			<ContentWrapper>
				<Sidebar $isOpen={isSidebarOpen}>
					<SidebarNav>
						<NavItem to={ROUTES.web.dashboard}>
							<ChartIcon size={20} />
							<NavText>{t(($) => $.nav.dashboard)}</NavText>
						</NavItem>
						<NavItem to={ROUTES.web.producers.list}>
							<UsersIcon size={20} />
							<NavText>{t(($) => $.nav.producers)}</NavText>
						</NavItem>
						<NavItem to={ROUTES.web.farms.list}>
							<FarmIcon size={20} />
							<NavText>{t(($) => $.nav.farms)}</NavText>
						</NavItem>
					</SidebarNav>
				</Sidebar>

				<MainContent $sidebarOpen={isSidebarOpen}>{children}</MainContent>
			</ContentWrapper>
		</LayoutContainer>
	);
}

const LayoutContainer = styled.div`
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-color: ${(props) => props.theme.colors.background};
`;

const Header = styled.header`
	height: 64px;
	background: ${(props) => props.theme.colors.surface};
	border-bottom: 1px solid ${(props) => props.theme.colors.border};
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 ${(props) => props.theme.spacing.xl};
	position: sticky;
	top: 0;
	z-index: ${(props) => props.theme.zIndex.sticky};
	box-shadow: ${(props) => props.theme.shadows.sm};

	@media (max-width: ${(props) => props.theme.breakpoints.sm}) {
		padding: 0 ${(props) => props.theme.spacing.md};
	}
`;

const HeaderLeft = styled.div`
	display: flex;
	align-items: center;
	gap: ${(props) => props.theme.spacing.md};
`;

const MenuButton = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	padding: ${(props) => props.theme.spacing.sm};
	border-radius: ${(props) => props.theme.borderRadius.base};
	transition: all ${(props) => props.theme.transitions.fast};
	display: flex;
	align-items: center;
	justify-content: center;
	color: ${(props) => props.theme.colors.text};

	&:hover {
		background-color: ${(props) => props.theme.colors.backgroundAlt};
		color: ${(props) => props.theme.colors.primary};
	}

	&:focus-visible {
		outline: 2px solid ${(props) => props.theme.colors.primary};
		outline-offset: 2px;
	}

	svg {
		transition: transform ${(props) => props.theme.transitions.fast};
	}

	&:active svg {
		transform: scale(0.95);
	}
`;

const LogoutButton = styled(Button)`
	display: flex;
	align-items: center;
	gap: ${(props) => props.theme.spacing.xs};
`;

const Logo = styled.h1`
	font-size: ${(props) => props.theme.typography.fontSize.xl};
	font-weight: ${(props) => props.theme.typography.fontWeight.bold};
	background: linear-gradient(
		135deg,
		${(props) => props.theme.colors.primary},
		${(props) => props.theme.colors.primaryDark}
	);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	margin: 0;

	@media (max-width: ${(props) => props.theme.breakpoints.sm}) {
		font-size: ${(props) => props.theme.typography.fontSize.lg};
	}
`;

const HeaderRight = styled.div`
	display: flex;
	align-items: center;
	gap: ${(props) => props.theme.spacing.lg};
`;

const UserInfo = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;

	@media (max-width: ${(props) => props.theme.breakpoints.sm}) {
		display: none;
	}
`;

const UserEmail = styled.span`
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	color: ${(props) => props.theme.colors.textSecondary};
	font-weight: ${(props) => props.theme.typography.fontWeight.medium};
`;

const ContentWrapper = styled.div`
	display: flex;
	flex: 1;
	position: relative;
`;

const Sidebar = styled.aside<{ $isOpen: boolean }>`
	width: ${(props) => (props.$isOpen ? "260px" : "0")};
	background: ${(props) => props.theme.colors.surface};
	border-right: 1px solid ${(props) => props.theme.colors.border};
	transition: width ${(props) => props.theme.transitions.base};
	overflow: hidden;
	position: sticky;
	top: 64px;
	height: calc(100vh - 64px);

	@media (max-width: ${(props) => props.theme.breakpoints.md}) {
		position: fixed;
		top: 64px;
		left: 0;
		z-index: ${(props) => props.theme.zIndex.fixed};
		box-shadow: ${(props) => (props.$isOpen ? props.theme.shadows.lg : "none")};
	}
`;

const SidebarNav = styled.nav`
	display: flex;
	flex-direction: column;
	padding: ${(props) => props.theme.spacing.lg} 0;
	min-width: 260px;
`;

const NavItem = styled(NavLink)`
	display: flex;
	align-items: center;
	gap: ${(props) => props.theme.spacing.md};
	padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.xl};
	color: ${(props) => props.theme.colors.textSecondary};
	text-decoration: none;
	font-weight: ${(props) => props.theme.typography.fontWeight.medium};
	transition: all ${(props) => props.theme.transitions.fast};
	border-left: 3px solid transparent;

	&:hover {
		background-color: ${(props) => props.theme.colors.backgroundAlt};
		color: ${(props) => props.theme.colors.text};
	}

	&.active {
		background-color: ${(props) => props.theme.colors.primary}10;
		color: ${(props) => props.theme.colors.primary};
		border-left-color: ${(props) => props.theme.colors.primary};
		font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
	}

	&:focus-visible {
		outline: 2px solid ${(props) => props.theme.colors.primary};
		outline-offset: -2px;
	}

	svg {
		flex-shrink: 0;
	}
`;

const NavText = styled.span`
	font-size: ${(props) => props.theme.typography.fontSize.base};
`;

const MainContent = styled.main<{ $sidebarOpen: boolean }>`
	flex: 1;
	width: 100%;
	max-width: ${(props) => (props.$sidebarOpen ? "calc(100vw - 260px)" : "100vw")};
	transition: max-width ${(props) => props.theme.transitions.base};

	@media (max-width: ${(props) => props.theme.breakpoints.md}) {
		max-width: 100vw;
	}
`;
