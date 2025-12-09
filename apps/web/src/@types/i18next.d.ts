import "i18next";

import type { resources } from "../i18n";

/**
 * Type augmentation for i18next to enable type-safe translations.
 *
 * This declaration file extends i18next's CustomTypeOptions interface
 * to provide full TypeScript support including:
 * - Autocomplete for all translation keys
 * - Type checking for missing or invalid keys
 * - Type-safe interpolation parameters
 * - Refactoring support across the codebase
 *
 * @see {@link https://www.i18next.com/overview/typescript|i18next TypeScript Guide}
 */
declare module "i18next" {
    interface CustomTypeOptions {
        /** Use the English translations as the type reference */
        resources: (typeof resources)["en"];

        /** Enable the new selector API for better type inference */
        enableSelector: "optimize";

        /** Return null when translation is missing (default behavior) */
        returnNull: false;
    }
}
