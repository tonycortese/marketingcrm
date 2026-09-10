import { Router, Request, Response } from "express";
import { Server as SocketIOServer, Socket } from "socket.io";
export function mountCrmRoutes(app: Router, io: SocketIOServer): void { app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok", ts: Date.now() })); }
export function handleConnection(socket: Socket): void { console.log(`[SocketIO] client connesso: ${socket.id}`); socket.on("disconnect", () => { console.log(`[SocketIO] client disconnesso: ${socket.id}`); }); }
