import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  const addTask = async (task: any) => { await api.post("/tasks", task); };
  const updateTask = async (id: number, data: any) => { await api.patch(`/tasks/${id}`, data); };
  const deleteTask = async (id: number) => { await api.delete(`/tasks/${id}`); };
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
  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);
  const addCompany = async (company: any) => { await api.post("/companies", company); };
  const updateCompany = async (id: number, data: any) => { await api.patch(`/companies/${id}`, data); };
  const deleteCompany = async (id: number) => { await api.delete(`/companies/${id}`); };
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
  useEffect(() => { fetchContacts(); }, [fetchContacts]);
  const addContact = async (contact: any) => { await api.post("/contacts", contact); };
  const updateContact = async (id: number, data: any) => { await api.patch(`/contacts/${id}`, data); };
  const deleteContact = async (id: number) => { await api.delete(`/contacts/${id}`); };
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
  useEffect(() => { fetchActivities(); }, [fetchActivities]);
  const addActivity = async (activity: any) => { await api.post("/activities", activity); };
  const updateActivity = async (id: number, data: any) => { await api.patch(`/activities/${id}`, data); };
  const deleteActivity = async (id: number) => { await api.delete(`/activities/${id}`); };
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
  useEffect(() => { fetchStats(); }, [fetchStats]);
  return { stats, refresh: fetchStats };
}
