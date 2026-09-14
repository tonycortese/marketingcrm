import { createPool, PoolConnection } from "mysql2/promise";

interface DbConfig {
  host: string; port: number; user: string; password: string;
  database: string; connectionLimit: number;
}
const cfg: DbConfig = {
  host: process.env.DB_HOST ?? "localhost",
  port: parseInt(process.env.DB_PORT ?? "3306"),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "crm",
  connectionLimit: parseInt(process.env.DB_POOL_LIMIT ?? "10"),
};
const pool = createPool({
  host: cfg.host, port: cfg.port, user: cfg.user,
  password: cfg.password, database: cfg.database,
  connectionLimit: cfg.connectionLimit,
});

export async function getConnection(): Promise<PoolConnection> { return pool.getConnection(); }
export async function query(sql: string, params?: any[]): Promise<any[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as any[];
}

export async function initDb(): Promise<void> {
  await pool.query(`CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    status ENUM('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
    company_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    token VARCHAR(255) NULL,
    token_expires DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(50),
    type VARCHAR(100),
    status ENUM('sconosciuto','conosciuto','potenziale','cliente','inattivo','perso','non_interessato') NOT NULL DEFAULT 'sconosciuto',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    company_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE,
    type ENUM('chiamata','email','meeting','nota') NULL,
    company_id INT NULL,
    task_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
  )`);

  await ensureSchemaUpdates();
  console.log("[DB] Schema inizializzato.");
}

async function ensureSchemaUpdates(): Promise<void> {
  // Aggiorna schema companies: aggiungi colonna status se manca
  try {
    const [columns] = await pool.execute("SHOW COLUMNS FROM companies LIKE 'status'");
    if ((columns as any[]).length === 0) {
      console.log("[DB] Aggiornamento schema: aggiunta colonna 'status' a companies...");
      await pool.query(
        `ALTER TABLE companies ADD COLUMN status ENUM('sconosciuto','conosciuto','potenziale','cliente','inattivo','perso','non_interessato') NOT NULL DEFAULT 'sconosciuto' AFTER type`
      );
      console.log("[DB] Schema aggiornato.");
    }
  } catch (err) {
    console.error("[DB] Schema check error:", err);
  }

  // Aggiorna schema tasks: aggiungi colonna company_id se manca
  try {
    const [columns] = await pool.execute("SHOW COLUMNS FROM tasks LIKE 'company_id'");
    if ((columns as any[]).length === 0) {
      console.log("[DB] Aggiornamento schema: aggiunta colonna 'company_id' a tasks...");
      await pool.query(
        `ALTER TABLE tasks ADD COLUMN company_id INT NULL AFTER status, ADD FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL`
      );
      console.log("[DB] Schema tasks aggiornato.");
    }
  } catch (err) {
    console.error("[DB] Schema check error:", err);
  }

  // Aggiorna schema activities: aggiungi colonna task_id se manca
  try {
    const [columns] = await pool.execute("SHOW COLUMNS FROM activities LIKE 'task_id'");
    if ((columns as any[]).length === 0) {
      console.log("[DB] Aggiornamento schema: aggiunta colonna 'task_id' a activities...");
      await pool.query(
        `ALTER TABLE activities ADD COLUMN task_id INT NULL AFTER company_id, ADD FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL`
      );
      console.log("[DB] Schema activities aggiornato.");
    }
  } catch (err) {
    console.error("[DB] Schema check error:", err);
  }
}

export { pool, cfg };
