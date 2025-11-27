/**
 * @fileoverview Main entry point for Brain Agriculture React application.
 *
 * Initializes React application with strict mode, i18n, renders root component,
 * and mounts to DOM.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";

import "./i18n";

const rootElement = document.querySelector("#root");

if (!rootElement) {
	throw new Error("Root element not found. Ensure index.html has a #root div.");
}

createRoot(rootElement).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
