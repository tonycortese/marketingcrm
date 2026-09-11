import { useState } from "react";
import { useTasks, useCompanies } from "../hooks/useData";
import { useRealtimeRefresh } from "../lib/socket-context";
import { CheckCircle2, Circle, Clock, Calendar, Trash2, Plus, X } from "lucide-react";

export default function TasksPage() {
  const { tasks, loading, addTask, updateTask, deleteTask, refresh: refreshTasks } = useTasks();
  const { companies } = useCompanies();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", due_date: "", status: "pending", company_id: null as number | null });

  // Realtime refresh
  useRealtimeRefresh("task:created", refreshTasks);
  useRealtimeRefresh("task:updated", refreshTasks);
  useRealtimeRefresh("task:deleted", refreshTasks);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await addTask(form);
    setForm({ title: "", description: "", due_date: "", status: "pending", company_id: null });
    setShowAdd(false);
  };

  const handleToggle = async (task: any) => {
    const next = task.status === "completed" ? "pending" : task.status === "in_progress" ? "completed" : "in_progress";
    await updateTask(task.id, { status: next });
  };

  const pending = tasks.filter((t: any) => t.status === "pending");
  const inProgress = tasks.filter((t: any) => t.status === "in_progress");
  const completed = tasks.filter((t: any) => t.status === "completed");

  const getCompanyName = (id: number | null) => companies.find((c: any) => c.id === id)?.name || "";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>Task</h1>
        <button onClick={() => setShowAdd(true)} style={{ padding: "0.625rem 1rem", backgroundColor: "var(--accent-primary)", color: "#fff", borderRadius: "0.5rem", fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.375rem", minHeight: "44px" }}>
          <Plus size={16} /> Nuovo
        </button>
      </div>

      {loading && <p style={{ color: "var(--text-secondary)" }}>Caricamento...</p>}

      {tasks.length === 0 && !loading && (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <p>Nessun task</p>
        </div>
      )}

      {pending.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Circle size={14} /> Da fare ({pending.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {pending.map((t: any) => <TaskRow key={t.id} task={t} onToggle={handleToggle} onDelete={deleteTask} companyName={getCompanyName(t.company_id)} />)}
          </div>
        </div>
      )}

      {inProgress.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--warning)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={14} /> In corso ({inProgress.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {inProgress.map((t: any) => <TaskRow key={t.id} task={t} onToggle={handleToggle} onDelete={deleteTask} companyName={getCompanyName(t.company_id)} />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--success)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={14} /> Completati ({completed.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {completed.map((t: any) => <TaskRow key={t.id} task={t} onToggle={handleToggle} onDelete={deleteTask} companyName={getCompanyName(t.company_id)} />)}
          </div>
        </div>
      )}

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }} onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "1rem", width: "100%", maxWidth: 420, padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>Nuovo Task</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "0.375rem", padding: "0.25rem", color: "var(--text-secondary)", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input placeholder="Titolo *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
              <input placeholder="Descrizione" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              <select value={form.company_id || ""} onChange={(e) => setForm({ ...form, company_id: e.target.value ? Number(e.target.value) : null })} style={{ padding: "0.625rem", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: form.company_id ? "var(--text-primary)" : "var(--text-secondary)", outline: "none" }}>
                <option value="">Nessuna azienda</option>
                {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="submit" style={{ padding: "0.75rem", backgroundColor: "var(--accent-primary)", color: "#fff", borderRadius: "0.5rem", fontWeight: 600, border: "none", cursor: "pointer", minHeight: "44px" }}>Crea</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete, companyName }: { task: any; onToggle: (t: any) => void; onDelete: (id: number) => void; companyName: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0.75rem" }}>
      <button onClick={() => onToggle(task)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        {task.status === "completed" ? <CheckCircle2 size={20} color="#10b981" /> : task.status === "in_progress" ? <Clock size={20} color="#f59e0b" /> : <Circle size={20} color="#6b7280" />}
      </button>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ fontSize: "0.875rem", color: task.status === "completed" ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: task.status === "completed" ? "line-through" : "none" }}>{task.title}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", gap: "0.5rem" }}>
          {companyName && <span>{companyName}</span>}
          {task.due_date && <span>• {task.due_date.split('T')[0]}</span>}
        </div>
      </div>
      <button onClick={() => onDelete(task.id)} style={{ padding: "0.375rem", background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}><Trash2 size={16} /></button>
    </div>
  );
}
