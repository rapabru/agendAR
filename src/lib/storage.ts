import { PageItem, Block } from "./types";
import { INITIAL_PAGES, INITIAL_BLOCKS } from "./mock-data";
import { createClient } from "./supabase/client";

export type SyncStatus = "synced" | "syncing" | "offline" | "error";

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: Date | null;
  errorMessage?: string;
}

/**
 * Gestor de Persistencia Híbrida: Local (Zero-latency) + Supabase Cloud PostgreSQL en Tiempo Real
 */
export class UserStorageManager {
  private userIdentifier: string;
  private onSyncStatusChange?: (state: SyncState) => void;

  constructor(
    userIdentifier: string = "default",
    onSyncStatusChange?: (state: SyncState) => void
  ) {
    this.userIdentifier = userIdentifier.toLowerCase().trim();
    this.onSyncStatusChange = onSyncStatusChange;
  }

  private getPagesKey(): string {
    return `agendar_pages_${this.userIdentifier}`;
  }

  private getBlocksKey(): string {
    return `agendar_blocks_${this.userIdentifier}`;
  }

  private notifySync(status: SyncStatus, errorMessage?: string) {
    if (this.onSyncStatusChange) {
      this.onSyncStatusChange({
        status,
        lastSyncedAt: status === "synced" ? new Date() : null,
        errorMessage,
      });
    }
  }

  /**
   * Carga sincrónica instantánea desde caché local para evitar pantalla blanca
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
        console.error("Error cargando páginas locales:", err);
      }
    }

    // Inicializar para este usuario y guardar
    this.savePagesLocal(INITIAL_PAGES);
    return INITIAL_PAGES;
  }

  /**
   * Carga sincrónica instantánea de bloques desde caché local
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
        console.error("Error cargando bloques locales:", err);
      }
    }

    this.saveBlocksLocal(INITIAL_BLOCKS);
    return INITIAL_BLOCKS;
  }

  /**
   * Guarda únicamente en LocalStorage (rápido)
   */
  public savePagesLocal(pages: PageItem[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.getPagesKey(), JSON.stringify(pages));
  }

