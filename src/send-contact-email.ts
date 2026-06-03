import nodemailer from "nodemailer";
import { sanitizeEmailHeaderValue } from "./sanitize.ts";

export class ContactEmailNotConfiguredError extends Error {
  constructor() {
    super("SMTP no configurado");
    this.name = "ContactEmailNotConfiguredError";
  }
}

function isEmailConfigured(): boolean {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const to = process.env.CONTACT_TO?.trim();
  return Boolean(user && pass && to);
}

function createTransport() {
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure =
    process.env.SMTP_SECURE === "true" || (Number.isFinite(port) && port === 465);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASS!.trim(),
    },
  });
}

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidContactEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim()) && email.length <= 254;
}

export async function sendContactEmail(params: {
  fullName: string;
  email: string;
  message: string;
}): Promise<void> {
  if (!isEmailConfigured()) {
    throw new ContactEmailNotConfiguredError();
  }

  const to = process.env.CONTACT_TO!.trim();
  const from =
    process.env.CONTACT_FROM?.trim() ||
    process.env.SMTP_USER!.trim();
  const fullName = sanitizeEmailHeaderValue(params.fullName, 200);
  const email = sanitizeEmailHeaderValue(params.email, 254);
  const message = params.message;

  if (!isValidContactEmail(email)) {
    throw new Error("Email inválido tras saneamiento");
  }

  const subject = `[Portfolio] Mensaje de ${fullName}`;
  const text = [
    "Nuevo mensaje desde el formulario de contacto del portfolio.",
    "",
    `Nombre: ${fullName}`,
    `Correo: ${email}`,
    "",
    "Mensaje:",
    message,
    "",
    "---",
    "Puedes responder directamente a este correo (Reply-To del remitente).",
  ].join("\n");

  const transport = createTransport();
  await transport.sendMail({
    from: `"Portfolio Mariana Marin" <${from}>`,
    to,
    replyTo: `"${fullName}" <${email}>`,
    subject,
    text,
  });
}

export function logContactEmailStatus(): void {
  if (isEmailConfigured()) {
    console.log(`[OK] Contact form email → ${process.env.CONTACT_TO?.trim()}`);
  } else {
    console.warn(
      "[WARN] Contact form: SMTP no configurado (SMTP_USER, SMTP_PASS, CONTACT_TO). Los mensajes no se enviarán por correo."
    );
  }
}
