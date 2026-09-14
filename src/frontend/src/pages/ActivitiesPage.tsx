import { useState } from "react";
import { useActivities, useCompanies } from "../hooks/useData";
import { useRealtimeRefresh } from "../lib/socket-context";
import { Zap, Phone, Mail, Users, FileText, Calendar, Trash2, Pencil, X } from "lucide-react";

const ACTIVITY_TYPES = [
  { value: "chiamata", label: "Chiamata", icon: <Phone size={14} />, color: "#3b82f6" },
  { value: "email", label: "Email", icon: <Mail size={14} />, color: "#10b981" },
  { value: "meeting", label: "Meeting", icon: <Users size={14} />, color: "#f59e0b" },
  { value: "nota", label: "Nota", icon: <FileText size={14} />, color: "#8b5cf6" },
];

export default function ActivitiesPage() {
  const { items, pagination, loading, deleteActivity, updateActivity, refresh: refreshActivities, setPage } = useActivities();
  const { items: companies } = useCompanies();
  const [editingActivity, setEditingActivity] = useState<any>(null);

  // Realtime refresh
  useRealtimeRefresh("activity:created", refreshActivities);
  useRealtimeRefresh("activity:updated", refreshActivities);
  useRealtimeRefresh("activity:deleted", refreshActivities);

  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    await updateActivity(editingActivity.id, editingActivity);
    setEditingActivity(null);
  };

  const getCompanyName = (companyId: number | null) => {
    if (!companyId) return "—";
    const company = companies.find((c: any) => c.id === companyId);
    return company?.name || "—";
  };

  const getTypeConfig = (type: string | null) => ACTIVITY_TYPES.find((t) => t.value === type) || null;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem" }}>Attività</h1>

      {loading && <p style={{ color: "var(--text-secondary)", padding: "1rem" }}>Caricamento...</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.map((activity: any) => {
          const typeConfig = getTypeConfig(activity.type);
          return (
            <div key={activity.id} style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: "0.5rem", backgroundColor: typeConfig ? `${typeConfig.color}18` : "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", color: typeConfig?.color || "var(--text-secondary)", flexShrink: 0 }}>
                  {typeConfig?.icon || <Zap size={18} />}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activity.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {activity.date && <span>{activity.date.split('T')[0]}</span>}
                    {typeConfig && <span style={{ color: typeConfig.color, fontWeight: 500 }}>{typeConfig.label}</span>}
                    {activity.company_id && <span>• {getCompanyName(activity.company_id)}</span>}
                  </div>
                  {activity.description && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activity.description}</div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                  <button onClick={() => setEditingActivity({ ...activity })} style={{ padding: "0.375rem", backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)", borderRadius: "0.375rem", border: "1px solid var(--border)", cursor: "pointer" }}><Pencil size={14} /></button>
                  <button onClick={() => deleteActivity(activity.id)} style={{ padding: "0.375rem", backgroundColor: "transparent", color: "var(--danger)", borderRadius: "0.375rem", border: "1px solid var(--danger)", cursor: "pointer" }}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && !loading && (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <Zap size={40} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
          <p>Nessuna attività trovata</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
          <button
            onClick={() => setPage(pagination.page - 1)}
            disabled={pagination.page === 1}
            style={{ padding: "0.5rem 1rem", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--text-primary)", cursor: pagination.page === 1 ? "not-allowed" : "pointer", opacity: pagination.page === 1 ? 0.5 : 1, minHeight: "40px" }}
          >
            Precedente
          </button>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Pagina {pagination.page} di {pagination.totalPages} ({pagination.total} totali)
          </span>
          <button
            onClick={() => setPage(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            style={{ padding: "0.5rem 1rem", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--text-primary)", cursor: pagination.page === pagination.totalPages ? "not-allowed" : "pointer", opacity: pagination.page === pagination.totalPages ? 0.5 : 1, minHeight: "40px" }}
          >
            Successivo
          </button>
        </div>
      )}

      {editingActivity && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }} onClick={(e) => { if (e.target === e.currentTarget) setEditingActivity(null); }}>
          <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "1rem", width: "100%", maxWidth: 420, padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>Modifica Attività</h3>
              <button onClick={() => setEditingActivity(null)} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "0.375rem", padding: "0.25rem", color: "var(--text-secondary)", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleUpdateActivity} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input placeholder="Titolo *" value={editingActivity.title} onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })} required autoFocus />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {ACTIVITY_TYPES.map((t) => (
                  <button key={t.value} type="button" onClick={() => setEditingActivity({ ...editingActivity, type: editingActivity.type === t.value ? null : t.value })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem", backgroundColor: editingActivity.type === t.value ? `${t.color}20` : "var(--bg-tertiary)", border: editingActivity.type === t.value ? `1px solid ${t.color}` : "1px solid var(--border)", borderRadius: "0.375rem", color: editingActivity.type === t.value ? t.color : "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer", justifyContent: "center" }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              <input type="date" value={editingActivity.date?.split('T')[0] || ""} onChange={(e) => setEditingActivity({ ...editingActivity, date: e.target.value })} />
              <select value={editingActivity.company_id || ""} onChange={(e) => setEditingActivity({ ...editingActivity, company_id: e.target.value ? Number(e.target.value) : null })} style={{ padding: "0.625rem", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: editingActivity.company_id ? "var(--text-primary)" : "var(--text-secondary)", outline: "none" }}>
                <option value="">Nessuna azienda</option>
                {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <textarea placeholder="Descrizione" value={editingActivity.description || ""} onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })} rows={2} style={{ padding: "0.625rem", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--text-primary)", outline: "none", resize: "vertical" }} />
              <button type="submit" style={{ padding: "0.75rem", backgroundColor: "var(--accent-primary)", color: "#fff", borderRadius: "0.5rem", fontWeight: 600, border: "none", cursor: "pointer", minHeight: "44px" }}>Salva</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
