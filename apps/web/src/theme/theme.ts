/**
 * Design tokens and theme configuration for Brain Agriculture application.
 *
 * Defines colors, typography, spacing, breakpoints, and other design system
 * tokens used throughout the application via styled-components ThemeProvider.
 */
export const theme = {
	colors: {
		// Modern agricultural green palette with vibrant accents
		primary: "#10B981", // Emerald green - fresh, modern
		primaryLight: "#34D399",
		primaryDark: "#059669",
		primaryHover: "#0D9668",

		// Warm accent colors for agricultural feel
		secondary: "#F59E0B", // Amber - wheat/harvest
		secondaryLight: "#FBBF24",
		secondaryDark: "#D97706",

		// Additional accent colors
		accent: "#8B5CF6", // Purple for charts/graphs
		accentLight: "#A78BFA",
		accentDark: "#7C3AED",

		// Semantic colors
		success: "#10B981",
		error: "#EF4444",
		warning: "#F59E0B",
		info: "#3B82F6",

		// Backgrounds with modern off-white
		background: "#FAFAF9", // Warm off-white
		backgroundAlt: "#F5F5F4",
		surface: "#FFFFFF",
		surfaceAlt: "#FAFAF9",
		surfaceHover: "#F5F5F4",

		// Text colors with better contrast
		text: "#1C1917", // Warm black
		textSecondary: "#78716C",
		textDisabled: "#D6D3D1",
		textInverse: "#FAFAF9",

		// Borders with subtle warmth
		border: "#E7E5E4",
		borderLight: "#F5F5F4",
		borderFocus: "#10B981",
		divider: "#E7E5E4",

		// Extended grey palette (warm stone tones)
		grey: {
			50: "#FAFAF9",
			100: "#F5F5F4",
			200: "#E7E5E4",
			300: "#D6D3D1",
			400: "#A8A29E",
			500: "#78716C",
			600: "#57534E",
			700: "#44403C",
			800: "#292524",
			900: "#1C1917",
		},
	},

	typography: {
		fontFamily: {
			base: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
			heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
			mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
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
