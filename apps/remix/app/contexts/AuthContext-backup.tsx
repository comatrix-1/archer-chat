import type { AuthTokenResponsePassword } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { supabase } from "~/utils/supabaseClient";

type User = {
  id: string;
  email: string;
  role: "JOBSEEKER" | "RECRUITER";
  name: string;
  photoURL?: string;
};

type RegisterData = {
  email: string;
  password: string;
  name: string;
  role: "JOBSEEKER" | "RECRUITER";
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signIn: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<AuthTokenResponsePassword>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearRefreshTimeout = useCallback((): void => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  const removeAuthData = useCallback((): void => {
    clearRefreshTimeout();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setAccessToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setError(null);
  }, [clearRefreshTimeout]);

  const scheduleTokenRefresh = useCallback(
    (expiresInMs = 14 * 60 * 1000) => {
      clearRefreshTimeout();
      const refreshTime = Math.max(expiresInMs - 60000, 30000);
      console.log(`Scheduling token refresh in ${refreshTime / 1000} seconds`);

      const refresh = async () => {
        try {
          const storedToken = localStorage.getItem("authToken");
          if (!storedToken) return;

          const response = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log("Token refresh successful");
            saveAuthData(data.accessToken, data.user);
          } else {
            throw new Error("Failed to refresh token");
          }
        } catch (error) {
          console.error("Automatic token refresh failed:", error);
          scheduleTokenRefresh(30000);
        }
      };

      refreshTimeoutRef.current = setTimeout(refresh, refreshTime);

      return () => {
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
      };
    },
    [clearRefreshTimeout]
  );

  const saveAuthData = useCallback((token: string, userData: User) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setAccessToken(token);
    setUser(userData);
    console.log("Auth data saved:", {
      token: `${token.substring(0, 10)}...`,
      userData,
    });
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) {
      console.log("No stored token to refresh");
      return false;
    }

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Token refresh successful");
        saveAuthData(data.accessToken, data.user);
        return true;
      }

      const errorData = await response.json().catch(() => ({}));
      console.error("Token refresh failed:", response.status, errorData);
      throw new Error(errorData.message || "Failed to refresh token");
    } catch (error) {
      console.error("Error during token refresh:", error);
      removeAuthData();
      navigate("/login");
      return false;
    }
  }, [navigate, removeAuthData, saveAuthData]);

  const handleStoredAuthData = useCallback(
    async (storedToken: string | null, storedUserData: string | null) => {
      if (storedToken && storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          console.log(
            "AuthContext - Setting user from localStorage:",
            userData
          );
          setUser(userData);
          setAccessToken(storedToken);
          setIsLoggedIn(true);
          console.log("AuthContext - Using stored auth data");
          return true;
        } catch (error) {
          console.error("AuthContext - Error parsing stored user data:", error);
          removeAuthData();
        }
      }
      return false;
    },
    [removeAuthData]
  );

  const handleTokenRefresh = useCallback(
    async (storedToken: string) => {
      try {
        console.log("AuthContext - Attempting to refresh token...");
        await refreshToken();
        return true;
      } catch (error) {
        console.error("AuthContext - Error during token refresh:", error);
        removeAuthData();
        return false;
      }
    },
    [refreshToken, removeAuthData]
  );

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        console.log("AuthContext - Checking authentication state...");
        const storedToken = localStorage.getItem("authToken");
        const storedUserData = localStorage.getItem("userData");

        console.log("AuthContext - Stored token exists:", !!storedToken);
        console.log("AuthContext - Stored user data exists:", !!storedUserData);

        const hasValidAuth = await handleStoredAuthData(
          storedToken,
          storedUserData
        );

        if (storedToken) {
          await handleTokenRefresh(storedToken);
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
  }, [
    accessToken,
    handleStoredAuthData,
    handleTokenRefresh,
    scheduleTokenRefresh,
    clearRefreshTimeout,
  ]);

  useEffect(() => {
    console.log("User state changed:", user);
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Login failed");
        }

        const data = await response.json();
        setUser(data.user);
        setAccessToken(data.accessToken);
        setIsLoggedIn(true);
        setError(null);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const result = await response.json();
      setUser(result.user);
      setAccessToken(result.accessToken);
      setIsLoggedIn(true);
      setError(null);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      removeAuthData();
      navigate("/login");
    }
  }, [navigate, removeAuthData]);

  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      return await supabase.auth.signInWithPassword({
        email,
        password,
      });
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const contextValue: AuthContextType = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      isLoggedIn,
      loading,
      error,
      accessToken,
      signIn,
      signOut,
    }),
    [
      user,
      login,
      register,
      logout,
      isLoggedIn,
      loading,
      error,
      accessToken,
      signIn,
      signOut,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
