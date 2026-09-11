import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useRealtimeRefresh } from "../lib/socket-context";
import {
  ArrowLeft, Building, Phone, Mail, MapPin, Pencil, Trash2,
  CheckCircle2, Circle, Clock, Plus, X, User, Calendar, Zap
} from "lucide-react";

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
const STATUS_MAP: Record<string, { label: string; color: string }> = Object.fromEntries(
  COMPANY_STATUSES.map(s => [s.value, { label: s.label, color: s.color }])
);

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const companyId = Number(id);

  const [company, setCompany] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tasks" | "activities" | "contacts">("tasks");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", due_date: "", status: "pending" });
  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "" });
  const [activityForm, setActivityForm] = useState({ title: "", description: "", date: "", type: "nota" });

  const fetchAll = async () => {
    try {
      const [c, t, a, ct] = await Promise.all([
        api.get(`/companies/${companyId}`),
        api.get(`/companies/${companyId}/tasks`),
        api.get(`/companies/${companyId}/activities`),
        api.get(`/companies/${companyId}/contacts`),
      ]);
      setCompany(c.data);
      setTasks(t.data);
      setActivities(a.data);
      setContacts(ct.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [companyId]);

  // Realtime refresh
  useRealtimeRefresh("company:updated", fetchAll);
  useRealtimeRefresh("company:deleted", fetchAll);
  useRealtimeRefresh("task:created", fetchAll);
  useRealtimeRefresh("task:updated", fetchAll);
  useRealtimeRefresh("task:deleted", fetchAll);
  useRealtimeRefresh("activity:created", fetchAll);
  useRealtimeRefresh("activity:updated", fetchAll);
  useRealtimeRefresh("activity:deleted", fetchAll);
  useRealtimeRefresh("contact:created", fetchAll);
  useRealtimeRefresh("contact:updated", fetchAll);
  useRealtimeRefresh("contact:deleted", fetchAll);

  const handleEdit = () => {
    setEditData({ ...company });
    setEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.patch(`/companies/${companyId}`, editData);
    setEditing(false);
    fetchAll();
  };

  const handleDelete = async () => {
    if (!confirm("Eliminare questa azienda?")) return;
    await api.delete(`/companies/${companyId}`);
    navigate("/companies");
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    await api.post("/tasks", { ...taskForm, company_id: companyId });
    setTaskForm({ title: "", description: "", due_date: "", status: "pending" });
    setShowAddTask(false);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim()) return;
    await api.post("/contacts", { ...contactForm, company_id: companyId });
    setContactForm({ name: "", phone: "", email: "" });
    setShowAddContact(false);
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.title.trim()) return;
    await api.post("/activities", { ...activityForm, company_id: companyId });
    setActivityForm({ title: "", description: "", date: "", type: "nota" });
    setShowAddActivity(false);
  };

  const handleToggleTask = async (task: any) => {
    const next = task.status === "completed" ? "pending" : task.status === "in_progress" ? "completed" : "in_progress";
    await api.patch(`/tasks/${task.id}`, { status: next });
  };

  const handleDeleteTask = async (taskId: number) => {
    await api.delete(`/tasks/${taskId}`);
  };

  const handleDeleteContact = async (contactId: number) => {
    await api.delete(`/contacts/${contactId}`);
  };

  const handleDeleteActivity = async (activityId: number) => {
    await api.delete(`/activities/${activityId}`);
  };

  const statusInfo = STATUS_MAP[company?.status] || STATUS_MAP["sconosciuto"];

  const pendingTasks = useMemo(() => tasks.filter(t => t.status === "pending"), [tasks]);
  const inProgressTasks = useMemo(() => tasks.filter(t => t.status === "in_progress"), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === "completed"), [tasks]);

  if (loading) return <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>Caricamento...</div>;
  if (!company) return <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>Azienda non trovata</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => navigate("/companies")}
          style={{
            padding: "0.5rem", background: "var(--bg-secondary)", border: "1px solid var(--border)",
            borderRadius: "0.5rem", color: "var(--text-secondary)", cursor: "pointer", display: "flex",
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>{company.name}</h1>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
            <span style={{
              padding: "0.125rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.625rem", fontWeight: 600,
              backgroundColor: `${statusInfo.color}20`, color: statusInfo.color,
            }}>
              {statusInfo.label}
            </span>
            {company.type && <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{company.type}</span>}
            {company.city && <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>📍 {company.city}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={handleEdit} style={{
            padding: "0.5rem 1rem", backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)",
            border: "1px solid var(--border)", borderRadius: "0.5rem", cursor: "pointer", display: "flex",
            alignItems: "center", gap: "0.375rem", fontSize: "0.875rem",
          }}>
            <Pencil size={14} /> Modifica
          </button>
          <button onClick={handleDelete} style={{
            padding: "0.5rem", backgroundColor: "transparent", color: "var(--danger)",
            border: "1px solid var(--danger)", borderRadius: "0.5rem", cursor: "pointer", display: "flex",
          }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}>
        <InfoCard icon={<Phone size={16} />} label="Telefono" value={company.phone || "—"} />
        <InfoCard icon={<MapPin size={16} />} label="Indirizzo" value={company.address || "—"} />
        <InfoCard icon={<User size={16} />} label="Referenti" value={contacts.length} />
        <InfoCard icon={<CheckCircle2 size={16} />} label="Task aperti" value={pendingTasks.length + inProgressTasks.length} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
        {(["tasks", "activities", "contacts"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.75rem 1rem", background: "none", border: "none",
              borderBottom: activeTab === tab ? "2px solid var(--accent-primary)" : "2px solid transparent",
              color: activeTab === tab ? "var(--accent-primary)" : "var(--text-secondary)",
              fontWeight: activeTab === tab ? 600 : 400, cursor: "pointer", fontSize: "0.875rem",
            }}
          >
            {tab === "tasks" && `Task (${tasks.length})`}
            {tab === "activities" && `Attività (${activities.length})`}
            {tab === "contacts" && `Referenti (${contacts.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "tasks" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
            <button onClick={() => setShowAddTask(true)} style={{
              padding: "0.5rem 1rem", backgroundColor: "var(--accent-primary)", color: "#fff",
              border: "none", borderRadius: "0.5rem", cursor: "pointer", display: "flex",
              alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", fontWeight: 600,
            }}>
              <Plus size={14} /> Nuovo Task
            </button>
          </div>
          {tasks.length === 0 ? (
            <EmptyState text="Nessun task" />
          ) : (
            <div>
              {pendingTasks.length > 0 && (
                <TaskSection title="Da fare" color="#6b7280" icon={<Circle size={14} />} tasks={pendingTasks} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
              )}
              {inProgressTasks.length > 0 && (
                <TaskSection title="In corso" color="#f59e0b" icon={<Clock size={14} />} tasks={inProgressTasks} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
              )}
              {completedTasks.length > 0 && (
                <TaskSection title="Completati" color="#10b981" icon={<CheckCircle2 size={14} />} tasks={completedTasks} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "activities" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
            <button onClick={() => setShowAddActivity(true)} style={{
              padding: "0.5rem 1rem", backgroundColor: "var(--success)", color: "#fff",
              border: "none", borderRadius: "0.5rem", cursor: "pointer", display: "flex",
              alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", fontWeight: 600,
            }}>
              <Plus size={14} /> Nuova Attività
            </button>
          </div>
          {activities.length === 0 ? (
            <EmptyState text="Nessuna attività" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {activities.map(a => (
                <ActivityRow key={a.id} activity={a} onDelete={handleDeleteActivity} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "contacts" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
            <button onClick={() => setShowAddContact(true)} style={{
              padding: "0.5rem 1rem", backgroundColor: "var(--success)", color: "#fff",
              border: "none", borderRadius: "0.5rem", cursor: "pointer", display: "flex",
              alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", fontWeight: 600,
            }}>
              <Plus size={14} /> Nuovo Referente
            </button>
          </div>
          {contacts.length === 0 ? (
            <EmptyState text="Nessun referente" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {contacts.map(c => (
                <ContactRow key={c.id} contact={c} onDelete={handleDeleteContact} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <Modal title="Modifica Azienda" onClose={() => setEditing(false)}>
          <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input placeholder="Nome *" value={editData.name || ""} onChange={e => setEditData({ ...editData, name: e.target.value })} required autoFocus />
            <input placeholder="Città" value={editData.city || ""} onChange={e => setEditData({ ...editData, city: e.target.value })} />
            <input placeholder="Telefono" value={editData.phone || ""} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
            <input placeholder="Indirizzo" value={editData.address || ""} onChange={e => setEditData({ ...editData, address: e.target.value })} />
            <select value={editData.type || ""} onChange={e => setEditData({ ...editData, type: e.target.value })} style={{ padding: "0.625rem", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--text-primary)", outline: "none" }}>
              <option value="">Tipologia...</option>
              {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={editData.status || "sconosciuto"} onChange={e => setEditData({ ...editData, status: e.target.value })} style={{ padding: "0.625rem", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--text-primary)", outline: "none" }}>
              {COMPANY_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button type="submit" style={{ padding: "0.75rem", backgroundColor: "var(--accent-primary)", color: "#fff", borderRadius: "0.5rem", fontWeight: 600, border: "none", cursor: "pointer", minHeight: "44px" }}>Salva</button>
          </form>
        </Modal>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <Modal title="Nuovo Task" onClose={() => setShowAddTask(false)}>
          <form onSubmit={handleAddTask} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input placeholder="Titolo *" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required autoFocus />
            <input placeholder="Descrizione" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
            <input type="date" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} />
            <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })} style={{ padding: "0.625rem", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--text-primary)", outline: "none" }}>
              <option value="pending">Da fare</option>
              <option value="in_progress">In corso</option>
              <option value="completed">Completato</option>
            </select>
            <button type="submit" style={{ padding: "0.75rem", backgroundColor: "var(--accent-primary)", color: "#fff", borderRadius: "0.5rem", fontWeight: 600, border: "none", cursor: "pointer", minHeight: "44px" }}>Crea</button>
          </form>
        </Modal>
      )}

      {/* Add Contact Modal */}
      {showAddContact && (
        <Modal title="Nuovo Referente" onClose={() => setShowAddContact(false)}>
          <form onSubmit={handleAddContact} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input placeholder="Nome *" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} required autoFocus />
            <input placeholder="Telefono" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} />
            <input placeholder="Email" type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} />
            <button type="submit" style={{ padding: "0.75rem", backgroundColor: "var(--success)", color: "#fff", borderRadius: "0.5rem", fontWeight: 600, border: "none", cursor: "pointer", minHeight: "44px" }}>Aggiungi</button>
          </form>
        </Modal>
      )}

      {/* Add Activity Modal */}
      {showAddActivity && (
        <Modal title="Nuova Attività" onClose={() => setShowAddActivity(false)}>
          <form onSubmit={handleAddActivity} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input placeholder="Titolo *" value={activityForm.title} onChange={e => setActivityForm({ ...activityForm, title: e.target.value })} required autoFocus />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {["chiamata", "email", "meeting", "nota"].map(type => (
                <button key={type} type="button" onClick={() => setActivityForm({ ...activityForm, type })} style={{
                  padding: "0.5rem", backgroundColor: activityForm.type === type ? "var(--accent-primary)" : "var(--bg-tertiary)",
                  border: activityForm.type === type ? "1px solid var(--accent-primary)" : "1px solid var(--border)",
                  borderRadius: "0.375rem", color: activityForm.type === type ? "#fff" : "var(--text-secondary)",
                  fontSize: "0.75rem", cursor: "pointer", textTransform: "capitalize",
                }}>
                  {type}
                </button>
              ))}
            </div>
            <input type="date" value={activityForm.date} onChange={e => setActivityForm({ ...activityForm, date: e.target.value })} />
            <textarea placeholder="Descrizione" value={activityForm.description} onChange={e => setActivityForm({ ...activityForm, description: e.target.value })} rows={2} style={{ padding: "0.625rem", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--text-primary)", outline: "none", resize: "vertical" }} />
            <button type="submit" style={{ padding: "0.75rem", backgroundColor: "var(--success)", color: "#fff", borderRadius: "0.5rem", fontWeight: 600, border: "none", cursor: "pointer", minHeight: "44px" }}>Crea</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "0.75rem", padding: "1rem", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ color: "var(--text-secondary)" }}>{icon}</div>
      <div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{label}</div>
        <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{value}</div>
      </div>
    </div>
  );
}

function TaskSection({ title, color, icon, tasks, onToggle, onDelete }: { title: string; color: string; icon: React.ReactNode; tasks: any[]; onToggle: (t: any) => void; onDelete: (id: number) => void }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <h4 style={{ fontSize: "0.8125rem", fontWeight: 600, color, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
        {icon} {title} ({tasks.length})
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        {tasks.map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0.75rem", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0.5rem" }}>
            <button onClick={() => onToggle(t)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              {t.status === "completed" ? <CheckCircle2 size={16} color="#10b981" /> : t.status === "in_progress" ? <Clock size={16} color="#f59e0b" /> : <Circle size={16} color="#6b7280" />}
            </button>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: "0.8125rem", color: t.status === "completed" ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: t.status === "completed" ? "line-through" : "none" }}>{t.title}</div>
              {t.due_date && <div style={{ fontSize: "0.6875rem", color: "var(--text-secondary)" }}>{t.due_date.split('T')[0]}</div>}
            </div>
            <button onClick={() => onDelete(t.id)} style={{ padding: "0.25rem", background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityRow({ activity, onDelete }: { activity: any; onDelete: (id: number) => void }) {
  const typeColors: Record<string, string> = { chiamata: "#3b82f6", email: "#10b981", meeting: "#f59e0b", nota: "#8b5cf6" };
  const color = typeColors[activity.type] || "var(--text-secondary)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0.75rem" }}>
      <div style={{ width: 32, height: 32, borderRadius: "0.5rem", backgroundColor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
        <Zap size={16} />
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-primary)" }}>{activity.title}</div>
        <div style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", display: "flex", gap: "0.5rem" }}>
          {activity.date && <span>{activity.date.split('T')[0]}</span>}
          {activity.type && <span style={{ color, fontWeight: 500 }}>{activity.type}</span>}
        </div>
      </div>
      <button onClick={() => onDelete(activity.id)} style={{ padding: "0.25rem", background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}><Trash2 size={14} /></button>
    </div>
  );
}

function ContactRow({ contact, onDelete }: { contact: any; onDelete: (id: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0.75rem" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", flexShrink: 0 }}>
        <User size={14} />
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-primary)" }}>{contact.name}</div>
        <div style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {contact.phone && <span>{contact.phone}</span>}
          {contact.email && <span>{contact.email}</span>}
        </div>
      </div>
      <button onClick={() => onDelete(contact.id)} style={{ padding: "0.25rem", background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}><Trash2 size={14} /></button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)", borderRadius: "1rem", border: "1px solid var(--border)" }}>
      {text}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
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
