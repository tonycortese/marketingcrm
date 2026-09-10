import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { api } from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (t: string | null) => void;
  setUser: (u: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState>({
  token: null,
  user: null,
  setToken: () => {},
  setUser: () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token") ?? null);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const mountedRef = useRef(true);

  // Valida il token salvato al montaggio (una sola volta)
  useEffect(() => {
    mountedRef.current = true;
    if (!token) return;
    api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (mountedRef.current && data?.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      });
    return () => { mountedRef.current = false; };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.ok && data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      throw new Error(data.error || "Login fallito");
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    if (!data.ok || !data.user) {
      throw new Error(data.error || "Registrazione fallita");
    }
    // Auto-login dopo registrazione
    const { data: loginRes } = await api.post("/auth/login", { email, password });
    if (loginRes.ok && loginRes.token) {
      setToken(loginRes.token);
      setUser(loginRes.user);
      localStorage.setItem("token", loginRes.token);
      localStorage.setItem("user", JSON.stringify(loginRes.user));
    } else {
      throw new Error(loginRes.error || "Auto-login fallito");
    }
  }, []);

  const logout = useCallback(async () => {
    const t = token;
    try {
      await api.post("/auth/logout", { token: t });
    } catch { /* ignora errori */ }
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, setToken, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
