import { createPool, PoolConnection } from "mysql2/promise";

interface DbConfig {
  host: string; port: number; user: string; password: string;
  database: string; connectionLimit: number;
}
const cfg: DbConfig = {
  host: process.env.DB_HOST ?? "localhost", port: parseInt(process.env.DB_PORT ?? "3306"),
  user: process.env.DB_USER ?? "root", password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "crm", connectionLimit: parseInt(process.env.DB_POOL_LIMIT ?? "10"),
};
const pool = createPool({ host: cfg.host, port: cfg.port, user: cfg.user, password: cfg.password, database: cfg.database, connectionLimit: cfg.connectionLimit });
export async function getConnection(): Promise<PoolConnection> { return pool.getConnection(); }
export async function query(sql: string, params?: any[]): Promise<any[]> { const [rows] = await pool.execute(sql, params); return rows as any[]; }
export async function initDb(): Promise<void> {
  await pool.query(`CREATE TABLE IF NOT EXISTS clients (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255), phone VARCHAR(50), company VARCHAR(255), created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS tasks (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, due_date DATE, status ENUM('pending','in_progress','completed') NOT NULL DEFAULT 'pending', client_id INT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL)`);
  console.log("[DB] Schema inizializzato.");
}
export { pool, cfg };
