import { Router, Request, Response } from "express";
import { Server as SocketIOServer, Socket } from "socket.io";
import authRoutes from "./auth.js";
import { createCompaniesRouter } from "./crm-companies.js";
import { createActivitiesRouter } from "./crm-activities.js";
import { createTasksRouter } from "./crm-tasks.js";
import { query } from "../lib/db.js";
import { authLimiter } from "../middleware/rate-limit.js";

export function mountCrmRoutes(app: Router, io: SocketIOServer): void {
  app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok", ts: Date.now() }));
  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api", createCompaniesRouter(io));
  app.use("/api", createActivitiesRouter(io));
  app.use("/api", createTasksRouter(io));

  // Dashboard stats — single aggregated query
  app.get("/api/dashboard/stats", async (_req: Request, res: Response) => {
    try {
      const sql = `SELECT
        (SELECT COUNT(*) FROM companies) AS totalCompanies,
        (SELECT COUNT(*) FROM contacts) AS totalContacts,
        (SELECT COUNT(*) FROM tasks) AS totalTasks,
        (SELECT COUNT(*) FROM tasks WHERE status != 'completed') AS openTasks,
        (SELECT COUNT(*) FROM activities) AS totalActivities,
        (SELECT COUNT(*) FROM activities WHERE date >= CURDATE()) AS todayActivities`;
      const rows = await query(sql);
      const row = rows[0] as any;
      res.json({
        totalCompanies: Number(row.totalCompanies),
        totalContacts: Number(row.totalContacts),
        totalTasks: Number(row.totalTasks),
        openTasks: Number(row.openTasks),
        totalActivities: Number(row.totalActivities),
        todayActivities: Number(row.todayActivities),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
}

export function handleConnection(socket: Socket): void {
  console.log(`[SocketIO] client connesso: ${socket.id}`);
  socket.on("disconnect", () => { console.log(`[SocketIO] client disconnesso: ${socket.id}`); });
}
