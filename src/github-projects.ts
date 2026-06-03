import fs from "fs";
import path from "path";
import type { Project } from "./types.ts";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  updated_at: string;
  homepage: string | null;
}

interface ProjectsCache {
  at: number;
  username: string;
  data: Project[];
}

let memoryCache: ProjectsCache | null = null;
const CACHE_MS = 60 * 60 * 1000; // 1 hora
const CACHE_FILE = path.join(process.cwd(), "github_projects_cache.json");
const DEFAULT_EXCLUDED_REPOS = ["vibe-tracking"];

function getExcludedRepoNames(): Set<string> {
  const raw = process.env.GITHUB_REPO_EXCLUDE;
  const names = raw
    ? raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    : DEFAULT_EXCLUDED_REPOS;
  return new Set(names);
}

function repoSlugFromProject(project: Project): string {
  return (project.github_url.split("/").pop() || "").toLowerCase();
}

/** Caché generada a mano o de respaldo con IDs 900xxx — no son datos reales de GitHub. */
function isSyntheticProject(project: Project): boolean {
  return project.id >= 900_000 && project.id < 1_000_000;
}

function isSyntheticCache(data: Project[]): boolean {
  return data.length > 0 && data.every(isSyntheticProject);
}

function applyProjectFilters(projects: Project[]): Project[] {
  const excluded = getExcludedRepoNames();
  return projects.filter((p) => {
    if (isSyntheticProject(p)) return false;
    const slug = repoSlugFromProject(p);
    return slug.length > 0 && !excluded.has(slug);
  });
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "mariana-marin-portfolio",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token && token !== "ghp_..." && !token.includes("YOUR_")) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function hasGitHubToken(): boolean {
  const token = process.env.GITHUB_TOKEN;
  return Boolean(token && token.length > 10 && !token.includes("MY_") && !token.includes("..."));
}

function shouldFetchReadmes(): boolean {
  if (!hasGitHubToken()) return false;
  return process.env.GITHUB_FETCH_READMES !== "false";
}

function formatRepoTitle(name: string): string {
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function stripHtml(text: string): string {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function stripMarkdown(text: string): string {
  return stripHtml(text)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, " ")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isReadmeNoiseLine(line: string): boolean {
  const raw = line.trim();
  if (!raw) return true;
  if (/^<a\s+name=/i.test(raw) || /^<\/a>/i.test(raw)) return true;

  const clean = stripMarkdown(raw);
  if (clean.length < 18) return true;

  const lower = clean.toLowerCase();

  if (/^(english|español|spanish)(\s+(english|español|spanish))?$/i.test(clean)) return true;
  if (/^(english|español|spanish)\s*[|·•/]\s*(english|español|spanish)/i.test(clean)) return true;
  if (/^(📖|🛠|📬|💡|🌷|👩)/.test(raw) && clean.length < 90) return true;
  if (/project\s*info|descripción del proyecto/i.test(lower) && clean.length < 100) return true;
  if (/^(tabla de contenidos|table of contents|índice|contents)\b/i.test(lower)) return true;
  if (/^(badges?|license|licencia|contributing|installación|installation)\b/i.test(lower) && clean.length < 60)
    return true;

  const pipeCount = (raw.match(/\|/g) || []).length;
  if (pipeCount >= 2 && clean.length < 120) return true;

  return false;
}

function isUsefulSectionHeading(line: string): boolean {
  return /^#{1,3}\s*(descripción|description|sobre(\s+el)?\s+proyecto|about(\s+the)?\s+project|overview|introducción|introduction|qué es|what is)/i.test(
    line.trim()
  );
}

function isSectionBreakHeading(line: string): boolean {
  return /^#{1,3}\s*(english|español|spanish|índice|index|table of contents|features|características|tech stack|tecnologías|instalación|installation|uso|usage|contributing|license)/i.test(
    line.trim()
  );
}

