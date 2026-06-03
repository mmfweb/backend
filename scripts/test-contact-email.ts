/**
 * Prueba de envío real con cuenta SMTP temporal de Ethereal.
 * Uso: npx tsx scripts/test-contact-email.ts
 */
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { sendContactEmail } from "../src/send-contact-email.ts";

dotenv.config();

const testAccount = await nodemailer.createTestAccount();

process.env.SMTP_HOST = "smtp.ethereal.email";
process.env.SMTP_PORT = "587";
process.env.SMTP_USER = testAccount.user;
process.env.SMTP_PASS = testAccount.pass;
process.env.CONTACT_TO = testAccount.user;

await sendContactEmail({
  fullName: "Test Portfolio",
  email: "visitante@example.com",
  message: "Prueba automatizada: el módulo de contacto envía correo correctamente.",
});

console.log("[OK] sendContactEmail completado sin errores.");
console.log("Bandeja de prueba Ethereal:");
console.log("  usuario:", testAccount.user);
console.log("  contraseña:", testAccount.pass);
console.log("  login: https://ethereal.email/login");
