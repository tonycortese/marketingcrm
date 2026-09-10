import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
export function useClients() {
  const [clients, setClients] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  const fetchClients = useCallback(async () => { try { const { data } = await api.get("/clients"); setClients(data); } catch (err) { console.error(err); } finally { setLoading(false); } }, []);
  useEffect(() => { fetchClients(); }, [fetchClients]);
  const addClient = async (client: any) => { await api.post("/clients", client); await fetchClients(); };
  const updateClient = async (id: number, data: any) => { await api.patch(`/clients/${id}`, data); await fetchClients(); };
  const deleteClient = async (id: number) => { await api.delete(`/clients/${id}`); await fetchClients(); };
  return { clients, loading, addClient, updateClient, deleteClient, refresh: fetchClients };
}
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  const fetchTasks = useCallback(async () => { try { const { data } = await api.get("/tasks"); setTasks(data); } catch (err) { console.error(err); } finally { setLoading(false); } }, []);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  const addTask = async (task: any) => { await api.post("/tasks", task); await fetchTasks(); };
  const updateTask = async (id: number, data: any) => { await api.patch(`/tasks/${id}`, data); await fetchTasks(); };
  const deleteTask = async (id: number) => { await api.delete(`/tasks/${id}`); await fetchTasks(); };
  return { tasks, loading, addTask, updateTask, deleteTask, refresh: fetchTasks };
}
export function useDashboard() {
  const [stats, setStats] = useState<any>(null);
  const fetchStats = useCallback(async () => { try { const { data } = await api.get("/dashboard/stats"); setStats(data); } catch (err) { console.error(err); } }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  return { stats, refresh: fetchStats };
}
