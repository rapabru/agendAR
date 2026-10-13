import { PageItem, Block } from "./types";
import { INITIAL_PAGES, INITIAL_BLOCKS } from "./mock-data";
import { createClient } from "./supabase/client";

/**
 * Gestor de Persistencia Aislada por Cuenta de Usuario (Gmail / Supabase)
 */
export class UserStorageManager {
  private userIdentifier: string;

  constructor(userIdentifier: string = "default") {
    this.userIdentifier = userIdentifier.toLowerCase().trim();
  }

  private getPagesKey(): string {
    return `agendar_pages_${this.userIdentifier}`;
  }

  private getBlocksKey(): string {
    return `agendar_blocks_${this.userIdentifier}`;
  }

  /**
   * Carga las páginas del usuario. Si es la primera vez, inicializa con las plantillas de bienvenida.
   */
  public loadPages(): PageItem[] {
    if (typeof window === "undefined") return INITIAL_PAGES;

    const raw = localStorage.getItem(this.getPagesKey());
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.error("Error cargando páginas de almacenamiento:", err);
      }
    }

    // Inicializar para este usuario y guardar
    this.savePages(INITIAL_PAGES);
    return INITIAL_PAGES;
  }

  /**
   * Guarda las páginas del usuario
   */
  public savePages(pages: PageItem[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.getPagesKey(), JSON.stringify(pages));

    // Intentar sincronizar en segundo plano con Supabase si está disponible
    this.syncPagesToSupabase(pages).catch(() => {});
  }

  /**
   * Carga los bloques del usuario
   */
  public loadBlocks(): Record<string, Block> {
    if (typeof window === "undefined") return INITIAL_BLOCKS;

    const raw = localStorage.getItem(this.getBlocksKey());
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      } catch (err) {
        console.error("Error cargando bloques de almacenamiento:", err);
      }
    }

    // Inicializar y guardar
    this.saveBlocks(INITIAL_BLOCKS);
    return INITIAL_BLOCKS;
  }

  /**
   * Guarda los bloques del usuario
   */
  public saveBlocks(blocks: Record<string, Block>): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.getBlocksKey(), JSON.stringify(blocks));

    // Intentar sincronizar en segundo plano con Supabase si está disponible
    this.syncBlocksToSupabase(blocks).catch(() => {});
  }

  /**
   * Sincroniza páginas con Supabase en la nube
   */
  private async syncPagesToSupabase(pages: PageItem[]): Promise<void> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes("placeholder-project")) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const p of pages) {
        await supabase.from("pages").upsert({
          id: p.id,
          title: p.title,
          icon: p.icon,
          is_favorite: p.isFavorite,
          is_encrypted: p.isEncrypted,
          is_private: p.isPrivate,
          updated_at: new Date(p.updatedAt).toISOString(),
        });
      }
    } catch {
      // Sincronización transparente sin bloquear la UI
    }
  }

  /**
   * Sincroniza bloques con Supabase en la nube
   */
  private async syncBlocksToSupabase(blocks: Record<string, Block>): Promise<void> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes("placeholder-project")) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const blockList = Object.values(blocks);
      for (const b of blockList) {
        await supabase.from("blocks").upsert({
          id: b.id,
          type: b.type,
          content: b.content,
          checked: b.checked,
          calendar_event_id: b.calendarEventId,
          calendar_event_date: b.calendarEventDate,
          updated_at: new Date(b.updatedAt).toISOString(),
        });
      }
    } catch {
      // Sincronización transparente
    }
  }
}
