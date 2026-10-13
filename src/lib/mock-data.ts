import { Workspace, Block, PageItem, DatabaseCollection } from "./types";

export const INITIAL_PAGES: PageItem[] = [
  {
    id: "welcome-page",
    title: "Bienvenido a AgendAR",
    icon: "🚀",
    isFavorite: true,
    isEncrypted: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
    blockIds: ["b1", "b2", "b3", "b4", "b5", "b6"],
  },
  {
    id: "calendar-sync-page",
    title: "Agenda & Sincronización Google Calendar",
    icon: "📅",
    isFavorite: true,
    isEncrypted: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 1800000,
    blockIds: ["b-cal-1", "b-cal-2", "b-cal-3", "b-cal-4"],
  },
  {
    id: "vault-page",
    title: "Bóveda Privada (Cifrado E2EE)",
    icon: "🔒",
    isFavorite: false,
    isEncrypted: true,
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 7200000,
    blockIds: ["b-vault-1", "b-vault-2", "b-vault-3"],
  },
  {
    id: "tasks-db-page",
    title: "Tablero de Proyectos y Tareas",
    icon: "📊",
    isFavorite: false,
    isEncrypted: false,
    createdAt: Date.now() - 21600000,
    updatedAt: Date.now() - 600000,
    blockIds: ["b-db-1"],
  },
];

export const INITIAL_BLOCKS: Record<string, Block> = {
  // Bienvenido
  b1: {
    id: "b1",
    type: "heading_1",
    content: "Bienvenido a AgendAR ✨",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  b2: {
    id: "b2",
    type: "callout",
    content: "AgendAR es tu espacio de trabajo todo-en-uno: notas basadas en bloques, sincronización bidireccional con Google Calendar y bóvedas con cifrado de grado militar.",
    icon: "💡",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  b3: {
    id: "b3",
    type: "heading_2",
    content: "Funcionalidades Principales",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  b4: {
    id: "b4",
    type: "todo",
    content: "Editor flexible con comandos rápidos tipo Slash (/)",
    checked: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  b5: {
    id: "b5",
    type: "todo",
    content: "Conexión en tiempo real con Google Calendar",
    checked: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  b6: {
    id: "b6",
    type: "todo",
    content: "Bóveda con encriptación AES-256 de extremo a extremo",
    checked: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // Calendario
  "b-cal-1": {
    id: "b-cal-1",
    type: "heading_1",
    content: "Sincronización con Google Calendar 📅",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  "b-cal-2": {
    id: "b-cal-2",
    type: "callout",
    content: "Cualquier bloque o tarea programada aquí puede exportarse o mantenerse en sincronía automática con tu cuenta de Google Calendar.",
    icon: "🔄",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  "b-cal-3": {
    id: "b-cal-3",
    type: "calendar_event",
    content: "Reunión de Planificación de Sprint (AgendAR)",
    calendarEventDate: "2026-10-15T15:00:00",
    calendarEventId: "gcal_demo_101",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  "b-cal-4": {
    id: "b-cal-4",
    type: "calendar_event",
    content: "Lanzamiento y revisión de arquitectura v1",
    calendarEventDate: "2026-10-18T18:30:00",
    calendarEventId: "gcal_demo_102",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // Bóveda
  "b-vault-1": {
    id: "b-vault-1",
    type: "heading_1",
    content: "Información Confidencial Cifrada 🔐",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  "b-vault-2": {
    id: "b-vault-2",
    type: "callout",
    content: "Esta nota está protegida con cifrado cliente AES-GCM (256 bits). Solo quien tenga la clave de desbloqueo puede visualizar o alterar estos datos.",
    icon: "🛡️",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  "b-vault-3": {
    id: "b-vault-3",
    type: "code",
    language: "json",
    content: "{\n  \"api_key_production\": \"sk_live_98124912941041920\",\n  \"seed_phrase\": \"apple mountain river galaxy silent winter breeze flame orbit crystal\",\n  \"status\": \"VERIFIED_ZERO_KNOWLEDGE\"\n}",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // Base de Datos
  "b-db-1": {
    id: "b-db-1",
    type: "database",
    content: "Base de datos de Proyectos",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
};

export const INITIAL_DATABASE: DatabaseCollection = {
  id: "db-projects",
  title: "Gestor de Tareas y Roadmap",
  properties: [
    { id: "prop-title", name: "Tarea", type: "text" },
    {
      id: "prop-status",
      name: "Estado",
      type: "select",
      options: [
        { id: "opt-1", name: "Por Hacer", color: "bg-gray-700 text-gray-200" },
        { id: "opt-2", name: "En Progreso", color: "bg-blue-600/30 text-blue-300" },
        { id: "opt-3", name: "Completado", color: "bg-emerald-600/30 text-emerald-300" },
      ],
    },
    {
      id: "prop-priority",
      name: "Prioridad",
      type: "select",
      options: [
        { id: "p-low", name: "Baja", color: "bg-slate-700 text-slate-300" },
        { id: "p-med", name: "Media", color: "bg-amber-600/30 text-amber-300" },
        { id: "p-high", name: "Alta", color: "bg-rose-600/30 text-rose-300" },
      ],
    },
    { id: "prop-date", name: "Fecha Límite", type: "date" },
    { id: "prop-done", name: "Listo", type: "checkbox" },
  ],
  views: [
    { id: "view-table", name: "Tabla", type: "table" },
    { id: "view-board", name: "Tablero Kanban", type: "board" },
    { id: "view-calendar", name: "Calendario", type: "calendar" },
  ],
  activeViewId: "view-board",
};

export const INITIAL_DATABASE_ROWS = [
  {
    id: "row-1",
    pageId: "tasks-db-page",
    properties: {
      "prop-title": "Diseñar arquitectura de encriptación",
      "prop-status": "Completado",
      "prop-priority": "Alta",
      "prop-date": "2026-10-14",
      "prop-done": true,
    },
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: "row-2",
    pageId: "tasks-db-page",
    properties: {
      "prop-title": "Conectar integración con Google Calendar API",
      "prop-status": "En Progreso",
      "prop-priority": "Alta",
      "prop-date": "2026-10-16",
      "prop-done": false,
    },
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 1800000,
  },
  {
    id: "row-3",
    pageId: "tasks-db-page",
    properties: {
      "prop-title": "Construir selector Slash Commands (/) en el editor",
      "prop-status": "Por Hacer",
      "prop-priority": "Media",
      "prop-date": "2026-10-19",
      "prop-done": false,
    },
    createdAt: Date.now() - 21600000,
    updatedAt: Date.now() - 7200000,
  },
];
