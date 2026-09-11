import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { clientModel, taskModel, getDashboard } from "../lib/db-client.js";
const router = Router();
router.use(requireAuth);

const clientSchema = {
  name: { type: "string" as const, required: true, maxLength: 255 },
  email: { type: "email" as const },
  phone: { type: "string" as const, maxLength: 50 },
  company: { type: "string" as const, maxLength: 255 },
};

const taskLegacySchema = {
  title: { type: "string" as const, required: true, maxLength: 255 },
  due_date: { type: "date" as const },
  status: { type: "enum" as const, values: ["pending","in_progress","completed"] },
  client_id: { type: "number" as const },
};

router.get("/clients", async (_req, res) => { try { res.json(await clientModel.findMany()); } catch (err: any) { res.status(500).json({ error: err.message }); } });
router.post("/clients", validate(clientSchema), async (req, res) => { try { const { name, email, phone, company } = req.body; if (!name) return res.status(400).json({ error: "name is required" }); const result = await clientModel.create({ name, email, phone, company }); res.status(201).json({ ok: true, id: result.insertId }); } catch (err: any) { res.status(500).json({ error: err.message }); } });
router.get("/clients/:id", async (req, res) => { try { const client = await clientModel.findUnique(Number(req.params.id)); if (!client) return res.status(404).json({ error: "not found" }); res.json(client); } catch (err: any) { res.status(500).json({ error: err.message }); } });
router.patch("/clients/:id", async (req, res) => { try { await clientModel.update(Number(req.params.id), req.body); res.json({ ok: true }); } catch (err: any) { res.status(500).json({ error: err.message }); } });
router.delete("/clients/:id", async (req, res) => { try { await clientModel.delete(Number(req.params.id)); res.json({ ok: true }); } catch (err: any) { res.status(500).json({ error: err.message }); } });
router.get("/tasks", async (_req, res) => { try { res.json(await taskModel.findMany()); } catch (err: any) { res.status(500).json({ error: err.message }); } });
router.post("/tasks", validate(taskLegacySchema), async (req, res) => { try { const { title, due_date, status, client_id } = req.body; if (!title) return res.status(400).json({ error: "title is required" }); const result = await taskModel.create({ title, due_date, status, client_id }); res.status(201).json({ ok: true, id: result.insertId }); } catch (err: any) { res.status(500).json({ error: err.message }); } });
router.get("/tasks/:id", async (req, res) => { try { const task = await taskModel.findUnique(Number(req.params.id)); if (!task) return res.status(404).json({ error: "not found" }); res.json(task); } catch (err: any) { res.status(500).json({ error: err.message }); } });
router.patch("/tasks/:id", async (req, res) => { try { await taskModel.update(Number(req.params.id), req.body); res.json({ ok: true }); } catch (err: any) { res.status(500).json({ error: err.message }); } });
router.delete("/tasks/:id", async (req, res) => { try { await taskModel.delete(Number(req.params.id)); res.json({ ok: true }); } catch (err: any) { res.status(500).json({ error: err.message }); } });
router.get("/dashboard/stats", async (_req, res) => { try { res.json(await getDashboard()); } catch (err: any) { res.status(500).json({ error: err.message }); } });
export default router;
