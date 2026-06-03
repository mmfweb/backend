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

  const origins = getFrontendOrigins();
  if (origins.length === 0) {
    throw new Error(
      "FRONTEND_ORIGIN es obligatorio en producción (URL pública del portfolio, sin barra final)."
    );
  }

  for (const origin of origins) {
    if (!/^https:\/\//.test(origin)) {
      throw new Error(
        `FRONTEND_ORIGIN debe usar HTTPS en producción: "${origin}"`
      );
    }
  }

  const smtpOk =
    process.env.SMTP_USER?.trim() &&
    process.env.SMTP_PASS?.trim() &&
    process.env.CONTACT_TO?.trim();
  if (!smtpOk) {
    throw new Error(
      "SMTP_USER, SMTP_PASS y CONTACT_TO son obligatorios en producción."
    );
  }

  if (!process.env.GITHUB_TOKEN?.trim()) {
    throw new Error("GITHUB_TOKEN es obligatorio en producción.");
  }
}

export function publicErrorMessage(err: unknown, fallback: string): string {
  if (!isProduction) {
    return err instanceof Error ? err.message : fallback;
  }
  return fallback;
}
