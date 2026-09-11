import { Request, Response, NextFunction } from "express";
import { userModel } from "../lib/user-model.js";

export interface AuthRequest extends Request {
  user?: { id: number; name: string; email: string };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Non autenticato" });
    return;
  }

  const token = authHeader.slice(7);
  const user = await userModel.findByToken(token);
  if (!user) {
    res.status(401).json({ error: "Token scaduto o non valido" });
    return;
  }

  req.user = { id: user.id, name: user.name, email: user.email };
  next();
}
