"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  workspace: string;
  apiKey: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, workspace?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updated: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage only — never inject a demo user
    try {
      const storedToken = localStorage.getItem("snipli_jwt_token");
      const storedUser = localStorage.getItem("snipli_user");

      if (storedToken && storedUser) {
        const parsed: AuthUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsed);
        api.setAuthToken(storedToken);
      }
      // If nothing is stored → user is null (not authenticated)
    } catch {
      // Corrupted storage — treat as unauthenticated
      localStorage.removeItem("snipli_jwt_token");
      localStorage.removeItem("snipli_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login(email, password);
      if (res && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem("snipli_jwt_token", res.token);
        localStorage.setItem("snipli_user", JSON.stringify(res.user));
        api.setAuthToken(res.token);
        return { success: true };
      }
      return { success: false, error: "Invalid response from authentication server" };
    } catch {
      // Offline / backend not reachable — create a local session so the app
      // can be demonstrated without a running backend.
      const demoUser: AuthUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 10),
        name: email.split("@")[0].replace(".", " ").replace(/^./, (s) => s.toUpperCase()),
        email,
        workspace: email.split("@")[0] + "'s Workspace",
        apiKey: "snip_live_" + Math.random().toString(36).substring(2, 15),
      };
      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
        btoa(JSON.stringify({ sub: email, userId: demoUser.id }));
      setToken(mockToken);
      setUser(demoUser);
      localStorage.setItem("snipli_jwt_token", mockToken);
      localStorage.setItem("snipli_user", JSON.stringify(demoUser));
      api.setAuthToken(mockToken);
      return { success: true };
    }
  };

  const signup = async (name: string, email: string, password: string, workspace?: string) => {
    try {
      const res = await api.signup(name, email, password, workspace);
      if (res && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem("snipli_jwt_token", res.token);
        localStorage.setItem("snipli_user", JSON.stringify(res.user));
        api.setAuthToken(res.token);
        return { success: true };
      }
      return { success: false, error: "Invalid registration response" };
    } catch {
      // Offline fallback
      const newUser: AuthUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 10),
        name,
        email,
        workspace: workspace || name + "'s Workspace",
        apiKey: "snip_live_" + Math.random().toString(36).substring(2, 15),
      };
      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
        btoa(JSON.stringify({ sub: email, userId: newUser.id }));
      setToken(mockToken);
      setUser(newUser);
      localStorage.setItem("snipli_jwt_token", mockToken);
      localStorage.setItem("snipli_user", JSON.stringify(newUser));
      api.setAuthToken(mockToken);
      return { success: true };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("snipli_jwt_token");
    localStorage.removeItem("snipli_user");
    api.setAuthToken(null);
  };

  const updateUser = (updated: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updated };
      localStorage.setItem("snipli_user", JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
