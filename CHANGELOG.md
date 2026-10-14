# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y sigue el estándar de [Semantic Versioning](https://semver.org/lang/es/).

---

## [0.5.0] - 2026-10-13

### 🚀 Añadido
- **Autenticación Nativa Completa en Supabase (Sin dependencia forzada de credenciales Google Cloud)**:
  - Registro e inicio de sesión con Correo/Gmail y Contraseña directamente contra Supabase Auth (`signInWithEmail`, `signUpWithEmail`).
  - Soporte de Magic Link / OTP (`signInWithOtp`) para acceso directo sin contraseña vía correo electrónico.
  - Flujo de Google OAuth mantenido y listo para cuando se configure el Client ID/Secret en Supabase Dashboard.
  - Página `/login` y `/register` completamente conectadas a Supabase con feedback visual de errores y confirmación.
- **Sincronización Bidireccional en Tiempo Real e Hidratación Automática**:
  - `fetchRemoteData()`: Recupera automáticamente las páginas y bloques de la base de datos Supabase en PostgreSQL tras iniciar sesión.
  - Sincronización transparente en segundo plano que actualiza y persiste notas y bloques en Supabase sin bloquear la interfaz.
  - Suscripción WebSockets en tiempo real (`subscribeRealtime`) para cambios colaborativos entre dispositivos y pestañas.
  - Eliminación sincronizada: `deletePage` y `deleteBlock` limpian tanto la caché local como los registros en la base de datos en la nube.
- **Telemetría Visual de Sincronización en la Barra Superior**:
  - Badge dinámico en el Navbar: `🟢 Nube Supabase OK` cuando está respaldado, `🔄 Guardando...` durante la sincronización, y `⚪ Caché Local` en modo offline.
- **Migración SQL 002 (`002_flexible_ids_and_rls.sql`)**:
  - Flexibilización de identificadores en `pages` y `blocks` a formato universal `TEXT`.
  - Corrección integral de políticas RLS permitiendo CRUD completo para páginas personales y miembros de workspace.
  - Trigger automático `handle_new_user_workspace` para auto-aprovisionar un espacio de trabajo personal por cada nuevo usuario registrado.

---

## [0.4.0] - 2026-10-13

### 🚀 Añadido
- **Conexión Activa en la Nube con Supabase**:
  - Configuración completa de variables de entorno de producción en Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`).
  - Creación del archivo local protegido `.env.local` con las claves reales del proyecto `muhurolxcyfgwbouruxc`.
  - Migración y verificación de 100% de tablas relacionales (`workspaces`, `pages`, `blocks`, `database_collections`, `profiles`) y políticas de Row-Level Security en PostgreSQL activo.
  - Sincronización en segundo plano de páginas y bloques modificados directamente con la base de datos de Supabase.

---

## [0.3.0] - 2026-10-13

### 🚀 Añadido
- **Autenticación Real con Google (Gmail) & Supabase**:
  - Endpoint de callback OAuth de servidor (`/auth/callback`) para intercambiar códigos de sesión de Google con Supabase Auth.
  - Soporte de inicio de sesión con Google OAuth y vinculación directa de cuenta de Gmail en `/login`.
- **Persistencia de Datos Aislada por Cuenta de Usuario**:
  - Motor `UserStorageManager` que guarda todas las páginas, notas, bloques y bases de datos bajo la identidad específica del usuario (`agendar_pages_${userEmail}`).
  - Cuando un usuario inicia sesión con su Gmail, sus notas se cargan automáticamente y cualquier edición se sincroniza y almacena en su cuenta.
- **Controles de Cuenta en la Interfaz**:
  - Indicador de usuario activo en la barra superior con estado "Guardado en tu cuenta".
  - Botón interactivo de "Iniciar sesión con Gmail" en Sidebar y Navbar cuando no hay sesión.
  - Opción de "Cerrar sesión" y cambio de cuenta instantáneo.

---

## [0.2.0] - 2026-10-13

### 🚀 Añadido
- **Persistencia y Arquitectura Supabase**:
  - Script SQL de migración inicial (`supabase/migrations/001_initial_schema.sql`) con esquema relacional para perfiles, workspaces, miembros, páginas, bloques, bases de datos dinámicas y configuración IA.
  - Políticas de seguridad a nivel de fila (Row-Level Security / RLS) para aislamiento de workspaces y proyectos privados.
  - Clientes Supabase para navegador (`src/lib/supabase/client.ts`) y servidor (`src/lib/supabase/server.ts`).
  - Template de variables de entorno (`.env.example`).
- **Asistente de Inteligencia Artificial (BYOK)**:
  - Soporte multi-proveedor para Google Gemini (compatible con el tier gratuito de Google AI Studio), Anthropic Claude y OpenAI/Codex.
  - Modal interactivo (`AIAssistantModal`) con generador de páginas completas por prompt, ideas rápidas y panel de gestión de API keys locales.
- **Galería de Plantillas Profesionales**:
  - 6 plantillas listas para usar: Planificador Semanal & Timeblocking (Google Calendar sync), Roadmap Ágil de Software / Scrum, Monitor de Hábitos, Minuta de Reunión, Bóveda de Seguridad E2EE y CRM de Leads.
  - Modal interactivo (`TemplatesModal`) con filtrado por categorías e inserción con un solo clic.
- **Gestión de Proyectos Privados y Colaboración Multiusuario**:
  - Modal de compartir (`ShareModal`) con conmutador de privacidad ("Proyecto Privado" vs "Compartido en Workspace").
  - Generación de enlaces de invitación y asignación de roles (Owner, Admin, Editor, Lector).
  - Indicadores visuales de estado privado y cifrado en el sidebar y barra superior.

---

## [0.1.0] - 2026-10-13

### 🚀 Añadido
- Inicialización del proyecto AgendAR con Next.js 15, TypeScript y Tailwind CSS en modo oscuro Notion.
- Motor criptográfico AES-GCM (256 bits) + PBKDF2 para Bóvedas Zero-Knowledge E2EE.
- Integración y sincronización de eventos con Google Calendar API v3.
- Editor de bloques interactivo con menú Slash (`/`) y reordenamiento.
- Bases de datos con vistas conmutables: Tablero Kanban, Tabla y Calendario.
- Páginas de inicio de sesión dual (Credenciales + Google OAuth) y Registro.
- Despliegue de producción continuo en Vercel ([agendar-one.vercel.app](https://agendar-one.vercel.app)).
