import { createContext, useCallback, useContext, useState } from "react";

import type { ReactElement, ReactNode } from "react";

import { Logger } from "@/utils/logger.util";

import { useLocalStorageContext } from "./LocalStorageContext";

const logger = new Logger({ context: "AuthProvider" });

/**
 * Token storage key in localStorage.
 */
const TOKEN_STORAGE_KEY = "brain_ag_auth_token";

/**
 * User information stored in auth context.
 */
interface User {
	email: string;
}

/**
 * Auth context value interface.
 */
export interface AuthContextValue {
	/** Current authentication token */
	token: string | undefined;

	/** Current authenticated user */
	user: User | undefined;

	/** Whether user is authenticated */
	isAuthenticated: boolean;

	/** Login function to set token and user */
	login: (token: string, email: string) => void;

	/** Logout function to clear token and user */
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Props for AuthProvider component.
 */
interface AuthProviderProps {
	children: ReactNode;
}

/**
 * Authentication provider component.
 *
 * Manages authentication state, token storage, and provides
 * login/logout functionality to the entire application.
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps): ReactElement {
	const storage = useLocalStorageContext();

	const [token, setToken] = useState<string | undefined>(() => {
		const storedToken = storage.getItem<string>(TOKEN_STORAGE_KEY);

		logger.debug("Initial token from localStorage:", storedToken ? "EXISTS" : "NULL");

		return storedToken;
	});

	const [user, setUser] = useState<User | undefined>(() => {
		const parsedUser = storage.getItem<User>("brain_ag_user");

		logger.debug("Initial user from localStorage:", parsedUser);

		return parsedUser;
	});

	const login = useCallback(
		(accessToken: string, email: string) => {
			logger.debug("login() called with email:", email);

			storage.setItem(TOKEN_STORAGE_KEY, accessToken);
			storage.setItem("brain_ag_user", { email });

			logger.debug("Saved to localStorage successfully");

			setToken(accessToken);
			setUser({ email });

			logger.debug("State updated - token and user set");
		},
		[storage],
	);

	const logout = useCallback(() => {
		logger.debug("logout() called");

		storage.removeItem(TOKEN_STORAGE_KEY);
		storage.removeItem("brain_ag_user");
		setToken(undefined);
		setUser(undefined);

		logger.debug("Logged out successfully");
	}, [storage]);

	const isAuthenticated = Boolean(token);
	logger.debug("isAuthenticated:", isAuthenticated, "| token:", token ? "EXISTS" : "NULL");

	const value: AuthContextValue = {
		token,
		user,
		isAuthenticated,
		login,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context.
 *
 * @throws {Error} If used outside AuthProvider
 *
 * @example
 * ```tsx
 * const { isAuthenticated, login, logout } = useAuth();
 * ```
 */
export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within AuthProvider");
	}

	return context;
}

/**
 * Gets the current authentication token from localStorage.
 *
 * This function directly accesses localStorage and is primarily used
 * for base API configuration. Use `useAuth()` hook in components instead.
 *
 * @returns Authentication token or `undefined` if not authenticated
 */
export function getAuthToken(): string | undefined {
	try {
		const item = window.localStorage.getItem(TOKEN_STORAGE_KEY);

		const parsed = JSON.parse(item ?? "null") as unknown;

		return typeof parsed === "string" ? parsed : undefined;
	} catch {
		return undefined;
	}
}
