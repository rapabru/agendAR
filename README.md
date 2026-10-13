# 🚀 AgendAR

[![Release](https://img.shields.io/badge/release-v0.2.0-blue.svg)](https://github.com/rapabru/agendAR/releases)
[![Deploy](https://img.shields.io/badge/deployed-Vercel-black.svg)](https://agendar-one.vercel.app)
[![Database](https://img.shields.io/badge/database-Supabase%20PostgreSQL-emerald.svg)](https://supabase.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **El espacio de trabajo colaborativo todo-en-uno que combina notas estructuradas basadas en bloques, bases de datos relacionales sin código, sincronización bidireccional con Google Calendar y Bóvedas con encriptación de grado militar (Zero-Knowledge / E2EE).**

---

## 🌟 Características Principales

### 📝 1. Editor Dinámico Basado en Bloques (Estilo Notion)
- **Bloques Modulares**: Encabezados (H1, H2, H3), párrafos dinámicos, listas de tareas (To-Do), llamadas destacadas (*Callouts* con emojis), bloques de código con resaltado sintáctico, y bloques especiales de integración.
- **Comandos Rápidos Slash (`/`)**: Escribe `/` en cualquier bloque para desplegar el selector contextual y transformar o insertar elementos al instante.
- **Jerarquía Infinita**: Crea páginas dentro de páginas con navegación en árbol, migas de pan (*breadcrumbs*) y accesos directos a favoritos.
- **Reordenamiento Intuitivo**: Control de posición vertical para estructurar ideas con fluidez.

### 📅 2. Integración Nativa con Google Calendar
- **Sincronización Bidireccional**: Crea tareas, reuniones o eventos en tus notas y proyéctalos directamente a tu calendario de Google.
- **Detección Automática de Fechas**: Asignación de fecha, hora y recordatorio con actualización en tiempo real mediante Google Calendar API v3.
- **Gestión de Cuentas Google**: Vinculación y desvinculación rápida mediante OAuth 2.0.

### 🔐 3. Seguridad Avanzada y Bóvedas Cifradas (Zero-Knowledge / E2EE)
- **Cifrado en Tránsito y Reposo**: Protección estándar con TLS 1.3 y AES-256 en toda la infraestructura.
- **Bóvedas Privadas (End-to-End Encryption)**: Las páginas marcadas como "Bóveda" se cifran y descifran exclusivamente en el navegador del usuario utilizando la **Web Crypto API** con **AES-GCM (256 bits)** y derivación de clave **PBKDF2** (SHA-256, 100.000 iteraciones). Ni el servidor ni intermediarios tienen acceso al contenido sin la clave maestra.

### 📊 4. Bases de Datos Dinámicas y Multi-Vista
- **Tablero Kanban**: Visualiza y gestiona flujos de trabajo arrastrando tarjetas por estado (*Por Hacer*, *En Progreso*, *Completado*).
- **Vista Tabla (Data Grid)**: Edición inline de atributos, prioridades, fechas y estados.
- **Proyección Temporal**: Vista de calendario integrado para seguimiento de fechas límite.
- **Filtros en Tiempo Real**: Búsqueda y filtrado instantáneo de elementos.

### 🤖 5. Inteligencia Artificial Multi-Modelo (BYOK - Bring Your Own Key)
- Motor compatible con:
  - **Google Gemini** (Gemini 1.5/2.5 Flash & Pro) — con soporte para el plan gratuito de Google AI Studio.
  - **Anthropic Claude** (Claude 3.5/3.7 Sonnet)
  - **OpenAI / Codex** (GPT-4o)
- Capacidad de generar planes completos estructurados en bloques a partir de un solo prompt.

### 📚 6. Galería de Plantillas Profesionales Integrada
- Plantillas listas con 1-clic:
  - *Planificador Semanal & Timeblocking* (vinculado a Google Calendar).
  - *Roadmap Ágil de Software / Scrum Sprint*.
  - *Monitor de Hábitos y Metas Diarias*.
  - *Minuta de Reunión & Acuerdos*.
  - *Bóveda de Seguridad & Credenciales (E2EE)*.
  - *CRM de Contactos & Leads*.

### 👥 7. Proyectos Privados y Colaboración Multiusuario
- Modal para alternar entre **Proyecto Privado** (visible solo para el creador) y **Compartido con el Workspace**.
- Sistema de invitaciones por email y generación de enlaces para unirse con roles (*Owner, Admin, Editor, Lector*).
- Migraciones preparadas para PostgreSQL en Supabase con Row-Level Security (RLS).

---

## 🏛️ Arquitectura del Sistema

```mermaid
graph TD
    subgraph Cliente ["Frontend (Next.js 15 + Tailwind CSS)"]
        UI[Workspace & Dashboard]
        Editor[Block Engine + Slash Commands]
        CryptoClient[Web Crypto API: AES-GCM + PBKDF2]
        DBView[Multi-View Engine: Kanban / Tabla / Calendario]
    end

    subgraph Backend ["Servicios Backend (API Routes)"]
        Auth[Autenticación Dual: Credenciales + Google OAuth]
        GCalAPI[Google Calendar API v3 Connector]
        SyncWorker[Realtime Sync Worker]
    end

    subgraph Infra ["Infraestructura & Nube"]
        Vercel[Vercel Edge Network]
        CloudDB[(PostgreSQL / Storage)]
        GoogleCloud[Google Workspace Cloud Platform]
    end

    UI --> Auth
    Editor --> CryptoClient
    DBView --> SyncWorker
    UI --> GCalAPI
    Auth --> CloudDB
    GCalAPI --> GoogleCloud
    Cliente --> Vercel
```

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Uso |
| :--- | :--- | :--- |
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org/) | Renderizado híbrido, API Routes y arquitectura modular |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) | Tipado estricto y seguridad en tiempo de compilación |
| **Estilos** | [Tailwind CSS](https://tailwindcss.com/) | Diseño responsivo con estética Notion Dark |
| **Iconografía** | [Lucide React](https://lucide.dev/) | Iconos vectoriales consistentes |
| **Criptografía** | [Web Crypto API](https://developer.mozilla.org/es/docs/Web/API/Web_Crypto_API) | Cifrado E2EE cliente sin dependencias pesadas |
| **Integraciones** | Google Calendar API v3 | Sincronización de eventos y tareas |
| **Despliegue** | [Vercel](https://vercel.com/) | Hosting continuo con soporte CI/CD |

---

## 📦 Instalación y Desarrollo Local

### Prerrequisitos
- Node.js 18.x o superior (Recomendado v20+ o v22)
- npm o pnpm

### Pasos

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/rapabru/agendAR.git
   cd agendAR
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. Abrir en el navegador [http://localhost:3000](http://localhost:3000).

---

## 🗺️ Roadmap de Fases
- [x] **Fase 0**: Arquitectura modular, setup Next.js 15, Tailwind y tipos core.
- [x] **Fase 1**: Motor criptográfico AES-GCM-256 E2EE, Google Calendar Sync y vistas de login/registro.
- [x] **Fase 2**: Editor de bloques con barra Slash (`/`), Bóvedas privadas y base de datos Kanban/Tabla.
- [x] **Fase 3**: Persistencia completa y schema para PostgreSQL en Supabase + RLS para proyectos privados.
- [x] **Fase 4**: Asistente de IA multi-proveedor con BYOK (Gemini gratis, Claude, OpenAI) para generación de notas y bloques.
- [x] **Fase 5**: Galería de 6 plantillas profesionales integradas (Scrum, Timeblocking, Hábitos, Minutas, Bóvedas, CRM).
- [ ] **Fase 6**: Colaboración multijugador en vivo con cursores compartidos (WebSockets / Supabase Realtime / CRDTs).
- [ ] **Fase 7**: Conexión activa con cuenta Supabase en producción mediante variables de entorno en Vercel.

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
