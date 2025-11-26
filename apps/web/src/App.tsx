import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";

import type { ReactElement } from "react";

import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { AppRouter } from "./routes/AppRouter";
import { store } from "./store";
import { GlobalStyles, theme } from "./theme";

/**
 * Root application component for Brain Agriculture.
 *
 * Wraps the application with Redux Provider, AuthProvider, ToastProvider,
 * ThemeProvider, and global styles. Renders the main router component with all routes.
 */
export function App(): ReactElement {
	return (
		<Provider store={store}>
			<AuthProvider>
				<ThemeProvider theme={theme}>
					<ToastProvider>
						<GlobalStyles />
						<AppRouter />
					</ToastProvider>
				</ThemeProvider>
			</AuthProvider>
		</Provider>
	);
}
