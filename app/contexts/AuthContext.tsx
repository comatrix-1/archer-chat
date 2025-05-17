import React, { createContext, useContext, useEffect, useState } from "react";
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
    data: Omit<User, "id"> & { password: string; confirmPassword: string }
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
  const navigate = useNavigate();

  // Get CSRF token from headers
  const getCsrfToken = () => {
    const csrfToken = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("csrfToken="))
      ?.split("=")[1];
    console.log('CSRF token:', csrfToken);
    return csrfToken;
  };

  // Save JWT token and user data to localStorage
  const saveAuthData = (token: string, userData: User) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setAccessToken(token);
    setUser(userData);
    console.log('Auth data saved:', { token: token.substring(0, 10) + '...', userData });
  };

  // Remove JWT token and user data from localStorage
  const removeAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setAccessToken(null);
    setUser(null);
    console.log('Auth data removed');
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth...');
        
        // First try to get CSRF token
        const csrfToken = getCsrfToken();
        if (!csrfToken) {
          console.log('No CSRF token, getting new one...');
          const response = await fetch('/api/auth/check-csrf', {
            credentials: 'include'
          });
          if (!response.ok) {
            throw new Error('Failed to get CSRF token');
          }
        }

        // Try to get the JWT token from localStorage
        const storedToken = localStorage.getItem('authToken');
        const storedUserData = localStorage.getItem('userData');
        console.log('Stored token:', storedToken);
        console.log('Stored user data:', storedUserData);

        if (storedToken && storedUserData) {
          // Token exists and we have user data
          setUser(JSON.parse(storedUserData));
          setIsLoggedIn(true);
          console.log('Using stored auth data');
          return;
        }

        // If we don't have valid auth data, try to refresh token
        if (storedToken) {
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
            'X-CSRF-Token': getCsrfToken() || ''
          };

          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
            headers
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Refresh successful, user:', data.user);
            saveAuthData(data.accessToken, data.user);
          } else {
            console.log('Refresh failed, clearing auth data');
            removeAuthData();
          }
        } else {
          console.log('No auth data found');
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
        console.log('Auth check complete, loading:', loading);
      }
    };

    checkAuth();
  }, []);

  // Handle auth state updates
  useEffect(() => {
    console.log('User state changed:', user);
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      console.log('Login attempt...');
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        const response = await fetch('/api/auth/check-csrf', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to get CSRF token');
        }
      }

      const headers = {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken() || ''
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
      console.log('Login successful, user:', data.user);
      saveAuthData(data.accessToken, data.user);
      setError(null);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login");
      return false;
    }
  };

  const register = async (
    data: Omit<User, "id"> & { password: string; confirmPassword: string }
  ) => {
    try {
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
    }
  };

  const logout = async () => {
    try {
      console.log('Logout attempt...');
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        setError("CSRF token not found");
        return;
      }

      const headers = {
        'X-CSRF-Token': csrfToken
      };

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers,
        credentials: "include"
      });

      if (response.ok) {
        console.log('Logout successful');
        removeAuthData();
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isLoggedIn, loading, error, accessToken }}
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
