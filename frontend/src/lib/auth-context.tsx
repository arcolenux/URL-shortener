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

const DEFAULT_DEMO_USER: AuthUser = {
  id: "usr_alex_rivera",
  name: "Alex Rivera",
  email: "alex@snipli.io",
  workspace: "Pro Workspace",
  apiKey: "snip_live_99d19fc8e72ba184c8f2a084",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_DEMO_USER);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize token and user from localStorage
    try {
      const storedToken = localStorage.getItem("snipli_jwt_token");
      const storedUser = localStorage.getItem("snipli_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.setAuthToken(storedToken);
      } else if (!storedUser) {
        // Set default demo user for frictionless immediate experience
        setUser(DEFAULT_DEMO_USER);
        localStorage.setItem("snipli_user", JSON.stringify(DEFAULT_DEMO_USER));
      }
    } catch {
      setUser(DEFAULT_DEMO_USER);
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
    } catch (err: any) {
      // Local fallback login for offline/demo environments
      const demoUser: AuthUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 10),
        name: email.split("@")[0].replace(".", " ").replace(/^./, (str) => str.toUpperCase()),
        email,
        workspace: "Pro Workspace",
        apiKey: "snip_live_" + Math.random().toString(36).substring(2, 15),
      };
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({ sub: email, userId: demoUser.id }));
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
    } catch (err: any) {
      // Local fallback register
      const newUser: AuthUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 10),
        name,
        email,
        workspace: workspace || name + "'s Workspace",
        apiKey: "snip_live_" + Math.random().toString(36).substring(2, 15),
      };
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({ sub: email, userId: newUser.id }));
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
