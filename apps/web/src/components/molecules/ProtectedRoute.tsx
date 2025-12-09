import { Navigate, useLocation } from "react-router-dom";

import type { ReactElement, ReactNode } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useLogger } from "@/hooks";
import { ROUTES } from "@/utils/";

/**
 * Props for ProtectedRoute component.
 */
export interface ProtectedRouteProps {
	/** Child components to render if authenticated */
	children: ReactNode;
}

/**
 * Route wrapper that requires authentication.
 *
 * Redirects to login page if user is not authenticated,
 * preserving the attempted location for post-login redirect.
 *
 * @example
 * ```tsx
 * <Route
 *   path="/dashboard"
 *   element={
 *     <ProtectedRoute>
 *       <DashboardPage />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 */
export function ProtectedRoute({ children }: ProtectedRouteProps): ReactElement {
	const logger = useLogger(ProtectedRoute.name);
	const { isAuthenticated, token } = useAuth();
	const location = useLocation();

	logger.debug("Checking auth for:", location.pathname);
	logger.debug("isAuthenticated:", isAuthenticated);
	logger.debug("token exists:", Boolean(token));

	if (!isAuthenticated) {
		logger.debug("Not authenticated - redirecting to login");

		return <Navigate to={ROUTES.auth.login} state={{ from: location }} replace />;
	}

	logger.debug("Authenticated - rendering children");
	return <>{children}</>;
}
