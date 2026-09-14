import { useState, useEffect, useMemo } from "react";
import { useCompanies, useActivities, useTasks } from "../hooks/useData";
import { useRealtimeRefresh } from "../lib/socket-context";
import { Plus, Building, Zap, CheckCircle2, Circle, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CompanyFunnel from "../components/CompanyFunnel";
import ActivityFunnel from "../components/ActivityFunnel";

export default function DashboardPage() {
  const { items: companies, pagination: companiesPagination, refresh: refreshCompanies } = useCompanies();
  const { refresh: refreshActivities } = useActivities();
  const { items: tasks, updateTask, refresh: refreshTasks } = useTasks();
  const navigate = useNavigate();
  const [funnelOpen, setFunnelOpen] = useState(false);
  const [activityFunnelOpen, setActivityFunnelOpen] = useState(false);

  // Realtime refresh
  useRealtimeRefresh("company:created", refreshCompanies);
  useRealtimeRefresh("company:updated", refreshCompanies);
  useRealtimeRefresh("company:deleted", refreshCompanies);
  useRealtimeRefresh("task:created", refreshTasks);
  useRealtimeRefresh("task:updated", refreshTasks);
  useRealtimeRefresh("task:deleted", refreshTasks);
  useRealtimeRefresh("activity:created", refreshActivities);
  useRealtimeRefresh("activity:updated", refreshActivities);
  useRealtimeRefresh("activity:deleted", refreshActivities);

  const openTasks = useMemo(() => tasks.filter((t: any) => t.status !== "completed"), [tasks]);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = useMemo(() =>
    openTasks.filter((t: any) => t.due_date && t.due_date.split('T')[0] <= todayStr),
  [openTasks, todayStr]);
  const upcomingTasks = useMemo(() =>
    openTasks.filter((t: any) => !t.due_date || t.due_date.split('T')[0] > todayStr),
  [openTasks, todayStr]);

  const handleToggleTask = async (task: any) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    await updateTask(task.id, { status: nextStatus });
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1rem" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Panoramica generale del CRM
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setActivityFunnelOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.75rem 1rem", backgroundColor: "var(--success)", color: "#fff",
              border: "none", borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 600,
              cursor: "pointer", minHeight: "44px",
            }}
          >
            <Zap size={18} /> Nuova Attività
          </button>
          <button
            onClick={() => setFunnelOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.75rem 1rem", backgroundColor: "var(--accent-primary)", color: "#fff",
              border: "none", borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 600,
              cursor: "pointer", minHeight: "44px",
            }}
          >
            <Plus size={18} /> Nuova Azienda
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}>
        <KpiCard label="Aziende" value={companiesPagination.total} icon={<Building size={28} />} accent="#3b82f6" />
        <KpiCard label="Task Aperti" value={openTasks.length} icon={<CheckCircle2 size={28} />} accent="#10b981" />
      </div>

      {/* Task sections */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1rem",
        marginBottom: "1rem",
      }}>
        <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "1rem", padding: "1.25rem", border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={16} style={{ color: "var(--danger)" }} />
            Oggi / In scadenza ({todayTasks.length})
          </h3>
          {todayTasks.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", fontStyle: "italic" }}>Nessun task urgente</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {todayTasks.slice(0, 5).map((task: any) => (
                <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
              ))}
              {todayTasks.length > 5 && (
                <button onClick={() => navigate("/tasks")} style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "0.75rem", cursor: "pointer", padding: "0.25rem 0" }}>
                  +{todayTasks.length - 5} altri
                </button>
              )}
            </div>
          )}
        </div>

        <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "1rem", padding: "1.25rem", border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={16} style={{ color: "var(--warning)" }} />
            Prossimi ({upcomingTasks.length})
          </h3>
          {upcomingTasks.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", fontStyle: "italic" }}>Nessun task in programma</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {upcomingTasks.slice(0, 5).map((task: any) => (
                <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
              ))}
              {upcomingTasks.length > 5 && (
                <button onClick={() => navigate("/tasks")} style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "0.75rem", cursor: "pointer", padding: "0.25rem 0" }}>
                  +{upcomingTasks.length - 5} altri
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {openTasks.length === 0 && (
        <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "1rem", padding: "1.25rem", border: "1px solid var(--border)", textAlign: "center" }}>
          <CheckCircle2 size={48} style={{ margin: "0 auto 1rem", opacity: 0.3, color: "var(--success)" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Nessun task aperto. Crea un'azienda e aggiungi i suoi task!
          </p>
        </div>
      )}

      <CompanyFunnel open={funnelOpen} onClose={() => setFunnelOpen(false)} onCreated={refreshCompanies} />
      <ActivityFunnel open={activityFunnelOpen} onClose={() => setActivityFunnelOpen(false)} onCreated={refreshActivities} companies={companies} />
    </div>
  );
}

function KpiCard({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent: string }) {
  return (
    <div style={{
      backgroundColor: "var(--bg-secondary)", borderRadius: "1rem", padding: "1.25rem",
      border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1rem",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "0.75rem",
        backgroundColor: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center",
        color: accent, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{label}</div>
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle }: { task: any; onToggle: (t: any) => void }) {
  const formatDate = (d: string) => d ? d.split('T')[0] : '';

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.375rem 0" }}>
      <button onClick={() => onToggle(task)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
        {task.status === "in_progress" ? <Clock size={16} color="#f59e0b" /> : <Circle size={16} color="#6b7280" />}
      </button>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ fontSize: "0.812rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
        <div style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", display: "flex", gap: "0.5rem" }}>
          {task.company_name && <span>{task.company_name}</span>}
          {task.due_date && <span>• {formatDate(task.due_date)}</span>}
        </div>
      </div>
    </div>
  );
}
