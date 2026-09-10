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
export function useCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchCompanies = useCallback(async () => {
    try {
      const { data } = await api.get("/companies");
      setCompanies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);
  const addCompany = async (company: any) => {
    await api.post("/companies", company);
    await fetchCompanies();
  };
  const updateCompany = async (id: number, data: any) => {
    await api.patch(`/companies/${id}`, data);
    await fetchCompanies();
  };
  const deleteCompany = async (id: number) => {
    await api.delete(`/companies/${id}`);
    await fetchCompanies();
  };
  return { companies, loading, addCompany, updateCompany, deleteCompany, refresh: fetchCompanies };
}

export function useContacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchContacts = useCallback(async () => {
    try {
      const { data } = await api.get("/contacts");
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);
  const addContact = async (contact: any) => {
    await api.post("/contacts", contact);
    await fetchContacts();
  };
  const updateContact = async (id: number, data: any) => {
    await api.patch(`/contacts/${id}`, data);
    await fetchContacts();
  };
  const deleteContact = async (id: number) => {
    await api.delete(`/contacts/${id}`);
    await fetchContacts();
  };
  return { contacts, loading, addContact, updateContact, deleteContact, refresh: fetchContacts };
}

export function useActivities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchActivities = useCallback(async () => {
    try {
      const { data } = await api.get("/activities");
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);
  const addActivity = async (activity: any) => {
    await api.post("/activities", activity);
    await fetchActivities();
  };
  const updateActivity = async (id: number, data: any) => {
    await api.patch(`/activities/${id}`, data);
    await fetchActivities();
  };
  const deleteActivity = async (id: number) => {
    await api.delete(`/activities/${id}`);
    await fetchActivities();
  };
  return { activities, loading, addActivity, updateActivity, deleteActivity, refresh: fetchActivities };
}

export function useDashboard() {
  const [stats, setStats] = useState<any>(null);
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/dashboard/stats");
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }, []);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  return { stats, refresh: fetchStats };
}
