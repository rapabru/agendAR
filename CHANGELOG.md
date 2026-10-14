# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y sigue el estándar de [Semantic Versioning](https://semver.org/lang/es/).

---

## [0.8.0] - 2026-10-14

### 🎨 Rediseño Visual Integral & Nueva Identidad Obsidian Dark
- **Nueva Tipografía de Alto Rendimiento**:
  - Incorporación de **Plus Jakarta Sans** (`--font-sans`) como tipografía principal a través de `next/font/google` con optimización de fuentes sin CLS (*Cumulative Layout Shift*).
  - Incorporación de **JetBrains Mono** (`--font-mono`) para bloques de código, marcas de tiempo y etiquetas numéricas.
  - Ajuste tipográfico global con kerning y espaciado de letras refinado (`tracking-[-0.012em]`).
- **Paleta de Colores Obsidian Dark & Superficies Glassmorphism**:
  - Reemplazo del tono marrón-grisáceo `#191919`/`#202020` por un fondo negro obsidiana profundo (`#0c0d12`), barra lateral de superficie elegante (`#0f1016`) y tarjetas elevadas (`#13141d`, `#161822`, `#1c1e2b`).
  - Iluminación ambiental con degradados radiales sutiles (`from-indigo-950/30 via-[#0c0d12] to-[#0c0d12]`).
  - Bordes translúcidos de precisión (`border-white/[0.06]`, `border-white/[0.08]`) y efectos `backdrop-blur-2xl`.
  - Acentos de color vibrantes: **Cyan Celestial** (`#38bdf8`), **Índigo Eléctrico** (`#6366f1`), **Esmeralda Vivo** (`#10b981`) y **Púrpura Neón** (`#a855f7`).
- **Rediseño Completo de Componentes**:
  - **Barra Lateral (`Sidebar`)**: Logo con gradiente tricolor, contenedores de iconos iluminados (*icon wells*), indicador activo con borde cyan a la izquierda y barra de usuario con avatar en degradado y pulso de estado en tiempo real.
  - **Barra de Navegación (`Navbar`)**: Barra superior flotante translúcida con píldoras de acción rápida (AI Assistant, Plantillas, Calendario, Bóvedas) con halos de luz.
  - **Editor de Bloques (`BlockEditor`)**: Título audaz de gran formato (`text-3xl` a `text-5xl`), callouts y bloques de código refinados con esquinas redondeadas (`rounded-2xl`), menú contextual Slash (`/`) estilizado y selector de plantillas vacías con tarjetas Obsidian.
  - **Vistas de Base de Datos (`DatabaseView`)**: Píldoras de vista de selección (Kanban, Tabla, Calendario) con fondos activos en brillo translúcido, tarjetas de Kanban con badges de estado y bordes de hover en cyan.
  - **Modales de Sistema**: Rediseño unificado en formato `rounded-3xl` y `backdrop-blur-2xl` para `NewPageModal`, `TemplatesModal`, `VaultUnlockModal`, `GoogleCalendarModal`, `AIAssistantModal` y `ShareModal`.
  - **Páginas de Acceso (`/login` y `/register`)**: Experiencia de inicio de sesión y registro modernizada con tarjeta de cristal central, botones en gradiente y transiciones suaves.

---

## [0.7.0] - 2026-10-14

### 🚀 Añadido
- **Selector de Plantillas Predeterminadas al Crear Páginas (`NewPageModal`)**:
  - Modal interactivo de creación de página que se despliega automáticamente al pulsar `+` o "Añadir una página" en la barra lateral.
  - Selección rápida de modo de inicio:
    - 📄 **Página en blanco**: Lienzo limpio y despejado para redacción libre.
    - 🔒 **Bóveda Cifrada (E2EE)**: Creación de página protegida con AES-256-GCM.
    - 🤖 **Generar con IA**: Apertura directa del generador asistido para estructurar notas desde un prompt.
  - Galería integrada de plantillas predeterminadas en tarjetas con categoría, icono, descripción y conteo de bloques.
  - Filtro interactivo por categorías (*Todas, Productividad, Desarrollo, Gestión, Seguridad*).
- **Selector Notion-Style en Páginas Vacías (`BlockEditor`)**:
  - Detección inteligente de páginas recién creadas o sin contenido.
  - Despliegue de un panel de bienvenida contextual con plantillas recomendadas con 1 solo clic.
  - Aplicación instantánea de plantillas sobre la página actual sin duplicar páginas innecesariamente.
  - Desaparición suave del selector al comenzar a escribir o añadir bloques.
