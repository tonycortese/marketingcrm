import { Router, Request, Response } from "express";
import { userModel } from "../lib/user-model.js";
import { randomUUID } from "crypto";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, email e password sono richiesti" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "La password deve avere almeno 6 caratteri" });
    }
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "E-mail già registrata" });
    }
    const result = await userModel.create({ name, email, password });
    const user = await userModel.findUnique(result.insertId);
    res.status(201).json({ ok: true, user });
  } catch (err: any) {
    console.error("[Auth] register error:", err);
    res.status(500).json({ error: err.message || "Errore interno" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email e password sono richiesti" });
    }
    const user = await userModel.verifyLogin(email, password);
    if (!user) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }
    const token = randomUUID();
    await userModel.assignToken(user.id, token);
    const safeUser = await userModel.findUnique(user.id);
    res.json({ ok: true, token, user: safeUser });
  } catch (err: any) {
    console.error("[Auth] login error:", err);
    res.status(500).json({ error: err.message || "Errore interno" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token richiesto" });
    const user = await userModel.findByToken(token);
    if (!user) return res.status(401).json({ error: "Token non valido" });
    await userModel.clearToken(user.id);
    res.json({ ok: true });
  } catch (err: any) {
    console.error("[Auth] logout error:", err);
    res.status(500).json({ error: err.message || "Errore interno" });
  }
});

// GET /api/auth/me — valida il token e restituisce l'utente
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Non autenticato" });
    }
    const token = authHeader.slice(7);
    const user = await userModel.findByToken(token);
    if (!user) return res.status(401).json({ error: "Token scaduto o non valido" });
    const safeUser = await userModel.findUnique(user.id);
    res.json({ user: safeUser });
  } catch (err: any) {
    console.error("[Auth] me error:", err);
    res.status(500).json({ error: err.message || "Errore interno" });
  }
});

export default router;
