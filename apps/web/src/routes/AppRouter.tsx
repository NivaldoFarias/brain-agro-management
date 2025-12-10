import { lazy, Suspense } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import type { ReactElement } from "react";

import { ROUTES } from "@agro/shared/constants";

import { LoadingState, ProtectedRoute } from "@/components/molecules";
import { MainLayout } from "@/components/templates/MainLayout";

/**
 * Lazy-loaded page components for code splitting.
 */
const LoginPage = lazy(() => import("@/pages").then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import("@/pages").then((module) => ({ default: module.DashboardPage })));
const ProducersPage = lazy(() => import("@/pages").then((module) => ({ default: module.ProducersPage })));
const CreateProducerPage = lazy(() => import("@/pages").then((module) => ({ default: module.CreateProducerPage })));
const EditProducerPage = lazy(() => import("@/pages").then((module) => ({ default: module.EditProducerPage })));
const FarmsPage = lazy(() => import("@/pages").then((module) => ({ default: module.FarmsPage })));
const CreateFarmPage = lazy(() => import("@/pages").then((module) => ({ default: module.CreateFarmPage })));
const EditFarmPage = lazy(() => import("@/pages").then((module) => ({ default: module.EditFarmPage })));
const NotFoundPage = lazy(() => import("@/pages").then((module) => ({ default: module.NotFoundPage })));

/**
 * Main router configuration for Brain Agriculture application.
 *
 * Defines application routes with lazy loading for code splitting,
 * authentication protection, and fallback loading states.
 * All protected routes require authentication.
 *
 * @see {@link https://react.dev/reference/react/lazy|React.lazy Documentation}
 */
export function AppRouter(): ReactElement {
	return (
		<Router>
			<Suspense fallback={<LoadingState fullPage message="Loading page..." />}>
				<Routes>
					{/* Public routes */}
					<Route path={ROUTES.web.auth.login} element={<LoginPage />} />

					{/* Protected routes with layout */}
					<Route path={ROUTES.web.home} element={<Navigate to={ROUTES.web.dashboard} replace />} />
					<Route
						path={ROUTES.web.dashboard}
						element={
							<ProtectedRoute>
								<MainLayout>
									<DashboardPage />
								</MainLayout>
							</ProtectedRoute>
						}
					/>
					<Route
						path={ROUTES.web.producers.list}
						element={
							<ProtectedRoute>
								<MainLayout>
									<ProducersPage />
								</MainLayout>
							</ProtectedRoute>
						}
					/>
					<Route
						path={ROUTES.web.producers.create}
						element={
							<ProtectedRoute>
								<MainLayout>
									<CreateProducerPage />
								</MainLayout>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/producers/:id/edit"
						element={
							<ProtectedRoute>
								<MainLayout>
									<EditProducerPage />
								</MainLayout>
							</ProtectedRoute>
						}
					/>
					<Route
						path={ROUTES.web.farms.list}
						element={
							<ProtectedRoute>
								<MainLayout>
									<FarmsPage />
								</MainLayout>
							</ProtectedRoute>
						}
					/>
					<Route
						path={ROUTES.web.farms.create}
						element={
							<ProtectedRoute>
								<MainLayout>
									<CreateFarmPage />
								</MainLayout>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/farms/:id/edit"
						element={
							<ProtectedRoute>
								<MainLayout>
									<EditFarmPage />
								</MainLayout>
							</ProtectedRoute>
						}
					/>
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
			</Suspense>
		</Router>
	);
}
