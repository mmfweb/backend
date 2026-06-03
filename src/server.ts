import dotenv from "dotenv";
import express from "express";
import { getTrajectory, addMessage } from "./backend-db.ts";
import {
  sendContactEmail,
  isValidContactEmail,
  ContactEmailNotConfiguredError,
  logContactEmailStatus,
} from "./send-contact-email.ts";
import {
  getGitHubProjects,
  getGitHubUsername,
  getGitHubPublicRepoCount,
  clearGitHubProjectsCache,
} from "./github-projects.ts";
import {
  getPort,
  getFrontendOrigins,
  isProduction,
  validateProductionEnv,
  publicErrorMessage,
} from "./env.ts";
import {
  corsMiddleware,
  securityHeaders,
  rateLimitContact,
  rateLimitGitHubRefresh,
} from "./middleware.ts";
import { stripControlChars } from "./sanitize.ts";

dotenv.config();

async function startServer() {
  validateProductionEnv();

  const app = express();
  const PORT = getPort();

  if (isProduction) {
    app.set("trust proxy", 1);
  }

  app.disable("x-powered-by");
  app.use(securityHeaders);
  app.use(express.json({ limit: "64kb" }));
  app.use(corsMiddleware);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "portfolio-api" });
  });

  app.get("/api/config", async (_req, res) => {
    const username = getGitHubUsername();
    const githubPublicRepoCount = await getGitHubPublicRepoCount();
    res.json({
      githubUsername: username,
      githubProfileUrl: `https://github.com/${username}`,
      linkedinProfileUrl:
        process.env.LINKEDIN_PROFILE_URL ||
        "https://www.linkedin.com/in/mariana-marin-1b6268348",
      githubPublicRepoCount,
    });
  });

  app.get("/api/projects", async (req, res, next) => {
    if (req.query.refresh === "1") {
      return rateLimitGitHubRefresh(req, res, () => handleProjects(req, res));
    }
    return handleProjects(req, res);
  });

  async function handleProjects(req: express.Request, res: express.Response) {
    try {
      if (req.query.refresh === "1") {
        const secret = process.env.ADMIN_REFRESH_SECRET?.trim();
        if (isProduction && secret) {
          const provided = String(req.headers["x-refresh-secret"] ?? req.query.key ?? "");
          if (provided !== secret) {
            return res.status(403).json({ error: "No autorizado para forzar actualización" });
          }
        }
        clearGitHubProjectsCache();
      }
      const data = await getGitHubProjects();
      res.json(data);
    } catch (err: unknown) {
      console.error("GitHub projects error:", err);
      res.status(502).json({
        error: publicErrorMessage(
          err,
          "No se pudieron cargar los proyectos de GitHub. Inténtalo más tarde."
        ),
      });
    }
  }

  app.get("/api/trajectory", (_req, res) => {
    try {
      res.json(getTrajectory());
    } catch (err: unknown) {
      console.error("Trajectory error:", err);
      res.status(500).json({
        error: publicErrorMessage(err, "Error al cargar la trayectoria."),
      });
    }
  });

  app.post("/api/messages", rateLimitContact, async (req, res) => {
    try {
      const honeypot = String(req.body?.company ?? "").trim();
      if (honeypot) {
        return res.status(201).json({
          id: 0,
          full_name: "OK",
          email: "ok@example.com",
          message: "OK",
          created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
        });
      }

      const { full_name, email, message } = req.body;
      const fullName = stripControlChars(String(full_name ?? ""));
      const emailStr = stripControlChars(String(email ?? ""));
      const messageStr = stripControlChars(String(message ?? ""));

      if (!fullName || !emailStr || !messageStr) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }
      if (fullName.length > 200 || emailStr.length > 254) {
        return res.status(400).json({ error: "Datos de contacto demasiado largos" });
      }
      if (!isValidContactEmail(emailStr)) {
        return res.status(400).json({ error: "El correo electrónico no es válido" });
      }
      if (messageStr.length > 10000) {
        return res.status(400).json({ error: "El mensaje es demasiado largo" });
      }

      await sendContactEmail({
        fullName,
        email: emailStr,
        message: messageStr,
      });

      if (process.env.CONTACT_PERSIST_MESSAGES !== "false") {
        const row = addMessage(fullName, emailStr, messageStr);
        return res.status(201).json(row);
      }

      res.status(201).json({
        id: 0,
        full_name: fullName,
        email: emailStr,
        message: "Mensaje enviado",
        created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      });
    } catch (err: unknown) {
      if (err instanceof ContactEmailNotConfiguredError) {
        return res.status(503).json({
          error:
            "El envío por correo no está configurado en el servidor. Contacta por email directo.",
        });
      }
      console.error("Contact email error:", err);
      res.status(500).json({
        error:
          "No se pudo enviar el mensaje. Inténtalo de nuevo o escribe a infomarianamarin@gmail.com",
      });
    }
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OK] API running on http://0.0.0.0:${PORT} (${isProduction ? "production" : "development"})`);
    console.log(`[OK] GitHub: https://github.com/${getGitHubUsername()}`);
    console.log(`[OK] CORS origins: ${getFrontendOrigins().join(", ") || "(ninguno)"}`);
    logContactEmailStatus();
  });
}

startServer().catch((err) => {
  console.error("[FATAL]", err instanceof Error ? err.message : err);
  process.exit(1);
});