function extractFromReadme(readme: string, maxLen: number): string {
  const lines = stripHtml(readme).split("\n").map((l) => l.trim());
  const parts: string[] = [];
  let inTargetSection = false;

  const pushLine = (line: string) => {
    const clean = stripMarkdown(line);
    if (clean.length < 25 || isReadmeNoiseLine(line)) return;
    parts.push(clean);
  };

  for (const line of lines) {
    if (line.startsWith("```") || line.startsWith("![")) continue;

    if (line.startsWith("#")) {
      if (isUsefulSectionHeading(line)) {
        inTargetSection = true;
        continue;
      }
      if (isSectionBreakHeading(line)) {
        inTargetSection = false;
        continue;
      }
      continue;
    }

    if (inTargetSection) {
      pushLine(line);
      if (parts.join(" ").length >= maxLen) break;
    }
  }

  if (parts.length === 0) {
    for (const line of lines) {
      if (line.startsWith("#") || line.startsWith("```") || line.startsWith("![")) continue;
      pushLine(line);
      if (parts.join(" ").length >= maxLen) break;
    }
  }

  const text = parts.join(" ");
  if (!text) return "";
  return text.length > maxLen ? `${text.slice(0, maxLen - 1).trim()}…` : text;
}

function loadDiskCache(username: string): Project[] | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const parsed = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8")) as ProjectsCache;
    if (parsed.username !== username || !Array.isArray(parsed.data) || parsed.data.length === 0) {
      return null;
    }
    if (isSyntheticCache(parsed.data)) {
      console.warn("Caché de GitHub descartada: datos sintéticos (no vienen de la API).");
      return null;
    }
    const filtered = applyProjectFilters(parsed.data);
    return filtered.length > 0 ? filtered : null;
  } catch {
    return null;
  }
}

function saveDiskCache(username: string, data: Project[]) {
  try {
    const payload: ProjectsCache = { at: Date.now(), username, data };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err) {
    console.error("No se pudo guardar caché de GitHub:", err);
  }
}

function isPlaceholderCache(data: Project[]): boolean {
  return data.some((p) =>
    /Sincronización completa cuando la API/i.test(p.description)
  );
}

function repoFromProject(project: Project): GitHubRepo {
  const slug = project.github_url.split("/").pop() || project.title;
  const lang =
    project.languages.find((l) => l.toLowerCase() !== "github") ?? null;
  return {
    id: project.id,
    name: slug,
    full_name: `${getGitHubUsername()}/${slug}`,
    html_url: project.github_url,
    description: null,
    language: lang,
    topics: project.languages.filter((l) => l.toLowerCase() !== "github"),
    stargazers_count: project.stars ?? 0,
    fork: false,
    archived: false,
    updated_at: project.created_at.replace(" ", "T") + "Z",
    homepage: project.homepage ?? null,
  };
}

function upgradePlaceholderProjects(projects: Project[]): Project[] {
  return projects.map((project) => {
    if (!/Sincronización completa cuando la API/i.test(project.description)) {
      return project;
    }
    const repo = repoFromProject(project);
    return {
      ...project,
      description: buildMiniSummary(repo, null),
      case_study: buildCaseStudy(repo, null),
    };
  });
}

function getStaleProjects(username: string): Project[] | null {
  if (memoryCache?.username === username && memoryCache.data.length > 0) {
    if (isSyntheticCache(memoryCache.data)) return null;
    const filtered = applyProjectFilters(memoryCache.data);
    return filtered.length > 0 ? filtered : null;
  }
  return loadDiskCache(username);
}

export function clearGitHubProjectsCache() {
  memoryCache = null;
  try {
    if (fs.existsSync(CACHE_FILE)) fs.unlinkSync(CACHE_FILE);
  } catch {
    /* ignore */
  }
}

