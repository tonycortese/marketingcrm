import { Router } from "express";
import { Server as SocketIOServer } from "socket.io";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { taskModel } from "../lib/task-model.js";
import { emitEntityEvent } from "../lib/realtime.js";

export function createTasksRouter(io: SocketIOServer) {
  const router = Router();
  router.use(requireAuth);

  const taskSchema = {
    title: { type: "string" as const, required: true, maxLength: 255 },
    description: { type: "string" as const, maxLength: 2000 },
    due_date: { type: "date" as const },
    status: { type: "enum" as const, values: ["pending","in_progress","completed"] },
    company_id: { type: "number" as const },
  };

  router.get("/tasks", async (_req, res) => {
    try {
      res.json(await taskModel.findMany());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/tasks", validate(taskSchema), async (req, res) => {
    try {
      const { title, description, due_date, status, company_id } = req.body;
      const result = await taskModel.create({ title, description, due_date, status, company_id });
      const task = await taskModel.findUnique(result.insertId);
      emitEntityEvent(io, "task", "created", task);
      res.status(201).json(task);
    } catch (err: any) {
      console.error("[Tasks] create error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/tasks/:id", async (req, res) => {
    try {
      const task = await taskModel.findUnique(Number(req.params.id));
      if (!task) return res.status(404).json({ error: "not found" });
      res.json(task);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch("/tasks/:id", async (req, res) => {
    try {
      await taskModel.update(Number(req.params.id), req.body);
      const task = await taskModel.findUnique(Number(req.params.id));
      emitEntityEvent(io, "task", "updated", task);
      res.json({ ok: true });
    } catch (err: any) {
      console.error("[Tasks] update error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/tasks/:id", async (req, res) => {
    try {
      await taskModel.delete(Number(req.params.id));
      emitEntityEvent(io, "task", "deleted", { id: Number(req.params.id) });
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
