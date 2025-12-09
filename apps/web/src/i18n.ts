import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "./locales/en.json";
import ptBRTranslations from "./locales/pt-br.json";

/**
 * Typed translation resources with const assertion for type safety.
 *
 * The 'as const' assertion ensures TypeScript treats the structure as
 * literal types, enabling full autocomplete and type checking.
 */
export const resources = {
	"en": { translation: enTranslations },
	"pt-BR": { translation: ptBRTranslations },
} as const;

/**
 * i18next configuration for internationalization.
 *
 * Supports English (en) and Brazilian Portuguese (pt-BR).
 * Default language is pt-BR to match the Brazilian market context.
 *
 * Type-safe translations enabled via:
 * - Selector API (`enableSelector: "optimize"`)
 * - Resource type augmentation in `@types/i18next.d.ts`
 * - Usage: `t($ => $.common.loading)` instead of `t($ => $.common.loading)`
 *
 * @see {@link https://www.i18next.com/overview/typescript|i18next TypeScript Guide}
 * @see {@link https://react.i18next.com/latest/typescript|react-i18next TypeScript}
 */
void i18n.use(initReactI18next).init({
	resources,
	lng: "pt-BR",
	fallbackLng: "en",
	interpolation: { escapeValue: false },
	react: { useSuspense: true },
	returnNull: false,
});

export default i18n;
