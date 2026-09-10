import { Router } from "express";
import { companyModel } from "../lib/company-model.js";
import { contactModel } from "../lib/contact-model.js";

const router = Router();

// Companies
router.get("/companies", async (_req, res) => {
  try {
    res.json(await companyModel.findMany());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/companies", async (req, res) => {
  try {
    const { name, city, address, phone, type } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const result = await companyModel.create({ name, city, address, phone, type });
    const company = await companyModel.findUnique(result.insertId);
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
    res.json({ ok: true });
  } catch (err: any) {
    console.error("[Companies] update error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/companies/:id", async (req, res) => {
  try {
    await companyModel.delete(Number(req.params.id));
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

router.post("/contacts", async (req, res) => {
  try {
    const { name, phone, email, company_id } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const result = await contactModel.create({ name, phone, email, company_id });
    const contact = await contactModel.findUnique(result.insertId);
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
    res.json({ ok: true });
  } catch (err: any) {
    console.error("[Contacts] update error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/contacts/:id", async (req, res) => {
  try {
    await contactModel.delete(Number(req.params.id));
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

export default router;
