import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/**
 * Test setup for Brain Agriculture web application.
 *
 * Configures Vitest with React Testing Library, cleanup hooks,
 * and global test utilities.
 */

afterEach(() => {
	cleanup();
});
