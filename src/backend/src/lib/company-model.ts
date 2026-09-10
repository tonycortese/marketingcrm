import { query } from "./db.js";

export const companyModel = {
  async findMany(where?: Record<string, any>) {
    let sql = "SELECT * FROM companies";
    const params: any[] = [];
    if (where && Object.keys(where).length) {
      const clauses = Object.keys(where).map((k) => `${k} = ?`);
      sql += ` WHERE ${clauses.join(" AND ")}`;
      params.push(...Object.values(where));
    }
    sql += " ORDER BY name ASC";
    return query(sql, params);
  },

  async findUnique(id: number) {
    const rows = await query("SELECT * FROM companies WHERE id = ?", [id]);
    return (rows as any[])[0] ?? null;
  },

  async create(data: Record<string, any>) {
    const { name, city, address, phone, type, status } = data;
    const result = await query(
      `INSERT INTO companies (name, city, address, phone, type, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, city || null, address || null, phone || null, type || null, status || 'sconosciuto']
    );
    return { insertId: (result as any).insertId ?? 0 };
  },

  async update(id: number, data: Record<string, any>) {
    const { created_at, updated_at, id: _id, ...cleanData } = data;
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
    await query(`UPDATE companies SET ${sets.join(", ")} WHERE id = ?`, params);
  },

  async delete(id: number) {
    await query("DELETE FROM companies WHERE id = ?", [id]);
  },
};
