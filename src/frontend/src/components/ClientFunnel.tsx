import { useState } from "react";
import { X, ArrowRight, ArrowLeft, Check, User, Building, Phone, Mail } from "lucide-react";
import { api } from "../lib/api";

interface ClientFunnelProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

type Step = "anagrafica" | "contatti" | "azienda" | "riepilogo";

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
  { key: "anagrafica", label: "Anagrafica", icon: <User size={16} /> },
  { key: "contatti", label: "Contatti", icon: <Phone size={16} /> },
  { key: "azienda", label: "Azienda", icon: <Building size={16} /> },
  { key: "riepilogo", label: "Riepilogo", icon: <Check size={16} /> },
];

const initialData = {
  name: "",
  email: "",
  phone: "",
  company: "",
};

export default function ClientFunnel({ open, onClose, onCreated }: ClientFunnelProps) {
  const [step, setStep] = useState<Step>("anagrafica");
  const [data, setData] = useState(initialData);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const handleClose = () => {
    setStep("anagrafica");
    setData(initialData);
    setError("");
    onClose();
  };

  const handleNext = () => {
    setError("");
    if (step === "anagrafica") {
      if (!data.name.trim()) {
        setError("Il nome è obbligatorio");
        return;
      }
      setStep("contatti");
    } else if (step === "contatti") {
      setStep("azienda");
    } else if (step === "azienda") {
      setStep("riepilogo");
    }
  };

  const handleBack = () => {
    setError("");
    if (step === "contatti") setStep("anagrafica");
    else if (step === "azienda") setStep("contatti");
    else if (step === "riepilogo") setStep("azienda");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/clients", data);
      setData(initialData);
      setStep("anagrafica");
      onCreated?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Errore durante la creazione");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          width: "100%",
          maxWidth: 480,
          padding: "1.5rem",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Nuovo Cliente
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              padding: "0.4rem",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.5rem 0.625rem",
                borderRadius: "0.5rem",
                backgroundColor: i === stepIndex ? "var(--accent-primary)" : i < stepIndex ? "var(--bg-tertiary)" : "transparent",
                color: i === stepIndex ? "#fff" : i < stepIndex ? "var(--success)" : "var(--text-secondary)",
                fontSize: "0.75rem",
                fontWeight: 500,
                border: i === stepIndex ? "none" : "1px solid var(--border)",
              }}
            >
              {i < stepIndex ? <Check size={14} /> : s.icon}
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "0.625rem 0.875rem",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "0.5rem",
              color: "var(--danger)",
              fontSize: "0.8125rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Step content */}
        <div style={{ minHeight: 120 }}>
          {step === "anagrafica" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <FieldInput
                icon={<User size={18} />}
                label="Nome"
                placeholder="Nome completo"
                value={data.name}
                onChange={(v) => setData({ ...data, name: v })}
                autoFocus
              />
              <FieldInput
                icon={<Mail size={18} />}
                label="Email"
                placeholder="email@esempio.it"
                type="email"
                value={data.email}
                onChange={(v) => setData({ ...data, email: v })}
              />
            </div>
          )}

          {step === "contatti" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <FieldInput
                icon={<Phone size={18} />}
                label="Telefono"
                placeholder="+39 123 456 7890"
                type="tel"
                value={data.phone}
                onChange={(v) => setData({ ...data, phone: v })}
                autoFocus
              />
            </div>
          )}

          {step === "azienda" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <FieldInput
                icon={<Building size={18} />}
                label="Azienda"
                placeholder="Nome azienda"
                value={data.company}
                onChange={(v) => setData({ ...data, company: v })}
                autoFocus
              />
            </div>
          )}

          {step === "riepilogo" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                padding: "1rem",
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
              }}
            >
              <RiepilogoRow label="Nome" value={data.name} />
              <RiepilogoRow label="Email" value={data.email || "—"} />
              <RiepilogoRow label="Telefono" value={data.phone || "—"} />
              <RiepilogoRow label="Azienda" value={data.company || "—"} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
          <button
            onClick={handleBack}
            disabled={stepIndex === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.625rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              backgroundColor: "transparent",
              color: stepIndex === 0 ? "var(--text-secondary)" : "var(--text-primary)",
              border: "1px solid var(--border)",
              cursor: stepIndex === 0 ? "not-allowed" : "pointer",
              opacity: stepIndex === 0 ? 0.5 : 1,
            }}
          >
            <ArrowLeft size={16} /> Indietro
          </button>

          {step === "riepilogo" ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                backgroundColor: "var(--success)",
                color: "#fff",
                border: "none",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Creazione..." : "Crea Cliente"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                backgroundColor: "var(--accent-primary)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Avanti <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldInput({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "0.8125rem",
          fontWeight: 500,
          color: "var(--text-secondary)",
          marginBottom: "0.375rem",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-secondary)",
            display: "flex",
            pointerEvents: "none",
          }}
        >
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          style={{
            width: "100%",
            padding: "0.625rem 0.75rem 0.625rem 2.5rem",
            backgroundColor: "var(--bg-tertiary)",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
            color: "var(--text-primary)",
            fontSize: "0.875rem",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}

function RiepilogoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
