import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../lib/api-context";

export default function Login() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect se già loggato — dentro useEffect, non nel render
  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Compila tutti i campi");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Errore durante il login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .login-enter {
          animation: fadeInUp 0.45s ease-out both;
        }
        .login-input {
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .login-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          outline: none;
        }
        .login-btn {
          transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
          cursor: pointer;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#000",
          position: "relative",
        }}
      >
        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "15%",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%)",
            pointerEvents: "none",
            filter: "blur(50px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "10%",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.12), transparent 70%)",
            pointerEvents: "none",
            filter: "blur(50px)",
          }}
        />

        <div
          className="login-enter"
          style={{
            width: "100%",
            maxWidth: 420,
            backgroundColor: "#ffffff",
            borderRadius: "1rem",
            padding: "2rem",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.06)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "0.75rem",
                backgroundColor: "rgba(59, 130, 246, 0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
                color: "#2563eb",
                boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.15), 0 8px 24px rgba(59, 130, 246, 0.12)",
              }}
            >
              <Users size={44} />
            </div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#111827",
                letterSpacing: "-0.02em",
                marginBottom: "0.25rem",
              }}
            >
              Marketing CRM
            </h1>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                letterSpacing: "0.02em",
              }}
            >
              Accesso riservato
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.75rem 1rem",
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  borderRadius: "0.5rem",
                  color: "#dc2626",
                  fontSize: "0.875rem",
                  animation: "fadeInUp 0.25s ease-out both",
                }}
              >
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div style={{ position: "relative" }}>
              <Mail
                size={20}
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", zIndex: 1 }}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                autoComplete="email"
                style={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  color: "#111827",
                  borderRadius: "0.625rem",
                  padding: "0.8125rem 1rem 0.8125rem 2.75rem",
                  fontSize: "1rem",
                  lineHeight: 1.5,
                  width: "100%",
                }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <Lock
                size={20}
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", zIndex: 1 }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                autoComplete="current-password"
                style={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  color: "#111827",
                  borderRadius: "0.625rem",
                  padding: "0.8125rem 1rem 0.8125rem 2.75rem",
                  fontSize: "1rem",
                  lineHeight: 1.5,
                  width: "100%",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-btn"
              style={{
                padding: "0.8125rem 1.25rem",
                backgroundColor: loading ? "#9ca3af" : "#3b82f6",
                color: "#ffffff",
                borderRadius: "0.625rem",
                fontWeight: 600,
                fontSize: "1rem",
                lineHeight: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.625rem",
                opacity: loading ? 0.7 : 1,
                border: "none",
              }}
            >
              {loading ? (
                <span
                  style={{
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              ) : (
                <>
                  Accedi
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div
            className="login-enter"
            style={{
              marginTop: "1.75rem",
              paddingTop: "1rem",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                fontSize: "0.8125rem",
                color: "#9ca3af",
              }}
            >
              Nessun account?{" "}
              <span
                style={{ color: "#3b82f6", cursor: "pointer", textDecoration: "underline" }}
                onClick={() => navigate("/register", { replace: true })}
              >
                Registrati
              </span>
            </p>
            <span
              style={{
                fontSize: "0.8125rem",
                color: "#6b7280",
                textDecoration: "none",
              }}
            >
              Non ricordi la password?
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
