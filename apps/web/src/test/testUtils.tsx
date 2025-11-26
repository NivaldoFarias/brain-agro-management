import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";

import type { RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

import { store } from "@/store";
import { theme } from "@/theme";

/**
 * Custom render function that wraps components with all providers.
 *
 * Includes Redux Provider, ThemeProvider, and Router for comprehensive
 * testing of components that depend on these contexts.
 *
 * @param ui React element to render
 * @param options Additional render options
 * @returns Render result from React Testing Library
 *
 * @example
 * ```typescript
 * const { getByText } = renderWithProviders(<MyComponent />);
 * ```
 */
export function renderWithProviders(
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
): ReturnType<typeof render> {
	function Wrapper({ children }: { children: React.ReactNode }): ReactElement {
		return (
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<BrowserRouter>{children}</BrowserRouter>
				</ThemeProvider>
			</Provider>
		);
	}

	return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
export { renderWithProviders as render };
