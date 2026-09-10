import { createContext, useContext, useState, useEffect } from "react";
export const AuthContext = createContext({ token: null as string | null, setToken: (_: string | null) => {} });
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  useEffect(() => { if (token) localStorage.setItem("token", token); else localStorage.removeItem("token"); }, [token]);
  return <AuthContext.Provider value={{ token, setToken }}>{children}</AuthContext.Provider>;
}
