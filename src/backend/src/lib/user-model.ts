import { query } from "./db.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const userModel = {
  async findByEmail(email: string) {
    const rows = await query("SELECT * FROM users WHERE email = ?", [email]);
    return (rows as any[])[0] ?? null;
  },

  async findUnique(id: number) {
    const rows = await query("SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?", [id]);
    return (rows as any[])[0] ?? null;
  },

  async create(data: { name: string; email: string; password: string }) {
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const rows = await query(
      `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
      [data.name, data.email, passwordHash]
    );
    return { insertId: (rows as any)[0]?.insertId ?? 0 };
  },

  async verifyLogin(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return null;
    return user;
  },

  async assignToken(id: number, token: string) {
    await query(`UPDATE users SET token = ?, token_expires = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = ?`, [token, id]);
  },

  async clearToken(id: number) {
    await query(`UPDATE users SET token = NULL, token_expires = NULL WHERE id = ?`, [id]);
  },

  async findByToken(token: string) {
    const rows = await query(
      `SELECT id, name, email, created_at, updated_at FROM users WHERE token = ? AND token_expires > NOW()`,
      [token]
    );
    return (rows as any[])[0] ?? null;
  },
};
