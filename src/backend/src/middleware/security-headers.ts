import { Request, Response, NextFunction } from "express";

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  // Prevents MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Clickjacking protection
  res.setHeader("X-Frame-Options", "DENY");
  // XSS filter (legacy browsers)
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  res.setHeader("Referrer-Policy", "no-referrer");
  // HSTS (only in production behind HTTPS)
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  // CSP — strict, no inline scripts
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  // Permissions policy
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}
