import { Router, Request, Response } from "express";
import { Server as SocketIOServer, Socket } from "socket.io";
import authRoutes from "./auth.js";
import { createCompaniesRouter } from "./crm-companies.js";
import { createActivitiesRouter } from "./crm-activities.js";
import { createTasksRouter } from "./crm-tasks.js";
import { companyModel } from "../lib/company-model.js";
import { taskModel } from "../lib/task-model.js";
import { activityModel } from "../lib/activity-model.js";
import { contactModel } from "../lib/contact-model.js";

export function mountCrmRoutes(app: Router, io: SocketIOServer): void {
  app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok", ts: Date.now() }));
  app.use("/api/auth", authRoutes);
  app.use("/api", createCompaniesRouter(io));
  app.use("/api", createActivitiesRouter(io));
  app.use("/api", createTasksRouter(io));

  // Dashboard stats
  app.get("/api/dashboard/stats", async (_req: Request, res: Response) => {
    try {
      const [companies, tasks, activities, contacts] = await Promise.all([
        companyModel.findMany(),
        taskModel.findMany(),
        activityModel.findMany(),
        contactModel.findMany(),
      ]);
      const openTasks = (tasks as any[]).filter((t) => t.status !== "completed").length;
      const todayStr = new Date().toISOString().split("T")[0];
      const todayActivities = (activities as any[]).filter((a) => a.date && a.date >= todayStr).length;
      res.json({
        totalCompanies: (companies as any[]).length,
        totalContacts: (contacts as any[]).length,
        totalTasks: (tasks as any[]).length,
        openTasks,
        totalActivities: (activities as any[]).length,
        todayActivities,
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
