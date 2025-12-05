import { Theme } from "@radix-ui/themes";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";

import type { ReactElement } from "react";

import "@radix-ui/themes/styles.css";

import { CitiesDataLoader } from "./components/organisms/CitiesDataLoader";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LocalStorageProvider } from "./contexts/LocalStorageContext";
import { ToastProvider } from "./contexts/ToastContext";
import { AppRouter } from "./routes/AppRouter";
import { store } from "./store";
import { GlobalStyles, theme } from "./theme";

/**
 * Inner app component that conditionally loads cities data.
 *
 * Wraps AppRouter with {@link CitiesDataLoader} only when user is authenticated
 * to avoid unnecessary API calls on the login page.
 */
function AppContent(): ReactElement {
	const { isAuthenticated } = useAuth();

	return (
		<>
			<GlobalStyles />
			{isAuthenticated ?
				<CitiesDataLoader>
					<AppRouter />
				</CitiesDataLoader>
			:	<AppRouter />}
		</>
	);
}

/**
 * Root application component for Brain Agriculture.
 *
 * Wraps the application with Redux Provider, {@link LocalStorageProvider}, {@link AuthProvider},
 * {@link ToastProvider}, {@link ThemeProvider} (styled-components), Radix UI Theme, and global styles.
 * Conditionally loads cities data when authenticated for form support.
 */
export function App(): ReactElement {
	return (
		<Provider store={store}>
			<LocalStorageProvider>
				<AuthProvider>
					<ThemeProvider theme={theme}>
						<Theme accentColor="green" grayColor="sage" radius="medium" scaling="100%">
							<ToastProvider>
								<AppContent />
							</ToastProvider>
						</Theme>
					</ThemeProvider>
				</AuthProvider>
			</LocalStorageProvider>
		</Provider>
	);
}
