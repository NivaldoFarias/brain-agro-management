import { Navigate, useLocation } from "react-router-dom";

import type { ReactElement, ReactNode } from "react";

import { useAuth } from "@/contexts/AuthContext";
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
	const { isAuthenticated, token } = useAuth();
	const location = useLocation();

	console.log("[ProtectedRoute] Checking auth for:", location.pathname);
	console.log("[ProtectedRoute] isAuthenticated:", isAuthenticated);
	console.log("[ProtectedRoute] token exists:", Boolean(token));

	if (!isAuthenticated) {
		console.log("[ProtectedRoute] Not authenticated - redirecting to login");
		// Redirect to login, saving the attempted location
		return <Navigate to={ROUTES.auth.login} state={{ from: location }} replace />;
	}

	console.log("[ProtectedRoute] Authenticated - rendering children");
	return <>{children}</>;
}
