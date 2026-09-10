import { createPool, PoolConnection } from "mysql2/promise";
import { query } from "./db.js";
function snakeCase(s: string): string { return s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`); }
function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) { if (v !== undefined) out[k] = v; }
  return out as Partial<T>;
}
export const clientModel = {
  async findMany(where?: Record<string, any>, orderBy?: Record<string, string>) {
    let sql = "SELECT * FROM clients"; const params: any[] = [];
    if (where && Object.keys(where).length) { const clauses = Object.keys(where).map((k) => `${snakeCase(k)} = ?`); sql += ` WHERE ${clauses.join(" AND ")}`; params.push(...Object.values(where)); }
    if (orderBy && Object.keys(orderBy).length) { const [col, dir] = Object.entries(orderBy)[0]; sql += ` ORDER BY \`${snakeCase(col)}\` ${dir.toUpperCase()}`; }
    return query(sql, params);
  },
  async findUnique(id: number) { const rows = await query("SELECT * FROM clients WHERE id = ?", [id]); return (rows as any[])[0] ?? null; },
  async create(data: Record<string, any>) { const clean = stripUndefined(data); const cols = Object.keys(clean).map(snakeCase).join(", "); const vals = Object.values(clean).map(() => "?"); const sql = `INSERT INTO clients (${cols}) VALUES (${vals.join(", ")})`; await query(sql, Object.values(clean)); return { insertId: 0 }; },
  async update(id: number, data: Record<string, any>) { const clean = stripUndefined(data); if (!Object.keys(clean).length) return; const sets = Object.keys(clean).map((k) => `${snakeCase(k)} = ?`).join(", "); const sql = `UPDATE clients SET ${sets} WHERE id = ?`; await query(sql, [...Object.values(clean), id]); },
  async delete(id: number) { await query("DELETE FROM clients WHERE id = ?", [id]); },
};
export const taskModel = {
  async findMany(where?: Record<string, any>, orderBy?: Record<string, string>) {
    let sql = "SELECT tasks.*, clients.name AS client_name FROM tasks LEFT JOIN clients ON tasks.client_id = clients.id"; const params: any[] = [];
    if (where && Object.keys(where).length) { const clauses = Object.keys(where).map((k) => `${snakeCase(k)} = ?`); sql += ` WHERE ${clauses.join(" AND ")}`; params.push(...Object.values(where)); }
    if (orderBy && Object.keys(orderBy).length) { const [col, dir] = Object.entries(orderBy)[0]; sql += ` ORDER BY \`${snakeCase(col)}\` ${dir.toUpperCase()}`; }
    return query(sql, params);
  },
  async findUnique(id: number) { const rows = await query("SELECT tasks.*, clients.name AS client_name FROM tasks LEFT JOIN clients ON tasks.client_id = clients.id WHERE tasks.id = ?", [id]); return (rows as any[])[0] ?? null; },
  async create(data: Record<string, any>) { const clean = stripUndefined(data); const cols = Object.keys(clean).map(snakeCase).join(", "); const vals = Object.values(clean).map(() => "?"); const sql = `INSERT INTO tasks (${cols}) VALUES (${vals.join(", ")})`; await query(sql, Object.values(clean)); return { insertId: 0 }; },
  async update(id: number, data: Record<string, any>) { const clean = stripUndefined(data); if (!Object.keys(clean).length) return; const sets = Object.keys(clean).map((k) => `${snakeCase(k)} = ?`).join(", "); const sql = `UPDATE tasks SET ${sets} WHERE id = ?`; await query(sql, [...Object.values(clean), id]); },
  async delete(id: number) { await query("DELETE FROM tasks WHERE id = ?", [id]); },
};
export async function getDashboard() { const clients = await query("SELECT COUNT(*) AS total FROM clients"); const tasks = await query("SELECT COUNT(*) AS total FROM tasks"); return { totalClients: clients[0].total, totalTasks: tasks[0].total }; }
