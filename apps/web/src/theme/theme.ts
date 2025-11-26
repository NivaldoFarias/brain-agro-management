/**
 * Design tokens and theme configuration for Brain Agriculture application.
 *
 * Defines colors, typography, spacing, breakpoints, and other design system
 * tokens used throughout the application via styled-components ThemeProvider.
 */
export const theme = {
	colors: {
		primary: "#2E7D32",
		primaryLight: "#4CAF50",
		primaryDark: "#1B5E20",
		secondary: "#FF6F00",
		secondaryLight: "#FF9800",
		secondaryDark: "#E65100",

		success: "#4CAF50",
		error: "#F44336",
		warning: "#FF9800",
		info: "#2196F3",

		background: "#FFFFFF",
		backgroundAlt: "#F5F5F5",
		surface: "#FFFFFF",
		surfaceAlt: "#FAFAFA",

		text: "#212121",
		textSecondary: "#757575",
		textDisabled: "#BDBDBD",

		border: "#E0E0E0",
		borderLight: "#F5F5F5",
		divider: "#E0E0E0",

		grey: {
			50: "#FAFAFA",
			100: "#F5F5F5",
			200: "#EEEEEE",
			300: "#E0E0E0",
			400: "#BDBDBD",
			500: "#9E9E9E",
			600: "#757575",
			700: "#616161",
			800: "#424242",
			900: "#212121",
		},
	},

	typography: {
		fontFamily: {
			base: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
			heading: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
			mono: "'Fira Code', 'Courier New', monospace",
		},
		fontSize: {
			"xs": "0.75rem",
			"sm": "0.875rem",
			"base": "1rem",
			"lg": "1.125rem",
			"xl": "1.25rem",
			"2xl": "1.5rem",
			"3xl": "1.875rem",
			"4xl": "2.25rem",
			"5xl": "3rem",
		},
		fontWeight: {
			light: "300",
			normal: "400",
			medium: "500",
			semibold: "600",
			bold: "700",
		},
		lineHeight: {
			tight: "1.25",
			normal: "1.5",
			relaxed: "1.75",
		},
	},

	spacing: {
		"xs": "0.25rem",
		"sm": "0.5rem",
		"md": "1rem",
		"lg": "1.5rem",
		"xl": "2rem",
		"2xl": "3rem",
		"3xl": "4rem",
		"4xl": "6rem",
	},

	breakpoints: {
		"xs": "320px",
		"sm": "640px",
		"md": "768px",
		"lg": "1024px",
		"xl": "1280px",
		"2xl": "1536px",
	},

	borderRadius: {
		"none": "0",
		"sm": "0.125rem",
		"base": "0.25rem",
		"md": "0.375rem",
		"lg": "0.5rem",
		"xl": "0.75rem",
		"2xl": "1rem",
		"full": "9999px",
	},

	shadows: {
		sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
		base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
		md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
		lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
		xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
		inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
	},

	transitions: {
		fast: "150ms ease-in-out",
		base: "200ms ease-in-out",
		slow: "300ms ease-in-out",
	},

	zIndex: {
		dropdown: "1000",
		sticky: "1020",
		fixed: "1030",
		backdrop: "1040",
		modal: "1050",
		popover: "1060",
		tooltip: "1070",
		toast: "1080",
	},
} as const;

export type Theme = typeof theme;