function inferSummaryFromRepo(repo: GitHubRepo): string {
  const name = repo.name.toLowerCase();
  const lang = repo.language ? ` Stack principal: ${repo.language}.` : "";

  const rules: Array<[RegExp, string]> = [
    [/portfolio|portafolio/i, "Portfolio web y presencia profesional en línea."],
    [/athenix/i, "Parte del ecosistema Athenix: arquitectura y producto cognitivo."],
    [/neuroplan/i, "Plataforma educativa NeuroPlan (interfaz o servicios asociados)."],
    [/kali|sandbox|trainer/i, "Laboratorio y entrenamiento práctico en ciberseguridad."],
    [/biblioteca|library/i, "Sistema de gestión bibliotecaria con persistencia de datos."],
    [/ejercicios|python|colab/i, "Colección de ejercicios y prácticas de programación."],
    [/qa|automation|test/i, "Automatización de pruebas y calidad de software."],
    [/amigo.?secreto|secret/i, "Aplicación web para sorteos de amigo secreto."],
    [/conversor|moneda/i, "Proyecto de lógica y conversión (curso / reto Java)."],
    [/worldlink|nationality/i, "Plataforma web para exploración de nacionalidad y trámites."],
    [/backend|api/i, "Backend, APIs y lógica de servidor del proyecto."],
    [/frontend|client/i, "Frontend, UI accesible y experiencia de usuario."],
    [/react|next/i, "Interfaz React y componentes orientados a accesibilidad."],
    [/spring|boot/i, "Servicios Spring Boot y capa de negocio."],
  ];

  for (const [pattern, text] of rules) {
    if (pattern.test(name)) return text + lang;
  }

  return `${formatRepoTitle(repo.name)} — código abierto y documentación en GitHub.${lang}`;
}

function buildMiniSummary(repo: GitHubRepo, readme?: string | null): string {
  if (repo.description?.trim()) return repo.description.trim();
  if (readme) {
    const fromReadme = extractFromReadme(readme, 220);
    if (fromReadme) return fromReadme;
  }
  return inferSummaryFromRepo(repo);
}

function buildCaseStudy(repo: GitHubRepo, readme?: string | null): string {
  const bits: string[] = [];
  if (repo.language) bits.push(`Lenguaje principal: ${repo.language}.`);
  if (repo.topics.length) bits.push(`Temas: ${repo.topics.join(", ")}.`);
  if (repo.stargazers_count > 0) bits.push(`${repo.stargazers_count} estrellas en GitHub.`);

  if (readme) {
    const excerpt = extractFromReadme(readme, 520);
    if (excerpt) bits.push(excerpt);
  } else if (repo.description) {
    bits.push(repo.description);
  }

  return bits.join(" ") || `Explora el código en ${repo.html_url}.`;
}

async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: githubHeaders(),
    });
    if (res.status === 403 || res.status === 429) return null;
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: string; encoding?: string };
    if (data.content && data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
  } catch {
    return null;
  }
  return null;
}

function mapRepoToProject(repo: GitHubRepo, readme: string | null): Project {
  const languages = [repo.language, ...repo.topics.slice(0, 4)].filter((v): v is string => Boolean(v));

  const taglineParts = [
    repo.language,
    repo.stargazers_count > 0 ? `★ ${repo.stargazers_count}` : null,
    repo.archived ? "Archivado" : null,
  ].filter(Boolean);

  return {
    id: repo.id,
    title: formatRepoTitle(repo.name),
    tagline: taglineParts.join(" · ") || "Repositorio open source",
    description: buildMiniSummary(repo, readme),
    category: (repo.language || repo.topics[0] || "GITHUB").toUpperCase(),
    languages: languages.length ? languages : ["GitHub"],
    image_url: "",
    case_study: buildCaseStudy(repo, readme),
    created_at: repo.updated_at.replace("T", " ").substring(0, 19),
    github_url: repo.html_url,
    stars: repo.stargazers_count,
    homepage: repo.homepage,
  };
}

