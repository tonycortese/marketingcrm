import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

function parsePagination(data: any): PaginatedResponse<any> {
  if (data && "data" in data && "total" in data) {
    return data as PaginatedResponse<any>;
  }
  return { data: Array.isArray(data) ? data : [], total: 0, page: 1, totalPages: 1 };
}

export function useTasks() {
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async (page = 1, limit = 50) => {
    try {
      const { data } = await api.get("/tasks", { params: { page, limit } });
      const parsed = parsePagination(data);
      setItems(parsed.data);
      setPagination({ page: parsed.page, limit, total: parsed.total, totalPages: parsed.totalPages });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const setPage = (page: number) => fetchTasks(page, pagination.limit);
  const setLimit = (limit: number) => fetchTasks(1, limit);

  const addTask = async (task: any) => { await api.post("/tasks", task); };
  const updateTask = async (id: number, data: any) => { await api.patch(`/tasks/${id}`, data); };
  const deleteTask = async (id: number) => { await api.delete(`/tasks/${id}`); };
  const refresh = () => fetchTasks(pagination.page, pagination.limit);

  return { items, pagination, loading, addTask, updateTask, deleteTask, refresh, setPage, setLimit };
}

export function useCompanies() {
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchCompanies = useCallback(async (page = 1, limit = 50) => {
    try {
      const { data } = await api.get("/companies", { params: { page, limit } });
      const parsed = parsePagination(data);
      setItems(parsed.data);
      setPagination({ page: parsed.page, limit, total: parsed.total, totalPages: parsed.totalPages });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const setPage = (page: number) => fetchCompanies(page, pagination.limit);
  const setLimit = (limit: number) => fetchCompanies(1, limit);

  const addCompany = async (company: any) => { await api.post("/companies", company); };
  const updateCompany = async (id: number, data: any) => { await api.patch(`/companies/${id}`, data); };
  const deleteCompany = async (id: number) => { await api.delete(`/companies/${id}`); };
  const refresh = () => fetchCompanies(pagination.page, pagination.limit);

  return { items, pagination, loading, addCompany, updateCompany, deleteCompany, refresh, setPage, setLimit };
}

export function useContacts() {
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async (page = 1, limit = 50) => {
    try {
      const { data } = await api.get("/contacts", { params: { page, limit } });
      const parsed = parsePagination(data);
      setItems(parsed.data);
      setPagination({ page: parsed.page, limit, total: parsed.total, totalPages: parsed.totalPages });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const setPage = (page: number) => fetchContacts(page, pagination.limit);
  const setLimit = (limit: number) => fetchContacts(1, limit);

  const addContact = async (contact: any) => { await api.post("/contacts", contact); };
  const updateContact = async (id: number, data: any) => { await api.patch(`/contacts/${id}`, data); };
  const deleteContact = async (id: number) => { await api.delete(`/contacts/${id}`); };
  const refresh = () => fetchContacts(pagination.page, pagination.limit);

  return { items, pagination, loading, addContact, updateContact, deleteContact, refresh, setPage, setLimit };
}

export function useActivities() {
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async (page = 1, limit = 50) => {
    try {
      const { data } = await api.get("/activities", { params: { page, limit } });
      const parsed = parsePagination(data);
      setItems(parsed.data);
      setPagination({ page: parsed.page, limit, total: parsed.total, totalPages: parsed.totalPages });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const setPage = (page: number) => fetchActivities(page, pagination.limit);
  const setLimit = (limit: number) => fetchActivities(1, limit);

  const addActivity = async (activity: any) => { await api.post("/activities", activity); };
  const updateActivity = async (id: number, data: any) => { await api.patch(`/activities/${id}`, data); };
  const deleteActivity = async (id: number) => { await api.delete(`/activities/${id}`); };
  const refresh = () => fetchActivities(pagination.page, pagination.limit);

  return { items, pagination, loading, addActivity, updateActivity, deleteActivity, refresh, setPage, setLimit };
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
