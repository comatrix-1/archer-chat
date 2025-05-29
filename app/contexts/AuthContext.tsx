import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

export type User = {
	id: string;
	email: string;
	role: "JOBSEEKER" | "RECRUITER";
	name: string;
};

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<boolean>;
	register: (
		data: Omit<User, "id" | "role"> & {
			password: string;
			confirmPassword: string;
		},
	) => Promise<boolean>;
	logout: () => void;
	isLoggedIn: boolean;
	loading: boolean;
	error: string | null;
	accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const navigate = useNavigate();

	const getCsrfToken = () => {
		const csrfToken = document.cookie
			.split(";")
			.find((cookie) => cookie.trim().startsWith("csrfToken="))
			?.split("=")[1];
		console.log("CSRF token:", csrfToken);
		return csrfToken;
	};

	const saveAuthData = (token: string, userData: User) => {
		localStorage.setItem("authToken", token);
		localStorage.setItem("userData", JSON.stringify(userData));
		setAccessToken(token);
		setUser(userData);
		scheduleTokenRefresh(14 * 60 * 1000);
		console.log("Auth data saved:", {
			token: token.substring(0, 10) + "...",
			userData,
		});
	};

	const removeAuthData = () => {
		clearRefreshTimeout();
		localStorage.removeItem("authToken");
		localStorage.removeItem("userData");
		setAccessToken(null);
		setUser(null);
		console.log("Auth data removed");
	};

	const clearRefreshTimeout = () => {
		if (refreshTimeoutRef.current) {
			clearTimeout(refreshTimeoutRef.current);
			refreshTimeoutRef.current = null;
		}
	};

	const scheduleTokenRefresh = (expiresInMs: number = 14 * 60 * 1000) => {
		clearRefreshTimeout();
		const refreshTime = Math.max(expiresInMs - 60000, 30000);
		console.log(`Scheduling token refresh in ${refreshTime / 1000} seconds`);
		refreshTimeoutRef.current = setTimeout(async () => {
			try {
				await refreshToken();
			} catch (error) {
				console.error("Automatic token refresh failed:", error);
				scheduleTokenRefresh(30000);
			}
		}, refreshTime);
	};

	const refreshToken = async (): Promise<boolean> => {
		const storedToken = localStorage.getItem("authToken");
		if (!storedToken) {
			console.log("No stored token to refresh");
			return false;
		}

		try {
			const csrfToken = getCsrfToken();
			if (!csrfToken) {
				throw new Error("No CSRF token available for refresh");
			}

			const response = await fetch("/api/auth/refresh", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${storedToken}`,
					"X-CSRF-Token": csrfToken,
				},
			});

			if (response.ok) {
				const data = await response.json();
				console.log("Token refresh successful");
				saveAuthData(data.accessToken, data.user);
				return true;
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error("Token refresh failed:", response.status, errorData);
				throw new Error(errorData.message || "Failed to refresh token");
			}
		} catch (error) {
			console.error("Error during token refresh:", error);
			removeAuthData();
			navigate("/login");
			return false;
		}
	};

	useEffect(() => {
		let isMounted = true;

		const checkAuth = async () => {
			try {
				console.log("AuthContext - Checking authentication state...");

				const storedToken = localStorage.getItem("authToken");
				const storedUserData = localStorage.getItem("userData");

				console.log("AuthContext - Stored token exists:", !!storedToken);
				console.log("AuthContext - Stored user data exists:", !!storedUserData);

				if (storedToken && storedUserData) {
					try {
						const userData = JSON.parse(storedUserData);
						console.log(
							"AuthContext - Setting user from localStorage:",
							userData,
						);

						if (isMounted) {
							setUser(userData);
							setAccessToken(storedToken);
							setIsLoggedIn(true);
							console.log("AuthContext - Using stored auth data");
						}
					} catch (error) {
						console.error(
							"AuthContext - Error parsing stored user data:",
							error,
						);

						if (isMounted) {
							removeAuthData();
						}
					}
				}

				let csrfToken = getCsrfToken();
				if (!csrfToken) {
					console.log("AuthContext - No CSRF token, getting new one...");
					const response = await fetch("/api/auth/check-csrf", {
						credentials: "include",
					});
					if (!response.ok) {
						throw new Error("Failed to get CSRF token");
					}
					csrfToken = getCsrfToken();
					console.log(
						"AuthContext - Got new CSRF token:",
						csrfToken ? "yes" : "no",
					);
				}

				if (storedToken) {
					console.log("AuthContext - Attempting to refresh token...");
					try {
						await refreshToken();
					} catch (error) {
						console.error("AuthContext - Error during token refresh:", error);
						if (isMounted) {
							removeAuthData();
						}
					}
				} else if (isMounted) {
					console.log("AuthContext - No stored token found");
					setIsLoggedIn(false);
					setUser(null);
				}
			} catch (error) {
				console.error("Auth check failed:", error);
				if (isMounted) {
					setIsLoggedIn(false);
					setUser(null);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
					console.log("Auth check complete");
				}
			}
		};

		checkAuth();

		if (accessToken) {
			scheduleTokenRefresh();
		}

		return () => {
			isMounted = false;
			clearRefreshTimeout();
		};
	}, [accessToken]);

	useEffect(() => {
		console.log("User state changed:", user);
		if (user) {
			setIsLoggedIn(true);
		} else {
			setIsLoggedIn(false);
		}
	}, [user]);

	const login = async (email: string, password: string) => {
		try {
			console.log("Login attempt...");
			setLoading(true);
			const csrfToken = getCsrfToken();
			if (!csrfToken) {
				const response = await fetch("/api/auth/check-csrf", {
					credentials: "include",
				});
				if (!response.ok) {
					throw new Error("Failed to get CSRF token");
				}
			}

			const headers = {
				"Content-Type": "application/json",
				"X-CSRF-Token": getCsrfToken() || "",
			};

			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers,
				body: JSON.stringify({ email, password }),
				credentials: "include",
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.log("Login failed:", errorData);
				setError(errorData.error || "Login failed");
				return false;
			}

			const data = await response.json();
			console.log("Login successful, user:", data.user);
			saveAuthData(data.accessToken, data.user);
			setError(null);
			return true;
		} catch (error) {
			console.error("Login error:", error);
			setError("An error occurred during login");
			return false;
		} finally {
			setLoading(false);
		}
	};

	const register = async (
		data: Omit<User, "id" | "role"> & {
			password: string;
			confirmPassword: string;
		},
	) => {
		try {
			setLoading(true);
			if (data.password !== data.confirmPassword) {
				setError("Passwords do not match");
				return false;
			}

			const csrfToken = getCsrfToken();
			if (!csrfToken) {
				setError("CSRF token not found");
				return false;
			}

			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": csrfToken,
				},
				body: JSON.stringify(data),
				credentials: "include",
			});

			if (!response.ok) {
				const errorData = await response.json();
				setError(errorData.error || "Registration failed");
				return false;
			}

			const userData = await response.json();
			saveAuthData(userData.accessToken, userData.user);
			setError(null);
			return true;
		} catch (error) {
			setError("An error occurred during registration");
			return false;
		} finally {
			setLoading(false);
		}
	};

	const logout = async () => {
		try {
			console.log("Logout attempt...");
			const csrfToken = getCsrfToken();
			if (!csrfToken) {
				setError("CSRF token not found");
				return;
			}

			const headers = {
				"X-CSRF-Token": csrfToken,
			};

			const response = await fetch("/api/auth/logout", {
				method: "POST",
				headers,
				credentials: "include",
			});

			if (response.ok) {
				console.log("Logout successful");
				removeAuthData();
				navigate("/login");
			}
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				register,
				logout,
				isLoggedIn,
				loading,
				error,
				accessToken,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
