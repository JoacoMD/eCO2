"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAccount, useSignMessage } from "wagmi";
import { toast } from "sonner";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type AuthUser = Record<string, unknown> & {
  address?: string;
  role?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  loginWithWallet: () => Promise<void>;
  logout: () => Promise<void>;
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
        });
        if (!response.ok) {
          return;
        }
        const me = (await response.json()) as AuthUser;
        if (me?.address) {
          setUser(me);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    void loadSession();
  }, []);

  const loginWithWallet = useCallback(async () => {
    if (!address) {
      toast.error("Conecta tu wallet primero.");
      return;
    }

    try {
      setIsAuthenticating(true);
      const messageResponse = await fetch(`${BACKEND_URL}/auth/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (!messageResponse.ok) {
        throw new Error("No se pudo generar el mensaje de autenticación.");
      }

      const messagePayload = await messageResponse.json();
      const messageToSign =
        messagePayload?.authMessage?.message ??
        messagePayload?.message ??
        messagePayload?.authMessage ??
        messagePayload;

      if (!messageToSign) {
        throw new Error("Mensaje de autenticación inválido.");
      }

      const signature = await signMessageAsync({ message: messageToSign });

      const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature }),
        credentials: "include",
      });

      if (!loginResponse.ok) {
        throw new Error("No se pudo iniciar sesión.");
      }

      const loginData = (await loginResponse.json()) as AuthUser;
      setUser({ address, ...loginData });
      toast.success("Sesión iniciada.");
    } catch (error) {
      console.error(error);
      toast.error("Error al iniciar sesión.");
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, signMessageAsync]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
    }
  }, []);

  const authFetch = useCallback(async (input: RequestInfo, init?: RequestInit) => {
    return fetch(input, { ...init, credentials: "include" });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAuthenticating: isAuthenticating || isCheckingSession,
      loginWithWallet,
      logout,
      authFetch,
    }),
    [user, isAuthenticating, isCheckingSession, loginWithWallet, logout, authFetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
