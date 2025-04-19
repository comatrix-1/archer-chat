import React, { createContext, useContext, useEffect, useState } from "react";
import localforage from "localforage";

export type User = {
  id: string;
  email: string;
  role: "jobseeker" | "recruiter";
  name: string;
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: Omit<User, "id"> & { password: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    localforage.getItem<User>("user").then(setUser);
  }, []);

  const login = async (email: string, password: string) => {
    const users = (await localforage.getItem<User[]>("users")) || [];
    const found = users.find(u => u.email === email);
    if (found) {
      setUser(found);
      await localforage.setItem("user", found);
      return true;
    }
    return false;
  };

  const register = async (data: Omit<User, "id"> & { password: string }) => {
    const users = (await localforage.getItem<User[]>("users")) || [];
    if (users.find(u => u.email === data.email)) return false;
    const newUser: User = { ...data, id: Date.now().toString() };
    await localforage.setItem("users", [...users, newUser]);
    setUser(newUser);
    await localforage.setItem("user", newUser);
    return true;
  };

  const logout = async () => {
    setUser(null);
    await localforage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
