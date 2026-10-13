"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { GoogleCalendarModal } from "@/components/calendar/GoogleCalendarModal";
import { VaultUnlockModal } from "@/components/security/VaultUnlockModal";
import { INITIAL_PAGES, INITIAL_BLOCKS } from "@/lib/mock-data";
import { Block, BlockType, PageItem } from "@/lib/types";
import { GoogleCalendarClient, blockToCalendarEvent } from "@/lib/google-calendar";
import {
  Calendar,
  Lock,
  Star,
  CheckCircle,
  Share2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function AgendARApp() {
  const [pages, setPages] = useState<PageItem[]>(INITIAL_PAGES);
  const [activePageId, setActivePageId] = useState<string>("welcome-page");
  const [blocks, setBlocks] = useState<Record<string, Block>>(INITIAL_BLOCKS);

  // Google Calendar State
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isGoogleLinked, setIsGoogleLinked] = useState(true);
  const [googleEmail, setGoogleEmail] = useState("usuario.agendar@gmail.com");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Security / Vault State
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [unlockedVaults, setUnlockedVaults] = useState<Record<string, boolean>>({});

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];
  const activeBlocks = (activePage?.blockIds || [])
    .map((id) => blocks[id])
    .filter(Boolean);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handler para actualizar título
  const handleUpdateTitle = (newTitle: string) => {
    setPages(
      pages.map((p) => (p.id === activePageId ? { ...p, title: newTitle, updatedAt: Date.now() } : p))
    );
  };

  // Toggle de favorito
  const handleToggleFavorite = () => {
    setPages(
      pages.map((p) =>
        p.id === activePageId ? { ...p, isFavorite: !p.isFavorite } : p
      )
    );
  };

  // Handler para actualizar bloque
  const handleUpdateBlock = (blockId: string, updates: Partial<Block>) => {
    setBlocks((prev) => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        ...updates,
        updatedAt: Date.now(),
      },
    }));
  };

  // Handler para añadir bloque
  const handleAddBlock = (type: BlockType, afterBlockId?: string) => {
    const newId = `b-${Date.now()}`;
    const newBlock: Block = {
      id: newId,
      type,
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      parentId: activePageId,
    };

    setBlocks((prev) => ({ ...prev, [newId]: newBlock }));

    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== activePageId) return page;
        const currentIds = [...page.blockIds];
        if (afterBlockId) {
          const index = currentIds.indexOf(afterBlockId);
          currentIds.splice(index + 1, 0, newId);
        } else {
          currentIds.push(newId);
        }
        return { ...page, blockIds: currentIds, updatedAt: Date.now() };
      })
    );
  };

  // Handler para eliminar bloque
  const handleDeleteBlock = (blockId: string) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === activePageId
          ? {
              ...page,
              blockIds: page.blockIds.filter((id) => id !== blockId),
              updatedAt: Date.now(),
            }
          : page
      )
    );
  };

  // Handler para reordenar bloques
  const handleMoveBlock = (blockId: string, direction: "up" | "down") => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== activePageId) return page;
        const ids = [...page.blockIds];
        const idx = ids.indexOf(blockId);
        if (idx < 0) return page;

        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= ids.length) return page;

        // Intercambiar
        const temp = ids[idx];
        ids[idx] = ids[targetIdx];
        ids[targetIdx] = temp;

        return { ...page, blockIds: ids };
      })
    );
  };

  // Handler para crear nueva página
  const handleCreatePage = (isEncrypted: boolean = false) => {
    const newPageId = `page-${Date.now()}`;
    const initialBlockId = `b-init-${Date.now()}`;

    const newBlock: Block = {
      id: initialBlockId,
      type: "paragraph",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const newPage: PageItem = {
      id: newPageId,
      title: isEncrypted ? "Bóveda Nueva" : "Página Nueva",
      icon: isEncrypted ? "🔒" : "📄",
      isFavorite: false,
      isEncrypted,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      blockIds: [initialBlockId],
    };

    setBlocks((prev) => ({ ...prev, [initialBlockId]: newBlock }));
    setPages((prev) => [...prev, newPage]);
    setActivePageId(newPageId);
    showToast(isEncrypted ? "Bóveda cifrada creada con éxito" : "Página creada");
  };

  // Handler para eliminar página
  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) {
      showToast("Debes mantener al menos una página en el espacio de trabajo.");
      return;
    }
    const remaining = pages.filter((p) => p.id !== pageId);
    setPages(remaining);
    if (activePageId === pageId) {
      setActivePageId(remaining[0].id);
    }
    showToast("Página eliminada.");
  };

  // Sincronizar bloque con Google Calendar
  const handleSyncCalendarBlock = async (block: Block) => {
    if (!isGoogleLinked) {
      setIsCalendarModalOpen(true);
      return;
    }

    const client = new GoogleCalendarClient(true, googleEmail);
    const event = blockToCalendarEvent(
      block.id,
      block.content,
      block.calendarEventDate || new Date().toISOString()
    );

    const result = await client.syncEvent(event);
    if (result.success) {
      handleUpdateBlock(block.id, { calendarEventId: result.eventId });
      showToast(`¡Evento sincronizado con Google Calendar (${googleEmail})!`);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#191919]">
      {/* Sidebar */}
      <Sidebar
        pages={pages}
        activePageId={activePageId}
        onSelectPage={setActivePageId}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
        onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
        googleCalendarLinked={isGoogleLinked}
        googleEmail={googleEmail}
        userEmail="usuario@agendar.app"
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-12 border-b border-[#2f2f2f] px-6 flex items-center justify-between text-xs text-[#9b9a97] bg-[#191919]/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span>{activePage?.icon || "📄"}</span>
            <span className="font-medium text-[#e3e2e0] truncate max-w-xs">
              {activePage?.title || "Sin título"}
            </span>

            <button
              onClick={handleToggleFavorite}
              className={`p-1 rounded hover:bg-[#2c2c2c] transition ${
                activePage?.isFavorite ? "text-amber-400" : "text-gray-500 hover:text-gray-300"
              }`}
              title={activePage?.isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>

            {activePage?.isEncrypted && (
              <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                <Lock className="w-3 h-3" /> E2EE
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#252525] hover:bg-[#2c2c2c] text-emerald-400 border border-[#333333] transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isGoogleLinked ? "Google Calendar" : "Conectar Calendar"}</span>
            </button>

            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Editado hace un momento
            </span>
          </div>
        </header>

        {/* Dynamic Block Editor */}
        <BlockEditor
          page={activePage}
          blocks={activeBlocks}
          onUpdateTitle={handleUpdateTitle}
          onUpdateBlock={handleUpdateBlock}
          onAddBlock={handleAddBlock}
          onDeleteBlock={handleDeleteBlock}
          onMoveBlock={handleMoveBlock}
          onSyncCalendarBlock={handleSyncCalendarBlock}
          isUnlocked={!!unlockedVaults[activePage.id]}
          onUnlockVault={() => setIsVaultModalOpen(true)}
        />
      </main>

      {/* Google Calendar Modal */}
      <GoogleCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        isLinked={isGoogleLinked}
        userEmail={googleEmail}
        onLinkAccount={(email) => {
          setIsGoogleLinked(true);
          setGoogleEmail(email);
        }}
        onUnlinkAccount={() => setIsGoogleLinked(false)}
      />

      {/* Vault Decryption Modal */}
      <VaultUnlockModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        onUnlockSuccess={() => {
          setUnlockedVaults((prev) => ({ ...prev, [activePage.id]: true }));
          showToast("Bóveda desbloqueada con éxito (Claves derivadas)");
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#252525] border border-blue-500/40 text-blue-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
