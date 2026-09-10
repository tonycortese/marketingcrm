import { useState, useMemo } from "react";
import { useCompanies, useTasks, useContacts } from "../hooks/useData";
import { Building, Plus, Trash2, Phone, Mail, MapPin, User, X, Pencil, Calendar, CheckCircle2, Circle, Clock, Search, Zap } from "lucide-react";

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
  const { companies, loading, deleteCompany, updateCompany } = useCompanies();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { contacts, addContact, deleteContact } = useContacts();
  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "" });
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactCompanyId, setContactCompanyId] = useState<number | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<number | null>(null);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", due_date: "", status: "pending" });
  const [taskCompanyId, setTaskCompanyId] = useState<number | null>(null);

  const getCompanyContacts = (companyId: number) => contacts.filter((c: any) => c.company_id === companyId);
  const getCompanyTasks = (companyId: number) => tasks.filter((t: any) => t.company_id === companyId);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery) return companies;
    const q = searchQuery.toLowerCase();
    return companies.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.type?.toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q) ||
      getCompanyContacts(c.id).some(ct => ct.name?.toLowerCase().includes(q))
    );
  }, [companies, searchQuery, contacts]);

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

  const handleToggleTask = async (task: any) => {
    await updateTask(task.id, { status: task.status === "completed" ? "pending" : "completed" });
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    await updateCompany(editingCompany.id, editingCompany);
    setEditingCompany(null);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem" }}>Aziende</h1>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <input
          placeholder="Cerca per nome, città, tipologia o referente..."
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
        {filteredCompanies.map((company: any) => {
          const isExpanded = expandedCompany === company.id;
          const companyTasks = getCompanyTasks(company.id);
          const companyContacts = getCompanyContacts(company.id);

          return (
            <div key={company.id} style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "1rem", overflow: "hidden" }}>
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", cursor: "pointer", gap: "0.75rem" }}
                onClick={() => setExpandedCompany(isExpanded ? null : company.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, overflow: "hidden" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "0.625rem", backgroundColor: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", flexShrink: 0 }}>
                    <Building size={20} />
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{company.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {company.city && <span>{company.city}</span>}
                      {companyContacts.length > 0 && <span>{companyContacts.length} ref.</span>}
                      {companyTasks.length > 0 && <span>{companyTasks.length} task</span>}
                      <span style={{ padding: "0.125rem 0.375rem", borderRadius: "0.25rem", fontSize: "0.625rem", fontWeight: 600, backgroundColor: `${STATUS_COLORS[company.status]}20`, color: STATUS_COLORS[company.status] }}>
                        {COMPANY_STATUSES.find(s => s.value === company.status)?.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setContactCompanyId(company.id); setShowAddContact(true); }}
                    style={{ padding: "0.5rem", backgroundColor: "var(--success)", color: "#fff", borderRadius: "0.5rem", border: "none", cursor: "pointer", display: "flex", minWidth: "40px", minHeight: "40px", alignItems: "center", justifyContent: "center" }}
                  >
                    <User size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setTaskCompanyId(company.id); setShowAddTask(true); }}
                    style={{ padding: "0.5rem", backgroundColor: "var(--accent-primary)", color: "#fff", borderRadius: "0.5rem", border: "none", cursor: "pointer", display: "flex", minWidth: "40px", minHeight: "40px", alignItems: "center", justifyContent: "center" }}
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm(`Eliminare?`)) deleteCompany(company.id); }}
                    style={{ padding: "0.5rem", backgroundColor: "transparent", color: "var(--danger)", borderRadius: "0.5rem", border: "1px solid var(--danger)", cursor: "pointer", display: "flex", minWidth: "40px", minHeight: "40px", alignItems: "center", justifyContent: "center" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "1rem" }}>
                  {/* Actions row */}
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    <button onClick={() => setEditingCompany({ ...company })} style={{ padding: "0.375rem 0.75rem", backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)", borderRadius: "0.375rem", border: "1px solid var(--border)", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Pencil size={12} /> Modifica
                    </button>
                  </div>

                  {/* Tasks */}
                  <div style={{ marginBottom: "1rem" }}>
                    <h4 style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <CheckCircle2 size={14} style={{ color: "var(--accent-primary)" }} /> Task ({companyTasks.length})
                    </h4>
                    {companyTasks.length === 0 && <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic" }}>Nessun task</p>}
                    {companyTasks.map((task: any) => (
                      <div key={task.id} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.375rem 0" }}>
                        <button onClick={() => handleToggleTask(task)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          {task.status === "completed" ? <CheckCircle2 size={16} color="#10b981" /> : task.status === "in_progress" ? <Clock size={16} color="#f59e0b" /> : <Circle size={16} color="#6b7280" />}
                        </button>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <div style={{ fontSize: "0.8125rem", color: task.status === "completed" ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: task.status === "completed" ? "line-through" : "none" }}>{task.title}</div>
                          {task.due_date && <div style={{ fontSize: "0.6875rem", color: "var(--text-secondary)" }}>{task.due_date.split('T')[0]}</div>}
                        </div>
                        <button onClick={() => deleteTask(task.id)} style={{ padding: "0.25rem", background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>

                  {/* Contacts */}
                  <div>
                    <h4 style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <User size={14} style={{ color: "var(--success)" }} /> Referenti ({companyContacts.length})
                    </h4>
                    {companyContacts.length === 0 && <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic" }}>Nessun referente</p>}
                    {companyContacts.map((contact: any) => (
                      <div key={contact.id} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.375rem 0" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", flexShrink: 0 }}>
                          <User size={12} />
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-primary)" }}>{contact.name}</div>
                          <div style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            {contact.phone && <span>{contact.phone}</span>}
                            {contact.email && <span>{contact.email}</span>}
                          </div>
                        </div>
                        <button onClick={() => deleteContact(contact.id)} style={{ padding: "0.25rem", background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCompanies.length === 0 && !loading && (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <Building size={40} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
          <p>Nessuna azienda trovata</p>
        </div>
      )}

      {/* Modals */}
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

      {editingCompany && (
        <Modal title="Modifica Azienda" onClose={() => setEditingCompany(null)}>
          <form onSubmit={handleUpdateCompany} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input placeholder="Nome *" value={editingCompany.name} onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })} required autoFocus />
            <input placeholder="Città" value={editingCompany.city || ""} onChange={(e) => setEditingCompany({ ...editingCompany, city: e.target.value })} />
            <input placeholder="Telefono" value={editingCompany.phone || ""} onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })} />
            <input placeholder="Indirizzo" value={editingCompany.address || ""} onChange={(e) => setEditingCompany({ ...editingCompany, address: e.target.value })} />
            <select value={editingCompany.type || ""} onChange={(e) => setEditingCompany({ ...editingCompany, type: e.target.value })} style={{ padding: "0.625rem", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: editingCompany.type ? "var(--text-primary)" : "var(--text-secondary)", outline: "none" }}>
              <option value="">Tipologia...</option>
              {COMPANY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={editingCompany.status || "sconosciuto"} onChange={(e) => setEditingCompany({ ...editingCompany, status: e.target.value })} style={{ padding: "0.625rem", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--text-primary)", outline: "none" }}>
              {COMPANY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button type="submit" style={{ padding: "0.75rem", backgroundColor: "var(--accent-primary)", color: "#fff", borderRadius: "0.5rem", fontWeight: 600, border: "none", cursor: "pointer", minHeight: "44px" }}>Salva</button>
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
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "0.375rem", padding: "0.25rem", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