- **Nuevas Plantillas Predeterminadas en la Biblioteca**:
  - 🎯 **Metas & Objetivos Trimestrales (OKRs)**: Estructura de objetivos y resultados clave medibles (Q4).
  - 📚 **Apuntes de Estudio & Resumen Académico**: Plantilla basada en el Método Cornell para apuntes, conceptos, código y preguntas de autoevaluación.
- **Navegación y UX en Sidebar**:
  - Botón interactivo "+ Añadir una página" al pie de la lista de páginas para facilitar la creación en un solo clic.

---

## [0.6.0] - 2026-10-14

### 🛡️ Seguridad y Blindaje Integral (Security Audit & Remediation)
- **Criptografía Real de Grado Militar para Bóvedas Privadas (Zero-Knowledge / E2EE)**:
  - Implementación completa de motor criptográfico en `src/lib/crypto.ts` basado en WebCrypto API.
  - Derivación de clave AES-256-GCM mediante PBKDF2 (100.000 iteraciones con SHA-256) y salt criptográfico seguro de 16 bytes.
  - Validación con **Canario Criptográfico Autenticado** (`createVaultCanary` y `verifyVaultPassphrase`): previene bypasses de contraseña; cualquier intento con contraseña incorrecta es rechazado inmediatamente por el tag de autenticación MAC (128 bits) arrojando `OperationError`.
  - Cifrado real bloque por bloque (`encryptBlockContent`) con vector de inicialización único (IV de 12 bytes) y descifrado exclusivamente en memoria (`decryptBlockContent`).
  - Actualización de `VaultUnlockModal.tsx` y `page.tsx` para derivar claves en tiempo real y desencriptar notas solo tras autenticación exitosa.
- **Corrección de Aislamiento Multi-Inquilino en Base de Datos (BOLA / IDOR Fix)**:
  - Creación de migración SQL `003_secure_rls_and_bola_fix.sql` en Supabase PostgreSQL.
  - Eliminación de la cláusula permisiva `OR workspace_id IS NULL` en las políticas RLS de `blocks`, cerrando la vulnerabilidad que permitía a cualquier usuario leer o modificar bloques ajenos en páginas personales.
  - Corrección de la política `pages_insert_policy` para forzar `created_by = auth.uid()`, eliminando el riesgo de suplantación de autoría (*Creator Spoofing*).
- **Protección Web de Cabeceras HTTP y Prevención de Clickjacking**:
  - Configuración de cabeceras de seguridad estrictas en `next.config.ts`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` (HSTS con preload), `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, y `Content-Security-Policy: frame-ancestors 'none'`.
- **Next.js Edge Middleware de Autenticación y Defensa en Profundidad**:
  - Creación de `src/middleware.ts` en el Edge Runtime de Vercel para refrescar sesiones activas de Supabase y asegurar que todas las respuestas HTTP inyecten cabeceras de seguridad.
- **Sanitización de Redirección Abierta (Open Redirect)**:
  - Implementación de `getSafeRedirectUrl` en `src/app/auth/callback/route.ts` que valida rutas relativas seguras internas e invalida esquemas externos maliciosos (`//`, `http:`, etc.).
- **Blindaje del Endpoint de Sincronización de Calendario**:
  - `src/app/api/calendar/sync/route.ts` ahora valida rigurosamente la sesión del usuario mediante `createServerSupabaseClient()`, rechaza accesos anónimos con HTTP 401, audita tamaños de payload y fechas ISO, y enmascara errores 500 para evitar fugas de traza.
- **Protección de Credenciales de IA**:
  - Migración de llamadas a Gemini API en `src/lib/ai/assistant.ts` para enviar la API Key exclusivamente a través del header HTTP `x-goog-api-key`, eliminando la exposición de credenciales en query strings de URL.
- **Cadena de Suministro npm**:
  - Configuración de `overrides` en `package.json` para resolver vulnerabilidades críticas de PostCSS (`postcss@^8.5.3`, `postcss-selector-parser@^7.1.6`).
- **Auditoría Completa Documentada**:
  - Generación de suite completa de auditoría en `~/audits/my-project` (`README.md`, `CODE_REVIEW_SRC.md`, `VULNERABILITY_CATALOG.md`, `WEB_AND_SURROUNDS_AUDIT.md`, `REMEDIATION_PLAN.md`).

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
