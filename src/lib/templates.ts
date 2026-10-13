import { Block, BlockType } from "./types";

export interface TemplateDefinition {
  id: string;
  name: string;
  category: "Productividad" | "Desarrollo" | "Seguridad" | "Gestión";
  description: string;
  icon: string;
  isEncrypted?: boolean;
  blocks: Omit<Block, "id" | "createdAt" | "updatedAt">[];
}

export const TEMPLATE_LIBRARY: TemplateDefinition[] = [
  {
    id: "tpl-weekly-planner",
    name: "Planificador Semanal & Timeblocking",
    category: "Productividad",
    description: "Organiza tu semana por bloques de tiempo con sincronización a Google Calendar.",
    icon: "🗓️",
    blocks: [
      { type: "heading_1", content: "Planificador Semanal 🗓️" },
      {
        type: "callout",
        icon: "💡",
        content: "Tip: Vincula las tareas con hora específica a tu Google Calendar haciendo clic en 'Sincronizar'.",
      },
      { type: "heading_2", content: "🎯 Prioridades Principales de la Semana" },
      { type: "todo", content: "Cerrar propuesta de arquitectura para el cliente", checked: false },
      { type: "todo", content: "Revisión de métricas de rendimiento y despliegue", checked: false },
      { type: "todo", content: "Entrenar 3 veces por semana", checked: false },
      { type: "heading_2", content: "📅 Eventos Programados (Google Calendar)" },
      {
        type: "calendar_event",
        content: "Reunión de alineación con equipo técnico",
        calendarEventDate: "2026-10-14T10:00:00",
      },
      {
        type: "calendar_event",
        content: "Demo de producto en vivo",
        calendarEventDate: "2026-10-16T16:00:00",
      },
      { type: "heading_2", content: "📝 Notas y Reflexión del Viernes" },
      { type: "paragraph", content: "Qué funcionó bien esta semana y qué podemos optimizar..." },
    ],
  },
  {
    id: "tpl-scrum-roadmap",
    name: "Roadmap Ágil de Software & Sprints",
    category: "Desarrollo",
    description: "Gestión de tareas, épicas, backlog y bugs en formato Kanban interactivo.",
    icon: "🚀",
    blocks: [
      { type: "heading_1", content: "Sprint Board & Roadmap Técnico 🚀" },
      {
        type: "callout",
        icon: "📌",
        content: "Sprint 24: Objetivo principal: Lanzar autenticación y bases de datos en producción.",
      },
      { type: "database", content: "Tablero de Tareas Ágiles" },
      { type: "heading_2", content: "🐛 Reportes de Bugs Prioritarios" },
      { type: "todo", content: "Validar timeout en llamadas a WebSockets", checked: false },
      { type: "todo", content: "Revisar padding de botones en móviles", checked: false },
    ],
  },
  {
    id: "tpl-habit-tracker",
    name: "Monitor de Hábitos & Metas Diarias",
    category: "Productividad",
    description: "Lleva constancia de tus hábitos de salud, lectura y desarrollo personal.",
    icon: "📈",
    blocks: [
      { type: "heading_1", content: "Registro de Hábitos Diarios 📈" },
      {
        type: "callout",
        icon: "🔥",
        content: "La consistencia supera a la intensidad. Marca tus metas diarias.",
      },
      { type: "heading_2", content: "💪 Salud y Rendimiento" },
      { type: "todo", content: "Beber 2.5L de agua", checked: false },
      { type: "todo", content: "30 minutos de ejercicio / caminata", checked: false },
      { type: "todo", content: "8 horas de sueño reparador", checked: false },
      { type: "heading_2", content: "🧠 Enfoque y Aprendizaje" },
      { type: "todo", content: "Leer 15 páginas de un libro", checked: false },
      { type: "todo", content: "1 hora de código profundo (Deep Work)", checked: false },
      { type: "todo", content: "Meditación / respiración 10 min", checked: false },
    ],
  },
  {
    id: "tpl-meeting-notes",
    name: "Minuta de Reunión & Acuerdos",
    category: "Gestión",
    description: "Estructura profesional para registrar asistentes, temas tratados y compromisos.",
    icon: "🤝",
    blocks: [
      { type: "heading_1", content: "Minuta de Reunión: [Tema de la Sesión] 🤝" },
      {
        type: "callout",
        icon: "📋",
        content: "Fecha: 14 de Octubre | Moderador: Bruno | Asistentes: Equipo de Desarrollo",
      },
      { type: "heading_2", content: "🎯 Agenda del Encuentro" },
      { type: "paragraph", content: "1. Estado actual del despliegue en Vercel y Supabase." },
      { type: "paragraph", content: "2. Demostración del motor de IA y plantillas." },
      { type: "heading_2", content: "💡 Principales Conclusiones y Decisiones" },
      { type: "paragraph", content: "- Se aprueba el uso de Supabase para la base de datos principal." },
      { type: "paragraph", content: "- Mantendremos soporte de planes gratuitos mediante Google Gemini." },
      { type: "heading_2", content: "✅ Próximas Acciones (Action Items)" },
      { type: "todo", content: "Crear proyecto en Supabase y ejecutar migraciones", checked: false },
      { type: "todo", content: "Probar integración con Google Calendar API", checked: false },
    ],
  },
  {
    id: "tpl-vault-security",
    name: "Bóveda de Credenciales & Privacidad",
    category: "Seguridad",
    description: "Plantilla cifrada con AES-256 para guardar accesos, llaves API y notas críticas.",
    icon: "🔒",
    isEncrypted: true,
    blocks: [
      { type: "heading_1", content: "Bóveda de Seguridad Confidencial 🔐" },
      {
        type: "callout",
        icon: "🛡️",
        content: "Nota cifrada con AES-GCM (256 bits). Ni el servidor ni Supabase tienen la clave en claro.",
      },
      { type: "heading_2", content: "🔑 Llaves API de Servicios en la Nube" },
      {
        type: "code",
        language: "env",
        content: "DATABASE_URL=postgresql://...\nJWT_SECRET=super_secret_production_key_32bytes",
      },
      { type: "heading_2", content: "💳 Cuentas y Accesos Críticos" },
      { type: "todo", content: "Backup de 2FA descargado en disco físico", checked: true },
      { type: "todo", content: "Rotación de contraseña maestra cada 90 días", checked: false },
    ],
  },
  {
    id: "tpl-crm-leads",
    name: "CRM de Clientes & Contactos",
    category: "Gestión",
    description: "Seguimiento de prospectos, clientes, llamadas y estado de ventas.",
    icon: "💼",
    blocks: [
      { type: "heading_1", content: "Pipeline de Clientes y Oportunidades 💼" },
      {
        type: "callout",
        icon: "📊",
        content: "Control del embudo comercial: Primer contacto -> Propuesta -> Cierre.",
      },
      { type: "database", content: "Embudo de Ventas" },
      { type: "heading_2", content: "📞 Llamadas y Seguimientos Pendientes" },
      {
        type: "calendar_event",
        content: "Llamada de presentación de propuesta a Empresa X",
        calendarEventDate: "2026-10-17T11:00:00",
      },
    ],
  },
];
