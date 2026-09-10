import { useState, useMemo } from "react";
import { X, Calendar, Phone, Mail, Users, FileText, Building, Search, ChevronLeft } from "lucide-react";
import { api } from "../lib/api";

interface ActivityFunnelProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  companies: any[];
}

type Step = "azienda" | "attivita";

const ACTIVITY_TYPES = [
  { value: "chiamata", label: "Chiamata", icon: <Phone size={20} />, color: "#3b82f6" },
  { value: "email", label: "Email", icon: <Mail size={20} />, color: "#10b981" },
  { value: "meeting", label: "Meeting", icon: <Users size={20} />, color: "#f59e0b" },
  { value: "nota", label: "Nota", icon: <FileText size={20} />, color: "#8b5cf6" },
];

const STATUS_ACTIVITY_HINTS: Record<string, { suggestedTypes: string[]; message: string }> = {
  sconosciuto: { suggestedTypes: ["chiamata", "email"], message: "Primo contatto: chiama o invia una presentazione" },
  conosciuto: { suggestedTypes: ["meeting", "email"], message: "Approfondisci: fai un meeting o invia follow-up" },
  potenziale: { suggestedTypes: ["meeting", "chiamata"], message: "Chiudi: organizza un meeting o chiama per avanzare" },
  cliente: { suggestedTypes: ["chiamata", "nota"], message: "Gestisci: follow-up cliente o nota interna" },
  inattivo: { suggestedTypes: ["email", "chiamata"], message: "Riattiva: invia email o chiama per re-engagement" },
  perso: { suggestedTypes: ["nota"], message: "Documenta: aggiungi nota sul motivo della perdita" },
  non_interessato: { suggestedTypes: ["nota"], message: "Nota: documenta il motivo del no" },
};

const STATUS_COLORS: Record<string, string> = {
  sconosciuto: "#6b7280",
  conosciuto: "#3b82f6",
  potenziale: "#f59e0b",
  cliente: "#10b981",
  inattivo: "#8b5cf6",
  perso: "#ef4444",
  non_interessato: "#64748b",
};

export default function ActivityFunnel({ open, onClose, onCreated, companies }: ActivityFunnelProps) {
  const [step, setStep] = useState<Step>("azienda");
  const [companySearch, setCompanySearch] = useState("");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedCompany = useMemo(() => companies.find((c) => c.id === companyId), [companies, companyId]);
  const statusColor = selectedCompany?.status ? STATUS_COLORS[selectedCompany.status] ?? undefined : undefined;
  const statusHint = selectedCompany?.status ? STATUS_ACTIVITY_HINTS[selectedCompany.status] ?? null : null;

  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return companies;
    const q = companySearch.toLowerCase();
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.type?.toLowerCase().includes(q)
    );
  }, [companies, companySearch]);

  const handleClose = () => {
    setStep("azienda");
    setCompanySearch("");
    setCompanyId(null);
    setTitle("");
    setDescription("");
    setDate("");
    setType("");
    setError("");
    onClose();
  };

  const handleSelectCompany = (id: number) => {
    setCompanyId(id);
    setType("");
    setStep("attivita");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      setError("Seleziona un tipo di attività");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/activities", {
        title: title || type,
        description,
        date: date || null,
        type,
        company_id: companyId,
      });
      handleClose();
      onCreated?.();
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
            {step === "attivita" && (
              <button
                onClick={() => setStep("azienda")}
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
                <ChevronLeft size={18} />
              </button>
            )}
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {step === "azienda" ? "Seleziona Azienda" : "Nuova Attività"}
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

        {/* Step 1: Select company */}
        {step === "azienda" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                  pointerEvents: "none",
                }}
              >
                <Search size={18} />
              </div>
              <input
                placeholder="Cerca per nome, città o tipologia..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.75rem",
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.625rem",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                maxHeight: 280,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "0.375rem",
              }}
            >
              {filteredCompanies.length === 0 && (
                <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Nessuna azienda trovata
                </div>
              )}
              {filteredCompanies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCompany(c.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.625rem",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-tertiary)")}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "0.5rem",
                      backgroundColor: "rgba(59, 130, 246, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#3b82f6",
                      flexShrink: 0,
                    }}
                  >
                    <Building size={18} />
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>{c.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", gap: "0.75rem" }}>
                      {c.city && <span>{c.city}</span>}
                      {c.type && <span>{c.type}</span>}
                    </div>
                  </div>
                  {c.status && (
                    <span
                      style={{
                        padding: "0.125rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        backgroundColor: `${STATUS_COLORS[c.status] || '#6b7280'}20`,
                        color: STATUS_COLORS[c.status] || '#6b7280',
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Activity details */}
        {step === "attivita" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Selected company badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.875rem",
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
              }}
            >
              <Building size={16} style={{ color: statusColor || "var(--text-secondary)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>
                  {selectedCompany?.name}
                </div>
                {statusHint && (
                  <div style={{ fontSize: "0.75rem", color: statusColor, fontWeight: 500 }}>
                    {statusHint.message}
                  </div>
                )}
              </div>
            </div>

            {/* Activity type buttons */}
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Tipo Attività *
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {ACTIVITY_TYPES.map((t) => {
                  const isSuggested = statusHint?.suggestedTypes.includes(t.value);
                  const isSelected = type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(isSelected ? "" : t.value)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        padding: "0.875rem 0.75rem",
                        backgroundColor: isSelected ? `${t.color}20` : isSuggested ? `${t.color}10` : "var(--bg-tertiary)",
                        border: isSelected ? `2px solid ${t.color}` : isSuggested ? `1px solid ${t.color}40` : "1px solid var(--border)",
                        borderRadius: "0.625rem",
                        color: isSelected ? t.color : isSuggested ? t.color : "var(--text-secondary)",
                        fontSize: "0.875rem",
                        fontWeight: isSuggested ? 600 : 500,
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      {t.icon}
                      {t.label}
                      {isSuggested && !isSelected && (
                        <span
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: t.color,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                  <Calendar size={12} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} />
                  Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                  Titolo
                </label>
                <input
                  placeholder="Opzionale..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Descrizione
              </label>
              <textarea
                placeholder="Note aggiuntive..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !type}
              style={{
                padding: "0.75rem 1.25rem",
                backgroundColor: type ? "var(--accent-primary)" : "var(--bg-tertiary)",
                color: type ? "#fff" : "var(--text-secondary)",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "none",
                cursor: submitting || !type ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Creazione..." : "Crea Attività"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
