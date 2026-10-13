"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { GoogleCalendarModal } from "@/components/calendar/GoogleCalendarModal";
import { VaultUnlockModal } from "@/components/security/VaultUnlockModal";
import { TemplatesModal } from "@/components/templates/TemplatesModal";
import { AIAssistantModal } from "@/components/ai/AIAssistantModal";
import { ShareModal } from "@/components/sharing/ShareModal";
import { INITIAL_PAGES, INITIAL_BLOCKS } from "@/lib/mock-data";
import { Block, BlockType, PageItem } from "@/lib/types";
import { TemplateDefinition } from "@/lib/templates";
import { GoogleCalendarClient, blockToCalendarEvent } from "@/lib/google-calendar";
import { getActiveUser, logoutUser, AuthUser, setLocalGmailSession } from "@/lib/supabase/auth";
import { UserStorageManager } from "@/lib/storage";
import {
  Calendar,
  Lock,
  Star,
  CheckCircle,
  Share2,
  Clock,
  Sparkles,
  Layers,
  Users,
  Shield,
  Bot,
  LogIn,
  LogOut,
  User,
} from "lucide-react";

export default function AgendARApp() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [storage, setStorage] = useState<UserStorageManager>(new UserStorageManager("default"));

  const [pages, setPages] = useState<PageItem[]>(INITIAL_PAGES);
  const [activePageId, setActivePageId] = useState<string>("welcome-page");
  const [blocks, setBlocks] = useState<Record<string, Block>>(INITIAL_BLOCKS);

  // Modals State
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Google Calendar State
  const [isGoogleLinked, setIsGoogleLinked] = useState(true);
  const [googleEmail, setGoogleEmail] = useState("usuario.agendar@gmail.com");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Security / Vault State
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [unlockedVaults, setUnlockedVaults] = useState<Record<string, boolean>>({});

  // Cargar usuario y datos aislados por cuenta al montar
  useEffect(() => {
    async function initUserSession() {
      const user = await getActiveUser();
      const userIdentifier = user?.email || "default_space";
      const userStorage = new UserStorageManager(userIdentifier);

      setCurrentUser(user);
      setStorage(userStorage);

      const loadedPages = userStorage.loadPages();
      const loadedBlocks = userStorage.loadBlocks();

      setPages(loadedPages);
      setBlocks(loadedBlocks);

      if (loadedPages.length > 0) {
        setActivePageId(loadedPages[0].id);
      }
      if (user?.email) {
        setGoogleEmail(user.email);
        setIsGoogleLinked(true);
      }
    }

    initUserSession();
  }, []);

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
    const updatedPages = pages.map((p) =>
      p.id === activePageId ? { ...p, title: newTitle, updatedAt: Date.now() } : p
    );
    setPages(updatedPages);
    storage.savePages(updatedPages);
  };

  // Toggle de favorito
  const handleToggleFavorite = () => {
    const updatedPages = pages.map((p) =>
      p.id === activePageId ? { ...p, isFavorite: !p.isFavorite } : p
    );
    setPages(updatedPages);
    storage.savePages(updatedPages);
  };

  // Handler para actualizar bloque
  const handleUpdateBlock = (blockId: string, updates: Partial<Block>) => {
    const updatedBlocks = {
      ...blocks,
      [blockId]: {
        ...blocks[blockId],
        ...updates,
        updatedAt: Date.now(),
      },
    };
    setBlocks(updatedBlocks);
    storage.saveBlocks(updatedBlocks);
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

    const updatedBlocks = { ...blocks, [newId]: newBlock };
    setBlocks(updatedBlocks);
    storage.saveBlocks(updatedBlocks);

    const updatedPages = pages.map((page) => {
      if (page.id !== activePageId) return page;
      const currentIds = [...page.blockIds];
      if (afterBlockId) {
        const index = currentIds.indexOf(afterBlockId);
        currentIds.splice(index + 1, 0, newId);
      } else {
        currentIds.push(newId);
      }
      return { ...page, blockIds: currentIds, updatedAt: Date.now() };
    });

    setPages(updatedPages);
    storage.savePages(updatedPages);
  };

  // Handler para eliminar bloque
  const handleDeleteBlock = (blockId: string) => {
    const updatedPages = pages.map((page) =>
      page.id === activePageId
        ? {
            ...page,
            blockIds: page.blockIds.filter((id) => id !== blockId),
            updatedAt: Date.now(),
          }
        : page
    );
    setPages(updatedPages);
    storage.savePages(updatedPages);
  };

  // Handler para reordenar bloques
  const handleMoveBlock = (blockId: string, direction: "up" | "down") => {
    const updatedPages = pages.map((page) => {
      if (page.id !== activePageId) return page;
      const ids = [...page.blockIds];
      const idx = ids.indexOf(blockId);
      if (idx < 0) return page;

      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= ids.length) return page;

      const temp = ids[idx];
      ids[idx] = ids[targetIdx];
      ids[targetIdx] = temp;

      return { ...page, blockIds: ids };
    });

    setPages(updatedPages);
    storage.savePages(updatedPages);
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

    const updatedBlocks = { ...blocks, [initialBlockId]: newBlock };
    const updatedPages = [...pages, newPage];

    setBlocks(updatedBlocks);
    setPages(updatedPages);
    setActivePageId(newPageId);

    storage.saveBlocks(updatedBlocks);
    storage.savePages(updatedPages);
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
    storage.savePages(remaining);
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

  // Handler para seleccionar plantilla
  const handleSelectTemplate = (template: TemplateDefinition) => {
    const newPageId = `page-tpl-${Date.now()}`;
    const createdBlockIds: string[] = [];
    const newBlocksObj: Record<string, Block> = {};

    template.blocks.forEach((blk, idx) => {
      const bId = `b-tpl-${Date.now()}-${idx}`;
      createdBlockIds.push(bId);
      newBlocksObj[bId] = {
        ...blk,
        id: bId,
        parentId: newPageId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    });

    const newPage: PageItem = {
      id: newPageId,
      title: template.name,
      icon: template.icon,
      isFavorite: false,
      isEncrypted: !!template.isEncrypted,
      isPrivate: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      blockIds: createdBlockIds,
    };

    const updatedBlocks = { ...blocks, ...newBlocksObj };
    const updatedPages = [...pages, newPage];

    setBlocks(updatedBlocks);
    setPages(updatedPages);
    setActivePageId(newPageId);

    storage.saveBlocks(updatedBlocks);
    storage.savePages(updatedPages);
    showToast(`Plantilla "${template.name}" creada con éxito.`);
  };

  // Handler para aplicar bloques generados por IA
  const handleApplyAIGeneratedBlocks = (
    title: string,
    genBlocks: Omit<Block, "id" | "createdAt" | "updatedAt">[]
  ) => {
    const newPageId = `page-ai-${Date.now()}`;
    const createdBlockIds: string[] = [];
    const newBlocksObj: Record<string, Block> = {};

    genBlocks.forEach((blk, idx) => {
      const bId = `b-ai-${Date.now()}-${idx}`;
      createdBlockIds.push(bId);
      newBlocksObj[bId] = {
        ...blk,
        id: bId,
        parentId: newPageId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    });

    const newPage: PageItem = {
      id: newPageId,
      title: title.slice(0, 50),
      icon: "✨",
      isFavorite: false,
      isEncrypted: false,
      isPrivate: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      blockIds: createdBlockIds,
    };

    const updatedBlocks = { ...blocks, ...newBlocksObj };
    const updatedPages = [...pages, newPage];

    setBlocks(updatedBlocks);
    setPages(updatedPages);
    setActivePageId(newPageId);

    storage.saveBlocks(updatedBlocks);
    storage.savePages(updatedPages);
    showToast("Página generada con el Asistente IA.");
  };

  // Handler para alternar privacidad
  const handleTogglePrivate = (isPrivate: boolean) => {
    const updatedPages = pages.map((p) =>
      p.id === activePageId ? { ...p, isPrivate, updatedAt: Date.now() } : p
    );
    setPages(updatedPages);
    storage.savePages(updatedPages);
    showToast(isPrivate ? "Página marcada como Proyecto Privado" : "Página compartida con el Workspace");
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
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        googleCalendarLinked={isGoogleLinked}
        googleEmail={googleEmail}
        userEmail={currentUser?.email || "Sin sesión (Modo Invitado)"}
        userName={currentUser?.name}
        isLoggedIn={!!currentUser}
        onLogin={() => router.push("/login")}
        onLogout={async () => {
          await logoutUser();
          setCurrentUser(null);
          showToast("Sesión cerrada.");
          window.location.reload();
        }}
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

            {activePage?.isPrivate && (
              <span className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                <Shield className="w-3 h-3" /> Privado
              </span>
            )}

            {activePage?.isEncrypted && (
              <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                <Lock className="w-3 h-3" /> E2EE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 border border-purple-500/30 transition font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Asistente IA</span>
            </button>

            <button
              onClick={() => setIsTemplatesModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#252525] hover:bg-[#2c2c2c] text-blue-400 border border-[#333333] transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Plantillas</span>
            </button>

            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#252525] hover:bg-[#2c2c2c] text-emerald-400 border border-[#333333] transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isGoogleLinked ? "Google Calendar" : "Conectar Calendar"}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#252525] hover:bg-[#2c2c2c] text-[#e3e2e0] border border-[#333333] transition"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Compartir</span>
            </button>

            {/* User Account Button */}
            {currentUser ? (
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#252525] hover:bg-[#2c2c2c] text-gray-200 border border-[#333333] transition"
                title="Cuenta activa - Clic para cambiar"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="truncate max-w-[120px] font-mono text-[11px]">{currentUser.email}</span>
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar con Gmail</span>
              </button>
            )}

            <span className="text-[11px] text-gray-500 hidden lg:flex items-center gap-1">
              <Clock className="w-3 h-3" /> Guardado
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

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onApplyGeneratedBlocks={handleApplyAIGeneratedBlocks}
      />

      {/* Share / Private Project Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        page={activePage}
        onTogglePrivate={handleTogglePrivate}
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
