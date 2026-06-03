export const isProduction = process.env.NODE_ENV === "production";

export function getPort(): number {
  const port = Number(process.env.PORT);
  return Number.isFinite(port) && port > 0 ? port : 3000;
}

export function getFrontendOrigins(): string[] {
  const raw = process.env.FRONTEND_ORIGIN?.trim();
  if (!raw) {
    return isProduction ? [] : ["http://localhost:5173"];
  }
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}

export function validateProductionEnv(): void {
  if (!isProduction) return;

  const missing: string[] = [];

  const origins = getFrontendOrigins();
  if (origins.length === 0) {
    missing.push("FRONTEND_ORIGIN");
  } else {
    for (const origin of origins) {
      if (!/^https:\/\//.test(origin)) {
        throw new Error(
          `FRONTEND_ORIGIN debe usar HTTPS en producción: "${origin}"`
        );
      }
    }
  }

  if (!process.env.GITHUB_TOKEN?.trim()) missing.push("GITHUB_TOKEN");
  if (!process.env.SMTP_USER?.trim()) missing.push("SMTP_USER");
  if (!process.env.SMTP_PASS?.trim()) missing.push("SMTP_PASS");
  if (!process.env.CONTACT_TO?.trim()) missing.push("CONTACT_TO");

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables en Render → Environment: ${missing.join(", ")}. ` +
        "Ver backend/DEPLOY-RENDER.md y backend/render.env.example"
    );
  }
}

export function publicErrorMessage(err: unknown, fallback: string): string {
  if (!isProduction) {
    return err instanceof Error ? err.message : fallback;
  }
  return fallback;
}
