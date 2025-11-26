import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";

import type { ReactElement } from "react";

import { AppRouter } from "./routes/AppRouter";
import { store } from "./store";
import { GlobalStyles, theme } from "./theme";

/**
 * Root application component for Brain Agriculture.
 *
 * Wraps the application with Redux Provider, ThemeProvider, and global styles.
 * Renders the main router component with all routes.
 */
export function App(): ReactElement {
	return (
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<GlobalStyles />
				<AppRouter />
			</ThemeProvider>
		</Provider>
	);
}
