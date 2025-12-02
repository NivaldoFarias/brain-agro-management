/**
 * Supported application locales
 *
 * Uses underscore notation for backend compatibility (e.g., pt_BR) and
 * standard ISO codes for English.
 */
export enum SupportedLocale {
	/** Portuguese (Brazil) */
	Portuguese = "pt_BR",

	/** English (International) */
	English = "en",
}

/** Default locale for the application */
export const DEFAULT_LOCALE = SupportedLocale.Portuguese;
