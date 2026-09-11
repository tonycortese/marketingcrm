import { Router } from "express";
import { Server as SocketIOServer } from "socket.io";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { companyModel } from "../lib/company-model.js";
import { contactModel } from "../lib/contact-model.js";
import { taskModel } from "../lib/task-model.js";
import { activityModel } from "../lib/activity-model.js";
import { emitEntityEvent } from "../lib/realtime.js";

export function createCompaniesRouter(io: SocketIOServer) {
  const router = Router();
  router.use(requireAuth);

  const companySchema = {
    name: { type: "string" as const, required: true, maxLength: 255 },
    city: { type: "string" as const, maxLength: 255 },
    address: { type: "string" as const, maxLength: 255 },
    phone: { type: "string" as const, maxLength: 50 },
    type: { type: "string" as const, maxLength: 100 },
    status: { type: "enum" as const, values: ["sconosciuto","conosciuto","potenziale","cliente","inattivo","perso","non_interessato"] },
  };

  const contactSchema = {
    name: { type: "string" as const, required: true, maxLength: 255 },
    phone: { type: "string" as const, maxLength: 50 },
    email: { type: "email" as const },
    company_id: { type: "number" as const },
  };

  // Companies
  router.get("/companies", async (_req, res) => {
    try {
      res.json(await companyModel.findMany());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/companies", validate(companySchema), async (req, res) => {
    try {
      const { name, city, address, phone, type, status } = req.body;
      const result = await companyModel.create({ name, city, address, phone, type, status });
      const company = await companyModel.findUnique(result.insertId);
      emitEntityEvent(io, "company", "created", company);
      res.status(201).json(company);
    } catch (err: any) {
      console.error("[Companies] create error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/companies/:id", async (req, res) => {
    try {
      const company = await companyModel.findUnique(Number(req.params.id));
      if (!company) return res.status(404).json({ error: "not found" });
      res.json(company);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch("/companies/:id", async (req, res) => {
    try {
      await companyModel.update(Number(req.params.id), req.body);
      const company = await companyModel.findUnique(Number(req.params.id));
      emitEntityEvent(io, "company", "updated", company);
      res.json({ ok: true });
    } catch (err: any) {
      console.error("[Companies] update error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/companies/:id", async (req, res) => {
    try {
      await companyModel.delete(Number(req.params.id));
      emitEntityEvent(io, "company", "deleted", { id: Number(req.params.id) });
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Contacts
  router.get("/contacts", async (_req, res) => {
    try {
      res.json(await contactModel.findMany());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/contacts", validate(contactSchema), async (req, res) => {
    try {
      const { name, phone, email, company_id } = req.body;
      const result = await contactModel.create({ name, phone, email, company_id });
      const contact = await contactModel.findUnique(result.insertId);
      emitEntityEvent(io, "contact", "created", contact);
      res.status(201).json(contact);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/contacts/:id", async (req, res) => {
    try {
      const contact = await contactModel.findUnique(Number(req.params.id));
      if (!contact) return res.status(404).json({ error: "not found" });
      res.json(contact);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch("/contacts/:id", async (req, res) => {
    try {
      await contactModel.update(Number(req.params.id), req.body);
      const contact = await contactModel.findUnique(Number(req.params.id));
      emitEntityEvent(io, "contact", "updated", contact);
      res.json({ ok: true });
    } catch (err: any) {
      console.error("[Contacts] update error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/contacts/:id", async (req, res) => {
    try {
      await contactModel.delete(Number(req.params.id));
      emitEntityEvent(io, "contact", "deleted", { id: Number(req.params.id) });
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Contacts by company
  router.get("/companies/:id/contacts", async (req, res) => {
    try {
      const contacts = await contactModel.findByCompany(Number(req.params.id));
      res.json(contacts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Tasks by company
  router.get("/companies/:id/tasks", async (req, res) => {
    try {
      const tasks = await taskModel.findByCompany(Number(req.params.id));
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Activities by company
  router.get("/companies/:id/activities", async (req, res) => {
    try {
      const activities = await activityModel.findByCompany(Number(req.params.id));
      res.json(activities);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
