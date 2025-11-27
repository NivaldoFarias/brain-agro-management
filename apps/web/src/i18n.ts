import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "./locales/en.json";
import ptBRTranslations from "./locales/pt-br.json";

/**
 * i18next configuration for internationalization.
 *
 * Supports English (en) and Brazilian Portuguese (pt-BR).
 * Default language is pt-BR to match the Brazilian market context.
 *
 * @see {@link https://www.i18next.com/|i18next Documentation}
 * @see {@link https://react.i18next.com/|react-i18next Documentation}
 */
void i18n.use(initReactI18next).init({
	resources: {
		"en": { translation: enTranslations },
		"pt-BR": { translation: ptBRTranslations },
	},
	lng: "pt-BR",
	fallbackLng: "en",
	interpolation: { escapeValue: false },
	react: { useSuspense: true },
});

export default i18n;
