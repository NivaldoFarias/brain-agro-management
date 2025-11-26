import { Suspense } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import type { ReactElement } from "react";

import { ROUTES } from "@/utils/";

/**
 * Main router configuration for Brain Agriculture application.
 *
 * Defines application routes with lazy loading for code splitting
 * and fallback loading states.
 */
export function AppRouter(): ReactElement {
	return (
		<Router>
			<Suspense fallback={<div>Loading...</div>}>
				<Routes>
					<Route path={ROUTES.home} element={<Navigate to={ROUTES.dashboard} replace />} />
					<Route path={ROUTES.dashboard} element={<div>Dashboard Page</div>} />
					<Route path={ROUTES.producers.list} element={<div>Producers List</div>} />
					<Route path={ROUTES.producers.create} element={<div>Create Producer</div>} />
					<Route path={ROUTES.farms.list} element={<div>Farms List</div>} />
					<Route path={ROUTES.farms.create} element={<div>Create Farm</div>} />
					<Route path="*" element={<div>404 Not Found</div>} />
				</Routes>
			</Suspense>
		</Router>
	);
}
