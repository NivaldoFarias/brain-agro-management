import { createContext, useCallback, useContext, useEffect, useState } from "react";

import type { ReactElement, ReactNode } from "react";

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
interface AuthContextValue {
	/** Current authentication token */
	token: string | null;

	/** Current authenticated user */
	user: User | null;

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
	const [token, setToken] = useState<string | null>(() => {
		try {
			const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
			console.log("[AuthProvider] Initial token from localStorage:", storedToken ? "EXISTS" : "NULL");
			return storedToken;
		} catch (error) {
			console.error("[AuthProvider] Failed to read token from localStorage:", error);
			return null;
		}
	});

	const [user, setUser] = useState<User | null>(() => {
		try {
			const storedUser = localStorage.getItem("brain_ag_user");
			const parsedUser = storedUser ? (JSON.parse(storedUser) as User) : null;
			console.log("[AuthProvider] Initial user from localStorage:", parsedUser);
			return parsedUser;
		} catch (error) {
			console.error("[AuthProvider] Failed to read user from localStorage:", error);
			return null;
		}
	});

	const login = useCallback((accessToken: string, email: string) => {
		console.log("[AuthProvider] login() called with email:", email);
		try {
			localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
			localStorage.setItem("brain_ag_user", JSON.stringify({ email }));
			console.log("[AuthProvider] Saved to localStorage successfully");

			setToken(accessToken);
			setUser({ email });
			console.log("[AuthProvider] State updated - token and user set");
		} catch (error) {
			console.error("[AuthProvider] Failed to save authentication data:", error);
		}
	}, []);

	const logout = useCallback(() => {
		console.log("[AuthProvider] logout() called");
		try {
			localStorage.removeItem(TOKEN_STORAGE_KEY);
			localStorage.removeItem("brain_ag_user");
			setToken(null);
			setUser(null);
			console.log("[AuthProvider] Logged out successfully");
		} catch (error) {
			console.error("[AuthProvider] Failed to clear authentication data:", error);
		}
	}, []);

	// Synchronize state with localStorage on mount
	useEffect(() => {
		const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
		const storedUser = localStorage.getItem("brain_ag_user");

		console.log("[AuthProvider] useEffect - syncing with localStorage");
		console.log("[AuthProvider] localStorage token:", storedToken ? "EXISTS" : "NULL");
		console.log("[AuthProvider] localStorage user:", storedUser ? "EXISTS" : "NULL");
		console.log("[AuthProvider] Current state token:", token ? "EXISTS" : "NULL");
		console.log("[AuthProvider] Current state user:", user);

		if (storedToken && !token) {
			console.log("[AuthProvider] Restoring token from localStorage");
			setToken(storedToken);
		}
		if (storedUser && !user) {
			try {
				const parsedUser = JSON.parse(storedUser) as User;
				console.log("[AuthProvider] Restoring user from localStorage:", parsedUser);
				setUser(parsedUser);
			} catch (error) {
				console.error("[AuthProvider] Failed to parse stored user:", error);
			}
		}
	}, [token, user]);

	const isAuthenticated = Boolean(token);
	console.log("[AuthProvider] isAuthenticated:", isAuthenticated, "| token:", token ? "EXISTS" : "NULL");

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
 * @returns Authentication token or null if not authenticated
 */
export function getAuthToken(): string | null {
	try {
		return localStorage.getItem(TOKEN_STORAGE_KEY);
	} catch {
		return null;
	}
}
