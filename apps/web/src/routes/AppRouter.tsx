import { lazy, Suspense } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import type { ReactElement } from "react";

import { LoadingState } from "@/components/molecules";
import { ROUTES } from "@/utils/";

/**
 * Lazy-loaded page components for code splitting.
 */
const DashboardPage = lazy(() => import("@/pages").then((module) => ({ default: module.DashboardPage })));
const ProducersPage = lazy(() => import("@/pages").then((module) => ({ default: module.ProducersPage })));
const CreateProducerPage = lazy(() => import("@/pages").then((module) => ({ default: module.CreateProducerPage })));
const FarmsPage = lazy(() => import("@/pages").then((module) => ({ default: module.FarmsPage })));
const CreateFarmPage = lazy(() => import("@/pages").then((module) => ({ default: module.CreateFarmPage })));
const NotFoundPage = lazy(() => import("@/pages").then((module) => ({ default: module.NotFoundPage })));

/**
 * Main router configuration for Brain Agriculture application.
 *
 * Defines application routes with lazy loading for code splitting
 * and fallback loading states. All route components are loaded on demand
 * to optimize initial bundle size.
 *
 * @see {@link https://react.dev/reference/react/lazy|React.lazy Documentation}
 */
export function AppRouter(): ReactElement {
	return (
		<Router>
			<Suspense fallback={<LoadingState fullPage message="Loading page..." />}>
				<Routes>
					<Route path={ROUTES.home} element={<Navigate to={ROUTES.dashboard} replace />} />
					<Route path={ROUTES.dashboard} element={<DashboardPage />} />
					<Route path={ROUTES.producers.list} element={<ProducersPage />} />
					<Route path={ROUTES.producers.create} element={<CreateProducerPage />} />
					<Route path={ROUTES.farms.list} element={<FarmsPage />} />
					<Route path={ROUTES.farms.create} element={<CreateFarmPage />} />
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
			</Suspense>
		</Router>
	);
}
