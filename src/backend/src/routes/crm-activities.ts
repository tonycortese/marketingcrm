import { Router } from "express";
import { activityModel } from "../lib/activity-model.js";

const router = Router();

router.get("/activities", async (_req, res) => {
  try {
    res.json(await activityModel.findMany());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/activities", async (req, res) => {
  try {
    const { title, description, date, type, company_id } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });
    const result = await activityModel.create({ title, description, date, type, company_id });
    const activity = await activityModel.findUnique(result.insertId);
    res.status(201).json(activity);
  } catch (err: any) {
    console.error("[Activities] create error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/activities/:id", async (req, res) => {
  try {
    const activity = await activityModel.findUnique(Number(req.params.id));
    if (!activity) return res.status(404).json({ error: "not found" });
    res.json(activity);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/activities/:id", async (req, res) => {
  try {
    await activityModel.update(Number(req.params.id), req.body);
    res.json({ ok: true });
  } catch (err: any) {
    console.error("[Activities] update error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/activities/:id", async (req, res) => {
  try {
    await activityModel.delete(Number(req.params.id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
