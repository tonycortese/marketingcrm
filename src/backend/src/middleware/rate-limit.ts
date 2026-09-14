import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 10, // max 10 richieste per finestra
  standardHeaders: true, // info RateLimit-* headers
  legacyHeaders: false,
  message: { error: "Troppi tentativi. Riprova tra 15 minuti" },
  skipSuccessfulRequests: false,
});
