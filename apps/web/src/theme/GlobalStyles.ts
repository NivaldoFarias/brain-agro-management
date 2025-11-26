import { createGlobalStyle } from "styled-components";

/**
 * Global styles for Brain Agriculture application.
 *
 * Provides CSS reset, base typography, and global element styling
 * using styled-components createGlobalStyle API.
 */
export const GlobalStyles = createGlobalStyle`
	*,
	*::before,
	*::after {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	html {
		font-size: 16px;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	body {
		font-family: ${(props) => props.theme.typography.fontFamily.base};
		font-size: ${(props) => props.theme.typography.fontSize.base};
		font-weight: ${(props) => props.theme.typography.fontWeight.normal};
		line-height: ${(props) => props.theme.typography.lineHeight.normal};
		color: ${(props) => props.theme.colors.text};
		background-color: ${(props) => props.theme.colors.background};
	}

	#root {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	h1, h2, h3, h4, h5, h6 {
		font-family: ${(props) => props.theme.typography.fontFamily.heading};
		font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
		line-height: ${(props) => props.theme.typography.lineHeight.tight};
		color: ${(props) => props.theme.colors.text};
	}

	h1 {
		font-size: ${(props) => props.theme.typography.fontSize["4xl"]};
	}

	h2 {
		font-size: ${(props) => props.theme.typography.fontSize["3xl"]};
	}

	h3 {
		font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
	}

	h4 {
		font-size: ${(props) => props.theme.typography.fontSize.xl};
	}

	h5 {
		font-size: ${(props) => props.theme.typography.fontSize.lg};
	}

	h6 {
		font-size: ${(props) => props.theme.typography.fontSize.base};
	}

	a {
		color: ${(props) => props.theme.colors.primary};
		text-decoration: none;
		transition: color ${(props) => props.theme.transitions.fast};

		&:hover {
			color: ${(props) => props.theme.colors.primaryDark};
		}
	}

	button {
		font-family: inherit;
		cursor: pointer;
	}

	input,
	textarea,
	select {
		font-family: inherit;
		font-size: inherit;
	}

	ul, ol {
		list-style: none;
	}

	img {
		max-width: 100%;
		height: auto;
	}
`;
