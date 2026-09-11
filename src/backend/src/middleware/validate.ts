import { Request, Response, NextFunction } from "express";

export interface FieldRule {
  type: "string" | "number" | "date" | "enum" | "email";
  required?: boolean;
  maxLength?: number;
  values?: string[]; // for enum
}

export type Schema = Record<string, FieldRule>;

export function validate(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const body = req.body;
    const errors: string[] = [];
    const cleaned: Record<string, any> = {};

    for (const [field, rule] of Object.entries(schema)) {
      const raw = body[field];

      // Required check
      if (rule.required && (raw === undefined || raw === null || raw === "")) {
        errors.push(`${field} è obbligatorio`);
        continue;
      }

      // Skip if not provided and not required
      if (raw === undefined || raw === null) continue;

      // Type validation & coercion
      if (rule.type === "string") {
        if (typeof raw !== "string") {
          errors.push(`${field} deve essere una stringa`);
          continue;
        }
        let v = raw.trim();
        if (rule.maxLength && v.length > rule.maxLength) {
          errors.push(`${field} supera ${rule.maxLength} caratteri`);
          continue;
        }
        cleaned[field] = v;
      }

      if (rule.type === "email") {
        if (typeof raw !== "string") {
          errors.push(`${field} deve essere un'email valida`);
          continue;
        }
        const v = raw.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
          errors.push(`${field} non è un'email valida`);
          continue;
        }
        cleaned[field] = v;
      }

      if (rule.type === "number") {
        const n = Number(raw);
        if (!Number.isInteger(n) || n <= 0) {
          errors.push(`${field} deve essere un numero positivo`);
          continue;
        }
        cleaned[field] = n;
      }

      if (rule.type === "date") {
        if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
          errors.push(`${field} deve essere una data YYYY-MM-DD`);
          continue;
        }
        cleaned[field] = raw;
      }

      if (rule.type === "enum") {
        if (!rule.values || !rule.values.includes(raw)) {
          errors.push(`${field} deve essere uno di: ${rule.values?.join(", ")}`);
          continue;
        }
        cleaned[field] = raw;
      }
    }

    if (errors.length) {
      res.status(400).json({ error: "Validazione fallita", details: errors });
      return;
    }

    // Replace body with cleaned data
    req.body = cleaned;
    next();
  };
}
