import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useDashboard } from "../hooks/useData";
export default function DashboardPage() {
  const { stats } = useDashboard(); const [notifications, setNotifications] = useState<string[]>([]);
  useEffect(() => { const s = io(import.meta.env.VITE_API_BASE_URL ?? ""); s.on("connect", () => console.log("[WS] connected")); s.on("task:added", (d: any) => setNotifications(n => [`Task aggiunto: ${d.title}`, ...n.slice(0, 9)])); return () => { s.disconnect(); }; }, []);
  return <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}><h1>Dashboard</h1><div style={{ display: "flex", gap: 40, marginBottom: 20 }}><div style={{ background: "#e3f2fd", padding: 20, borderRadius: 8 }}><h2>{stats?.totalClients ?? "—"}</h2><p>Clienti</p></div><div style={{ background: "#fff3e0", padding: 20, borderRadius: 8 }}><h2>{stats?.totalTasks ?? "—"}</h2><p>Task</p></div></div>{notifications.length > 0 && <div style={{ marginTop: 20 }}><h3>Notifiche realtime</h3>{notifications.map((n, i) => <p key={i} style={{ fontSize: 14, color: "#666" }}>{n}</p>)}</div>}</div>;
}