export function getGitHubUsername(): string {
  return process.env.GITHUB_USERNAME || "marianamarinflor622";
}

export async function getGitHubPublicRepoCount(): Promise<number | null> {
  const override = Number(process.env.GITHUB_PUBLIC_REPO_COUNT);
  if (Number.isFinite(override) && override > 0) return override;

  try {
    const username = getGitHubUsername();
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: githubHeaders(),
    });
    if (res.ok) {
      const data = (await res.json()) as { public_repos?: number };
      if (typeof data.public_repos === "number") return data.public_repos;
    }

    let page = 1;
    let count = 0;
    while (page <= 4) {
      const reposRes = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&type=owner`,
        { headers: githubHeaders() }
      );
      if (!reposRes.ok) break;
      const repos = (await reposRes.json()) as GitHubRepo[];
      if (!Array.isArray(repos) || repos.length === 0) break;
      count += repos.filter((r) => !r.fork).length;
      if (repos.length < 100) break;
      page += 1;
    }
    return count > 0 ? count : null;
  } catch {
    return null;
  }
}

function isRateLimitError(message: string): boolean {
  return /rate limit/i.test(message);
}

async function fetchReposFromGitHub(username: string, limit: number): Promise<Project[]> {
  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&type=owner`,
    { headers: githubHeaders() }
  );

  if (!reposRes.ok) {
    const err = await reposRes.json().catch(() => ({}));
    const msg =
      typeof err === "object" && err && "message" in err
        ? String((err as { message: string }).message)
        : `HTTP ${reposRes.status}`;
    throw new Error(msg);
  }

  const repos = (await reposRes.json()) as GitHubRepo[];
  const excluded = getExcludedRepoNames();
  const selected = repos
    .filter((r) => !r.fork && !excluded.has(r.name.toLowerCase()))
    .sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .slice(0, limit);

  const fetchReadmes = shouldFetchReadmes();

  const readmeCap = Math.min(selected.length, 12);

  const projects = await Promise.all(
    selected.map(async (repo, index) => {
      let readme: string | null = null;
      if (fetchReadmes && index < readmeCap) {
        const [owner, name] = repo.full_name.split("/");
        readme = await fetchReadme(owner, name);
      }
      return mapRepoToProject(repo, readme);
    })
  );

  return projects;
}

export async function getGitHubProjects(): Promise<Project[]> {
  const username = getGitHubUsername();
  const limit = Math.min(50, Math.max(1, Number(process.env.GITHUB_REPO_LIMIT) || 12));

  if (
    memoryCache &&
    memoryCache.username === username &&
    Date.now() - memoryCache.at < CACHE_MS &&
    !isPlaceholderCache(memoryCache.data) &&
    !isSyntheticCache(memoryCache.data)
  ) {
    return applyProjectFilters(memoryCache.data);
  }

  try {
    const projects = applyProjectFilters(await fetchReposFromGitHub(username, limit));
    memoryCache = { at: Date.now(), username, data: projects };
    saveDiskCache(username, projects);
    return projects;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    let stale = getStaleProjects(username);

    if (stale && isPlaceholderCache(stale)) {
      stale = upgradePlaceholderProjects(stale);
      saveDiskCache(username, stale);
    }

    if (stale && !isPlaceholderCache(stale) && !isSyntheticCache(stale)) {
      const filtered = applyProjectFilters(stale);
      if (filtered.length > 0) {
        console.warn(`GitHub API falló (${message}). Sirviendo caché anterior.`);
        memoryCache = { at: Date.now(), username, data: filtered };
        return filtered;
      }
    }

    if (isRateLimitError(message)) {
      throw new Error(
        "Límite de peticiones de GitHub alcanzado. Añade GITHUB_TOKEN en un archivo .env (token personal sin permisos especiales) o espera unos minutos y pulsa Reintentar."
      );
    }

    throw new Error(`GitHub API: ${message}`);
  }
}
