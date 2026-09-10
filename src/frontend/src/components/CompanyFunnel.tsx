import { useState } from "react";
import { X, ArrowRight, ArrowLeft, Check, Building, Phone, Mail, User } from "lucide-react";
import { api } from "../lib/api";

interface CompanyFunnelProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

type Step = "azienda" | "contatto" | "riepilogo";

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
  { key: "azienda", label: "Azienda", icon: <Building size={16} /> },
  { key: "contatto", label: "Referente", icon: <User size={16} /> },
  { key: "riepilogo", label: "Riepilogo", icon: <Check size={16} /> },
];

const COMPANY_TYPES = ["Tecnologia", "Consulenza", "Commercio", "Servizi", "Industria", "Altro"];

const COMPANY_STATUSES = [
  { value: "sconosciuto", label: "Sconosciuto" },
  { value: "conosciuto", label: "Conosciuto" },
  { value: "potenziale", label: "Potenziale" },
  { value: "cliente", label: "Cliente" },
  { value: "inattivo", label: "Inattivo" },
  { value: "perso", label: "Perso" },
  { value: "non_interessato", label: "Non Interessato" },
];

const initialCompany = {
  name: "",
  city: "",
  address: "",
  phone: "",
  type: "",
  status: "sconosciuto",
};

const initialContact = {
  name: "",
  phone: "",
  email: "",
};

export default function CompanyFunnel({ open, onClose, onCreated }: CompanyFunnelProps) {
  const [step, setStep] = useState<Step>("azienda");
  const [company, setCompany] = useState(initialCompany);
  const [contact, setContact] = useState(initialContact);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const handleClose = () => {
    setStep("azienda");
    setCompany(initialCompany);
    setContact(initialContact);
    setError("");
    onClose();
  };

  const handleNext = () => {
    setError("");
    if (step === "azienda") {
      if (!company.name.trim()) {
        setError("Il nome dell'azienda è obbligatorio");
        return;
      }
      setStep("contatto");
    } else if (step === "contatto") {
      if (!contact.name.trim()) {
        setError("Il nome del referente è obbligatorio");
        return;
      }
      setStep("riepilogo");
    }
  };

  const handleBack = () => {
    setError("");
    if (step === "contatto") setStep("azienda");
    else if (step === "riepilogo") setStep("contatto");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const { data: createdCompany } = await api.post("/companies", company);
      const companyId = createdCompany.id;

      await api.post("/contacts", {
        ...contact,
        company_id: companyId,
      });

      setCompany(initialCompany);
      setContact(initialContact);
      setStep("azienda");
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
          maxWidth: 520,
          padding: "1.5rem",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {stepIndex > 0 && (
              <button
                onClick={handleBack}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: "0.375rem",
                  padding: "0.25rem",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Nuova Azienda
            </h2>
          </div>
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

        {/* Step: Azienda */}
        {step === "azienda" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <FieldInput
              icon={<Building size={18} />}
              label="Nome Azienda *"
              placeholder="Nome dell'azienda"
              value={company.name}
              onChange={(v) => setCompany({ ...company, name: v })}
              autoFocus
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <FieldInput
                icon={<Building size={18} />}
                label="Città"
                placeholder="Città"
                value={company.city}
                onChange={(v) => setCompany({ ...company, city: v })}
              />
              <FieldInput
                icon={<Phone size={18} />}
                label="Telefono Fisso"
                placeholder="+39 02 1234567"
                type="tel"
                value={company.phone}
                onChange={(v) => setCompany({ ...company, phone: v })}
              />
            </div>
            <FieldInput
              icon={<Building size={18} />}
              label="Indirizzo"
              placeholder="Via/Piazza e numero civico"
              value={company.address}
              onChange={(v) => setCompany({ ...company, address: v })}
            />
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Tipologia Azienda
              </label>
              <select
                value={company.type}
                onChange={(e) => setCompany({ ...company, type: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  color: company.type ? "var(--text-primary)" : "var(--text-secondary)",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              >
                <option value="">Seleziona tipologia...</option>
                {COMPANY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Stato
              </label>
              <select
                value={company.status}
                onChange={(e) => setCompany({ ...company, status: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              >
                {COMPANY_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step: Referente */}
        {step === "contatto" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <FieldInput
              icon={<User size={18} />}
              label="Nome Referente *"
              placeholder="Nome completo"
              value={contact.name}
              onChange={(v) => setContact({ ...contact, name: v })}
              autoFocus
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <FieldInput
                icon={<Phone size={18} />}
                label="Cellulare"
                placeholder="+39 333 1234567"
                type="tel"
                value={contact.phone}
                onChange={(v) => setContact({ ...contact, phone: v })}
              />
              <FieldInput
                icon={<Mail size={18} />}
                label="Email"
                placeholder="email@esempio.it"
                type="email"
                value={contact.email}
                onChange={(v) => setContact({ ...contact, email: v })}
              />
            </div>
          </div>
        )}

        {/* Step: Riepilogo */}
        {step === "riepilogo" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div
              style={{
                padding: "1rem",
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                Azienda
              </div>
              <RiepilogoRow label="Nome" value={company.name} />
              <RiepilogoRow label="Città" value={company.city || "—"} />
              <RiepilogoRow label="Indirizzo" value={company.address || "—"} />
              <RiepilogoRow label="Telefono" value={company.phone || "—"} />
              <RiepilogoRow label="Tipologia" value={company.type || "—"} />
              <RiepilogoRow label="Stato" value={COMPANY_STATUSES.find((s) => s.value === company.status)?.label || company.status} />
            </div>
            <div
              style={{
                padding: "1rem",
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                Referente
              </div>
              <RiepilogoRow label="Nome" value={contact.name} />
              <RiepilogoRow label="Cellulare" value={contact.phone || "—"} />
              <RiepilogoRow label="Email" value={contact.email || "—"} />
            </div>
          </div>
        )}

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
              {submitting ? "Creazione..." : "Crea Azienda"}
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
      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
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
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", fontSize: "0.875rem" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
