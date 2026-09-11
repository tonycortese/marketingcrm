import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { activityModel } from "../lib/activity-model.js";

const router = Router();
router.use(requireAuth);

const activitySchema = {
  title: { type: "string" as const, required: true, maxLength: 255 },
  description: { type: "string" as const, maxLength: 2000 },
  date: { type: "date" as const },
  type: { type: "enum" as const, values: ["chiamata","email","meeting","nota"] },
  company_id: { type: "number" as const },
  task_id: { type: "number" as const },
};

router.get("/activities", async (_req, res) => {
  try {
    res.json(await activityModel.findMany());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/activities", validate(activitySchema), async (req, res) => {
  try {
    const { title, description, date, type, company_id } = req.body;
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
