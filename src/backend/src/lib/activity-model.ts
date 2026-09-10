import { query } from "./db.js";

export const activityModel = {
  async findMany(where?: Record<string, any>) {
    let sql = `SELECT activities.*, companies.name AS company_name, tasks.title AS task_title 
               FROM activities 
               LEFT JOIN companies ON activities.company_id = companies.id
               LEFT JOIN tasks ON activities.task_id = tasks.id`;
    const params: any[] = [];
    if (where && Object.keys(where).length) {
      const clauses = Object.keys(where).map((k) => `${k} = ?`);
      sql += ` WHERE ${clauses.join(" AND ")}`;
      params.push(...Object.values(where));
    }
    sql += " ORDER BY activities.date DESC, activities.created_at DESC";
    return query(sql, params);
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
