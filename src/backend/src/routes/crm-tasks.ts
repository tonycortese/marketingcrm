import { Router } from "express";
import { taskModel } from "../lib/task-model.js";

const router = Router();

router.get("/tasks", async (_req, res) => {
  try {
    res.json(await taskModel.findMany());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/tasks", async (req, res) => {
  try {
    const { title, description, due_date, status, company_id } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });
    const result = await taskModel.create({ title, description, due_date, status, company_id });
    const task = await taskModel.findUnique(result.insertId);
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
    res.json({ ok: true });
  } catch (err: any) {
    console.error("[Tasks] update error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    await taskModel.delete(Number(req.params.id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
