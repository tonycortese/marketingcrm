import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCompanies, useTasks, useContacts } from "../hooks/useData";
import { useRealtimeRefresh } from "../lib/socket-context";
import { Building, Plus, Trash2, User, Search, ChevronRight } from "lucide-react";

const COMPANY_TYPES = ["Tecnologia", "Consulenza", "Commercio", "Servizi", "Industria", "Altro"];
const COMPANY_STATUSES = [
  { value: "sconosciuto", label: "Sconosciuto", color: "#6b7280" },
  { value: "conosciuto", label: "Conosciuto", color: "#3b82f6" },
  { value: "potenziale", label: "Potenziale", color: "#f59e0b" },
  { value: "cliente", label: "Cliente", color: "#10b981" },
  { value: "inattivo", label: "Inattivo", color: "#8b5cf6" },
  { value: "perso", label: "Perso", color: "#ef4444" },
  { value: "non_interessato", label: "Non Interessato", color: "#64748b" },
];
const STATUS_COLORS: Record<string, string> = Object.fromEntries(COMPANY_STATUSES.map(s => [s.value, s.color]));

export default function CompaniesPage() {
  const navigate = useNavigate();
  const { items, pagination, loading, deleteCompany, refresh: refreshCompanies, setPage } = useCompanies();
  const { addTask, refresh: refreshTasks } = useTasks();
  const { addContact, refresh: refreshContacts } = useContacts();
  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "" });
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactCompanyId, setContactCompanyId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", due_date: "", status: "pending" });
  const [taskCompanyId, setTaskCompanyId] = useState<number | null>(null);

  // Realtime refresh
  useRealtimeRefresh("company:created", refreshCompanies);
  useRealtimeRefresh("company:updated", refreshCompanies);
  useRealtimeRefresh("company:deleted", refreshCompanies);
  useRealtimeRefresh("task:created", refreshTasks);
  useRealtimeRefresh("contact:created", refreshContacts);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((c: any) =>
      c.name?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.type?.toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactCompanyId) return;
    await addContact({ ...contactForm, company_id: contactCompanyId });
    setContactForm({ name: "", phone: "", email: "" });
    setShowAddContact(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    await addTask({ ...taskForm, company_id: taskCompanyId });
    setTaskForm({ title: "", description: "", due_date: "", status: "pending" });
    setShowAddTask(false);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem" }}>Aziende</h1>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <input
          placeholder="Cerca per nome, città, tipologia o stato..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%", padding: "0.75rem 1rem 0.75rem 2.75rem",
            backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)",
            borderRadius: "0.75rem", color: "var(--text-primary)", fontSize: "16px", outline: "none",
          }}
        />
        <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }} />
      </div>

      {loading && <p style={{ color: "var(--text-secondary)", padding: "1rem" }}>Caricamento...</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {filteredCompanies.map((company: any) => (
          <div
            key={company.id}
            onClick={() => navigate(`/companies/${company.id}`)}
            style={{
              backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "1rem",
              padding: "1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <div style={{ width: 40, height: 40, borderRadius: "0.625rem", backgroundColor: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", flexShrink: 0 }}>
              <Building size={20} />
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{company.name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {company.city && <span>{company.city}</span>}
                {company.type && <span>• {company.type}</span>}
                <span style={{ padding: "0.125rem 0.375rem", borderRadius: "0.25rem", fontSize: "0.625rem", fontWeight: 600, backgroundColor: `${STATUS_COLORS[company.status]}20`, color: STATUS_COLORS[company.status] }}>
                  {COMPANY_STATUSES.find(s => s.value === company.status)?.label}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => { setContactCompanyId(company.id); setShowAddContact(true); }}
                title="Aggiungi referente"
                style={{ padding: "0.5rem", backgroundColor: "var(--success)", color: "#fff", borderRadius: "0.5rem", border: "none", cursor: "pointer", display: "flex", minWidth: "40px", minHeight: "40px", alignItems: "center", justifyContent: "center" }}
              >
                <User size={16} />
              </button>
              <button
                onClick={() => { setTaskCompanyId(company.id); setShowAddTask(true); }}
                title="Aggiungi task"
                style={{ padding: "0.5rem", backgroundColor: "var(--accent-primary)", color: "#fff", borderRadius: "0.5rem", border: "none", cursor: "pointer", display: "flex", minWidth: "40px", minHeight: "40px", alignItems: "center", justifyContent: "center" }}
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => { if (confirm(`Eliminare ${company.name}?`)) deleteCompany(company.id); }}
                title="Elimina"
                style={{ padding: "0.5rem", backgroundColor: "transparent", color: "var(--danger)", borderRadius: "0.5rem", border: "1px solid var(--danger)", cursor: "pointer", display: "flex", minWidth: "40px", minHeight: "40px", alignItems: "center", justifyContent: "center" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <ChevronRight size={18} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && !loading && (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <Building size={40} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
          <p>Nessuna azienda trovata</p>
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

      {/* Add Contact Modal */}
      {showAddContact && (
        <Modal title="Nuovo Referente" onClose={() => setShowAddContact(false)}>
          <form onSubmit={handleAddContact} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input placeholder="Nome *" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required autoFocus />
            <input placeholder="Telefono" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
            <input placeholder="Email" type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
            <button type="submit" style={{ padding: "0.75rem", backgroundColor: "var(--success)", color: "#fff", borderRadius: "0.5rem", fontWeight: 600, border: "none", cursor: "pointer", minHeight: "44px" }}>Aggiungi</button>
          </form>
        </Modal>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <Modal title="Nuovo Task" onClose={() => setShowAddTask(false)}>
          <form onSubmit={handleAddTask} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input placeholder="Titolo *" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required autoFocus />
            <input placeholder="Descrizione" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
            <input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
            <select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })} style={{ padding: "0.625rem", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--text-primary)", outline: "none" }}>
              <option value="pending">Da fare</option>
              <option value="in_progress">In corso</option>
              <option value="completed">Completato</option>
            </select>
            <button type="submit" style={{ padding: "0.75rem", backgroundColor: "var(--accent-primary)", color: "#fff", borderRadius: "0.5rem", fontWeight: 600, border: "none", cursor: "pointer", minHeight: "44px" }}>Crea</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "1rem", width: "100%", maxWidth: 420, padding: "1.25rem", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "0.375rem", padding: "0.25rem", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
