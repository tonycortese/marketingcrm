import { query } from "./db.js";
import type { Pagination, PaginatedResult } from "./company-model.js";

function parsePagination(pagination?: Pagination): { page: number; limit: number; offset: number } {
  const page = Math.max(1, pagination?.page ?? 1);
  const limit = Math.min(100, Math.max(1, pagination?.limit ?? 50));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export const activityModel = {
  async findMany(where?: Record<string, any>, pagination?: Pagination): Promise<PaginatedResult<any>> {
    const params: any[] = [];
    let sql = `SELECT activities.*, companies.name AS company_name, tasks.title AS task_title 
               FROM activities 
               LEFT JOIN companies ON activities.company_id = companies.id
               LEFT JOIN tasks ON activities.task_id = tasks.id`;
    if (where && Object.keys(where).length) {
      const clauses = Object.keys(where).map((k) => `${k} = ?`);
      sql += ` WHERE ${clauses.join(" AND ")}`;
      params.push(...Object.values(where));
    }
    sql += " ORDER BY activities.date DESC, activities.created_at DESC";

    const countSql = sql.replace(/SELECT .* FROM/, "SELECT COUNT(*) AS total FROM");
    const countRows = await query(countSql, params);
    const total = Number(countRows[0]?.total ?? 0);

    const { page, limit, offset } = parsePagination(pagination);
    sql += ` LIMIT ${limit} OFFSET ${offset}`;
    const data = await query(sql, params);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  },

  async findByCompany(companyId: number) {
    return query(
      "SELECT * FROM activities WHERE company_id = ? ORDER BY date DESC",
      [companyId]
    );
  },

  async findUnique(id: number) {
    const rows = await query(
      `SELECT activities.*, companies.name AS company_name 
       FROM activities 
       LEFT JOIN companies ON activities.company_id = companies.id 
       WHERE activities.id = ?`,
      [id]
    );
    return (rows as any[])[0] ?? null;
  },

  async create(data: Record<string, any>) {
    const { title, description, date, type, company_id } = data;
    const result = await query(
      `INSERT INTO activities (title, description, date, type, company_id) VALUES (?, ?, ?, ?, ?)`,
      [title, description || null, date || null, type || null, company_id || null]
    );
    return { insertId: (result as any).insertId ?? 0 };
  },

  async update(id: number, data: Record<string, any>) {
    const { created_at, updated_at, id: _id, company_name, ...cleanData } = data;
    const sets: string[] = [];
    const params: any[] = [];
    for (const [k, v] of Object.entries(cleanData)) {
      if (v !== undefined) {
        sets.push(`${k} = ?`);
        params.push(v);
      }
    }
    if (!sets.length) return;
    params.push(id);
    await query(`UPDATE activities SET ${sets.join(", ")} WHERE id = ?`, params);
  },

  async delete(id: number) {
    await query("DELETE FROM activities WHERE id = ?", [id]);
  },
};
