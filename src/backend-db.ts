import fs from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "db_store.json");

interface DBStore {
  trajectory: TrajectoryRow[];
  messages: MessageRow[];
}

interface TrajectoryRow {
  id: number;
  years: string;
  role: string;
  description: string;
}

interface MessageRow {
  id: number;
  full_name: string;
  email: string;
  message: string;
  created_at: string;
}

const DEFAULT_STORE: DBStore = {
  trajectory: [
    {
      id: 1,
      years: "2023 - ACTUALIDAD",
      role: "Desarrolladora Fullstack & A11y Lead",
      description:
        "Supervisión de directrices de accesibilidad (WCAG 2.1 Level AA) aplicadas a flujos transaccionales y despliegue de microservicios robustos con Python y FastAPI en ambientes Cloud.",
    },
    {
      id: 2,
      years: "2021 - 2023",
      role: "Especialista en Frontend React/TS",
      description:
        "Diseño e implementación de sistemas de diseño de alta gama y componentes interactivos modulares. Foco constante en la semántica HTML, tipografías legibles y optimización de renderizado.",
    },
    {
      id: 3,
      years: "2018 - 2021",
      role: "Consultora Técnica y Legal de Cumplimiento",
      description:
        "Auditorías de software inclusivo, combinando mi experiencia complementaria en Derecho para contrastar requerimientos legales de accesibilidad digital y protección de datos.",
    },
  ],
  messages: [],
};

function loadStore(): DBStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8")) as Partial<DBStore>;
      return {
        trajectory: data.trajectory ?? DEFAULT_STORE.trajectory,
        messages: data.messages ?? [],
      };
    }
  } catch (err) {
    console.error("Error reading db_store.json:", err);
  }
  saveStore(DEFAULT_STORE);
  return DEFAULT_STORE;
}

function saveStore(store: DBStore) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing db_store.json:", err);
  }
}

export function getTrajectory() {
  return loadStore().trajectory;
}

export function getMessages() {
  return loadStore().messages;
}

export function addMessage(full_name: string, email: string, message: string) {
  const store = loadStore();
  const newId = store.messages.length > 0 ? Math.max(...store.messages.map((m) => m.id)) + 1 : 1;
  const row: MessageRow = {
    id: newId,
    full_name,
    email,
    message,
    created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
  };
  store.messages.push(row);
  saveStore(store);
  return row;
}
