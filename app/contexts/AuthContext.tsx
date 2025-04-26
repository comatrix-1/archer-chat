import React, { createContext, useContext, useEffect, useState } from "react";

export type User = {
  id: string;
  email: string;
  role: "JOBSEEKER" | "RECRUITER";
  name: string;
  password: string;
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: Omit<User, "id"> & { password: string; confirmPassword: string }) => Promise<boolean>;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Always initialize to false for SSR safety
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem('token'));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.user && data.token) {
        setUser(data.user);
        console.log('Login successful, user:', data.user);
        console.log('Login successful, token:', data.token);
        localStorage.setItem('token', data.token); // Store JWT
        setIsLoggedIn(true);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  const register = async (data: Omit<User, "id"> & { password: string; confirmPassword: string }) => {
    try {
      if (data.password !== data.confirmPassword) {
        return false;
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resp = await res.json();
      if (res.ok && resp.user) {
        setUser(resp.user);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token'); // Remove JWT
    setIsLoggedIn(false);
    // Optionally, clear cookie/session here
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoggedIn }}>
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