  public saveBlocksLocal(blocks: Record<string, Block>): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.getBlocksKey(), JSON.stringify(blocks));
  }

  /**
   * Guarda páginas localmente y dispara sincronización con Supabase Cloud
   */
  public savePages(pages: PageItem[]): void {
    this.savePagesLocal(pages);
    this.syncPagesToSupabase(pages).catch((err) => {
      console.warn("Supabase pages sync background warn:", err);
    });
  }

  /**
   * Guarda bloques localmente y dispara sincronización con Supabase Cloud
   */
  public saveBlocks(blocks: Record<string, Block>): void {
    this.saveBlocksLocal(blocks);
    this.syncBlocksToSupabase(blocks).catch((err) => {
      console.warn("Supabase blocks sync background warn:", err);
    });
  }

  /**
   * Elimina una página en local y en Supabase Cloud
   */
  public async deletePage(pageId: string): Promise<void> {
    const pages = this.loadPages().filter((p) => p.id !== pageId);
    this.savePagesLocal(pages);

    const supabase = createClient();
    try {
      await supabase.from("pages").delete().eq("id", pageId);
    } catch {
      // ignore
    }
  }

  /**
   * Elimina un bloque en local y en Supabase Cloud
   */
  public async deleteBlock(blockId: string): Promise<void> {
    const blocks = { ...this.loadBlocks() };
    delete blocks[blockId];
    this.saveBlocksLocal(blocks);

    const supabase = createClient();
    try {
      await supabase.from("blocks").delete().eq("id", blockId);
    } catch {
      // ignore
    }
  }

  /**
   * Descarga los datos reales de Supabase PostgreSQL del usuario activo
   */
  public async fetchRemoteData(): Promise<{
    pages: PageItem[];
    blocks: Record<string, Block>;
  } | null> {
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        this.notifySync("offline");
        return null;
      }

      this.notifySync("syncing");

      // 1. Obtener páginas
      const { data: dbPages, error: pagesError } = await supabase
        .from("pages")
        .select("*")
        .order("created_at", { ascending: true });

      if (pagesError) {
        console.warn("Error leyendo páginas de Supabase:", pagesError);
        this.notifySync("error", pagesError.message);
        return null;
      }

      // 2. Obtener bloques
      const { data: dbBlocks, error: blocksError } = await supabase
        .from("blocks")
        .select("*")
        .order("created_at", { ascending: true });

      if (blocksError) {
        console.warn("Error leyendo bloques de Supabase:", blocksError);
      }

      // Si el usuario en Supabase no tiene páginas aún (cuenta nueva), sembramos los datos iniciales
      if (!dbPages || dbPages.length === 0) {
        const localPages = this.loadPages();
        const localBlocks = this.loadBlocks();
        await this.syncPagesToSupabase(localPages);
        await this.syncBlocksToSupabase(localBlocks);
        this.notifySync("synced");
        return { pages: localPages, blocks: localBlocks };
      }

      // Mapear bloques de BD a objeto
      const mappedBlocks: Record<string, Block> = {};
      const blocksByPage: Record<string, string[]> = {};

      if (dbBlocks && dbBlocks.length > 0) {
        for (const b of dbBlocks) {
          const blockId = String(b.id);
          const pageId = String(b.page_id);

          mappedBlocks[blockId] = {
            id: blockId,
            type: b.type,
            content: b.content || "",
            checked: b.checked,
            calendarEventId: b.calendar_event_id,
            calendarEventDate: b.calendar_event_date,
            parentId: pageId,
            createdAt: new Date(b.created_at).getTime(),
            updatedAt: new Date(b.updated_at).getTime(),
          };

          if (!blocksByPage[pageId]) {
            blocksByPage[pageId] = [];
          }
          blocksByPage[pageId].push(blockId);
        }
      }

      // Mapear páginas de BD a PageItem
      const mappedPages: PageItem[] = dbPages.map((p) => {
        const pageId = String(p.id);
        return {
          id: pageId,
          title: p.title || "Sin título",
          icon: p.icon || "📄",
          isFavorite: !!p.is_favorite,
          isEncrypted: !!p.is_encrypted,
          isPrivate: !!p.is_private,
          createdAt: new Date(p.created_at).getTime(),
          updatedAt: new Date(p.updated_at).getTime(),
          blockIds: blocksByPage[pageId] || [],
        };
      });

      // Actualizar caché local
      this.savePagesLocal(mappedPages);
      this.saveBlocksLocal(mappedBlocks);
      this.notifySync("synced");

      return { pages: mappedPages, blocks: mappedBlocks };
    } catch (err: any) {
      console.warn("Error al sincronizar con Supabase Cloud:", err);
      this.notifySync("error", err?.message);
      return null;
    }
  }

  /**
   * Sincroniza páginas con Supabase en la nube
   */
  public async syncPagesToSupabase(pages: PageItem[]): Promise<void> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes("placeholder-project")) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        this.notifySync("offline");
        return;
      }

      this.notifySync("syncing");

      for (const p of pages) {
        const { error } = await supabase.from("pages").upsert(
          {
            id: p.id,
            title: p.title,
            icon: p.icon,
            is_favorite: p.isFavorite,
            is_encrypted: p.isEncrypted,
            is_private: p.isPrivate,
            created_by: user.id,
            updated_at: new Date(p.updatedAt).toISOString(),
          },
          { onConflict: "id" }
        );

        if (error) {
          console.warn("Error al guardar página en Supabase:", error);
        }
      }

      this.notifySync("synced");
    } catch (err: any) {
      this.notifySync("error", err?.message);
    }
  }

  /**
   * Sincroniza bloques con Supabase en la nube
   */
  public async syncBlocksToSupabase(blocks: Record<string, Block>): Promise<void> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes("placeholder-project")) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      this.notifySync("syncing");

      const blockList = Object.values(blocks);
      for (const b of blockList) {
        const { error } = await supabase.from("blocks").upsert(
          {
            id: b.id,
            page_id: b.parentId || null,
            type: b.type,
            content: b.content,
            checked: b.checked,
            calendar_event_id: b.calendarEventId,
            calendar_event_date: b.calendarEventDate,
            updated_at: new Date(b.updatedAt).toISOString(),
          },
          { onConflict: "id" }
        );

        if (error) {
          console.warn("Error al guardar bloque en Supabase:", error);
        }
      }

      this.notifySync("synced");
    } catch (err: any) {
      this.notifySync("error", err?.message);
    }
  }

  /**
   * Suscribe en tiempo real a cambios en Supabase para colaboración multi-usuario
   */
  public subscribeRealtime(onChange: () => void) {
    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`realtime_${this.userIdentifier}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pages" },
          () => onChange()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "blocks" },
          () => onChange()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  }
}
