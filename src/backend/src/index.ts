import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { initDb } from "./lib/db.js";
import { mountCrmRoutes, handleConnection } from "./routes/index.js";
import { securityHeaders } from "./middleware/security-headers.js";
dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

const app = express();
app.use(securityHeaders);
app.use(cors({ origin: FRONTEND_URL, methods: ["GET", "POST", "PATCH", "DELETE"] }));
app.use(express.json());
const httpServer = createServer(app);
const io = new IOServer(httpServer, { cors: { origin: FRONTEND_URL, methods: ["GET", "POST"] } });
app.get("/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }));
mountCrmRoutes(app, io); io.on("connection", handleConnection);
const PORT = parseInt(process.env.PORT ?? "3000");
async function main() { await initDb(); httpServer.listen(PORT, () => { console.log(`[Server] CRM backend su porta ${PORT}`); }); }
main().catch((err) => { console.error("[FATAL]", err); process.exit(1); });
