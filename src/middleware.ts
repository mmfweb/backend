import type { Request, Response, NextFunction } from "express";
import { getFrontendOrigins, isProduction } from "./env.ts";

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const allowed = getFrontendOrigins();
  const requestOrigin = req.headers.origin;

  if (requestOrigin && allowed.includes(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  } else if (!isProduction && allowed.length > 0) {
    res.setHeader("Access-Control-Allow-Origin", allowed[0]);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
}

const contactHits = new Map<string, number[]>();
const refreshHits = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const CONTACT_MAX = 5;
const REFRESH_MAX = 3;

export function rateLimitContact(req: Request, res: Response, next: NextFunction): void {
  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const now = Date.now();
  const times = (contactHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (times.length >= CONTACT_MAX) {
    res.status(429).json({
      error: "Demasiados intentos. Espera unos minutos antes de volver a enviar.",
    });
    return;
  }

  times.push(now);
  contactHits.set(ip, times);
  next();
}

export function rateLimitGitHubRefresh(req: Request, res: Response, next: NextFunction): void {
  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const now = Date.now();
  const times = (refreshHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (times.length >= REFRESH_MAX) {
    res.status(429).json({
      error: "Demasiadas actualizaciones. Espera antes de volver a sincronizar.",
    });
    return;
  }

  times.push(now);
  refreshHits.set(ip, times);
  next();
}
