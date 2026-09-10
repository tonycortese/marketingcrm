import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, Check, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../lib/api-context";

export default function Register() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect dopo il login — dentro useEffect, non nel render
  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Inserisci il nome"); return; }
    if (!email.trim()) { setError("Inserisci l'email"); return; }
    if (!password || password.length < 6) { setError("Password minima 6 caratteri"); return; }
    if (password !== confirm) { setError("Le password non coincidono"); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Errore durante la registrazione");
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
        .reg-enter { animation: fadeInUp 0.45s ease-out both; }
        .reg-input {
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .reg-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          outline: none;
        }
        .reg-btn {
          transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
          cursor: pointer;
        }
        .reg-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }
        .reg-btn:active:not(:disabled) {
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
          className="reg-enter"
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
                backgroundColor: "rgba(16, 185, 129, 0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
                color: "#059669",
                boxShadow: "0 0 0 1px rgba(16, 185, 129, 0.15), 0 8px 24px rgba(16, 185, 129, 0.12)",
              }}
            >
              <UserPlus size={44} />
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
              Crea account
            </h1>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                letterSpacing: "0.02em",
              }}
            >
              Registrati per iniziare
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

            {/* Name */}
            <div style={{ position: "relative" }}>
              <UserPlus
                size={20}
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", zIndex: 1 }}
              />
              <input
                type="text"
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="reg-input"
                autoComplete="name"
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

            {/* Email */}
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
                className="reg-input"
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

            {/* Password */}
            <div style={{ position: "relative" }}>
              <Lock
                size={20}
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", zIndex: 1 }}
              />
              <input
                type="password"
                placeholder="Password (min 6 caratteri)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="reg-input"
                autoComplete="new-password"
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

            {/* Confirm password */}
            <div style={{ position: "relative" }}>
              <Check
                size={20}
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", zIndex: 1 }}
              />
              <input
                type="password"
                placeholder="Conferma password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="reg-input"
                autoComplete="new-password"
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
              className="reg-btn"
              style={{
                padding: "0.8125rem 1.25rem",
                backgroundColor: loading ? "#9ca3af" : "#059669",
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
                  Crea account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div
            className="reg-enter"
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
              Hai già un account?{" "}
              <span
                style={{ color: "#059669", cursor: "pointer", textDecoration: "underline" }}
                onClick={() => navigate("/login", { replace: true })}
              >
                Accedi
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
