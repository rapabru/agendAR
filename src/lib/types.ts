// Tipos y Modelos Core para AgendAR

export type BlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "bullet_list"
  | "numbered_list"
  | "todo"
  | "toggle"
  | "callout"
  | "code"
  | "divider"
  | "quote"
  | "database"
  | "calendar_event";

export interface Block {
  id: string;
  type: BlockType;
  content: string; // Texto enriquecido o HTML/Markdown serializado
  checked?: boolean; // Para todo
  collapsed?: boolean; // Para toggles
  language?: string; // Para bloques de código
  icon?: string; // Para callouts o páginas
  color?: string; // Color de texto o fondo
  childrenIds?: string[]; // IDs de bloques anidados
  parentId?: string | null; // ID de bloque padre o ID de página
  createdAt: number;
  updatedAt: number;
  calendarEventId?: string; // ID de Google Calendar si está vinculado
  calendarEventDate?: string; // Formato ISO 8601 YYYY-MM-DDTHH:mm:ss
}

export type PropertyType =
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "relation";

export interface DatabaseProperty {
  id: string;
  name: string;
  type: PropertyType;
  options?: { id: string; name: string; color: string }[]; // Para select y multi-select
}

export interface DatabaseRow {
  id: string;
  pageId: string;
  properties: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface DatabaseView {
  id: string;
  name: string;
  type: "table" | "board" | "calendar" | "list";
  filter?: any;
  sort?: { propertyId: string; direction: "asc" | "desc" }[];
}

export interface DatabaseCollection {
  id: string;
  title: string;
  properties: DatabaseProperty[];
  views: DatabaseView[];
  activeViewId: string;
}

export interface PageItem {
  id: string;
  title: string;
  icon?: string;
  coverImage?: string;
  parentId?: string | null; // Jerarquía de páginas infinitas
  isFavorite?: boolean;
  isEncrypted?: boolean; // Indica si es una Bóveda E2EE
  encryptionSalt?: string; // Salt para derivar la clave local
  createdAt: number;
  updatedAt: number;
  blockIds: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: "credentials" | "google";
  googleCalendarLinked: boolean;
  googleCalendarEmail?: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  ownerId: string;
  pages: PageItem[];
}
