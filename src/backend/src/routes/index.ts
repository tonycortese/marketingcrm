import { Router, Request, Response } from "express";
import { Server as SocketIOServer, Socket } from "socket.io";
import authRoutes from "./auth.js";
import crmRoutes from "./crm.js";
import companiesRouter from "./crm-companies.js";
import activitiesRouter from "./crm-activities.js";
import tasksRouter from "./crm-tasks.js";

export function mountCrmRoutes(app: Router, io: SocketIOServer): void {
  app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok", ts: Date.now() }));
  app.use("/api/auth", authRoutes);
  app.use("/api", crmRoutes);
  app.use("/api", companiesRouter);
  app.use("/api", activitiesRouter);
  app.use("/api", tasksRouter);
}

export function handleConnection(socket: Socket): void {
  console.log(`[SocketIO] client connesso: ${socket.id}`);
  socket.on("disconnect", () => { console.log(`[SocketIO] client disconnesso: ${socket.id}`); });
}
