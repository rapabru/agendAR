"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { GoogleCalendarModal } from "@/components/calendar/GoogleCalendarModal";
import { VaultUnlockModal } from "@/components/security/VaultUnlockModal";
import { TemplatesModal } from "@/components/templates/TemplatesModal";
import { NewPageModal } from "@/components/pages/NewPageModal";
import { AIAssistantModal } from "@/components/ai/AIAssistantModal";
import { ShareModal } from "@/components/sharing/ShareModal";
import { INITIAL_PAGES, INITIAL_BLOCKS } from "@/lib/mock-data";
import { Block, BlockType, PageItem } from "@/lib/types";
import { TemplateDefinition } from "@/lib/templates";
import { GoogleCalendarClient, blockToCalendarEvent } from "@/lib/google-calendar";
import { getActiveUser, logoutUser, AuthUser } from "@/lib/supabase/auth";
import { UserStorageManager, SyncState } from "@/lib/storage";
import { isEncryptedContent, decryptBlockContent, createVaultCanary } from "@/lib/crypto";
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
  Cloud,
  RefreshCw,
  HardDrive,
} from "lucide-react";

export default function AgendARApp() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [storage, setStorage] = useState<UserStorageManager>(new UserStorageManager("default"));

  const [pages, setPages] = useState<PageItem[]>(INITIAL_PAGES);
  const [activePageId, setActivePageId] = useState<string>("welcome-page");
  const [blocks, setBlocks] = useState<Record<string, Block>>(INITIAL_BLOCKS);

  // Security / Vault state
  const [vaultPassphrases, setVaultPassphrases] = useState<Record<string, string>>({});

  // Sync state with Supabase Cloud
  const [syncState, setSyncState] = useState<SyncState>({
    status: "offline",
    lastSyncedAt: null,
  });

  // Modals State
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
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
    let unsubscribeRealtime: (() => void) | undefined;

    async function initUserSession() {
      const user = await getActiveUser();
      const userIdentifier = user?.email || "default_space";
      const userStorage = new UserStorageManager(userIdentifier, (newSync) => {
        setSyncState(newSync);
      });

      setCurrentUser(user);
      setStorage(userStorage);

      // Carga inmediata local (sin delay)
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

        // Hidratar con Supabase Cloud en segundo plano
        userStorage.fetchRemoteData().then((remoteData) => {
          if (remoteData) {
            setPages(remoteData.pages);
            setBlocks(remoteData.blocks);
            if (
              remoteData.pages.length > 0 &&
              !remoteData.pages.some((p) => p.id === activePageId)
            ) {
              setActivePageId(remoteData.pages[0].id);
            }
          }
        });

        // Suscripción en tiempo real a colaboraciones
        unsubscribeRealtime = userStorage.subscribeRealtime(async () => {
          const refreshed = await userStorage.fetchRemoteData();
          if (refreshed) {
            setPages(refreshed.pages);
            setBlocks(refreshed.blocks);
          }
        });
      }
    }

    initUserSession();

    return () => {
      if (unsubscribeRealtime) unsubscribeRealtime();
    };
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
    const newId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `b-${Date.now()}`;

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
    storage.deleteBlock(blockId);
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

  // Handler para desbloqueo criptográfico real de bóvedas
  const handleUnlockVaultSuccess = async (passphrase: string) => {
    setUnlockedVaults((prev) => ({ ...prev, [activePage.id]: true }));
    setVaultPassphrases((prev) => ({ ...prev, [activePage.id]: passphrase }));

    const updatedBlocks = { ...blocks };
    let hasDecrypted = false;

    for (const bId of activePage.blockIds) {
      const b = updatedBlocks[bId];
      if (b && isEncryptedContent(b.content)) {
        try {
          const plain = await decryptBlockContent(b.content, passphrase);
          updatedBlocks[bId] = { ...b, content: plain };
          hasDecrypted = true;
        } catch (err) {
          console.warn("Fallo al descifrar bloque:", bId, err);
        }
      }
    }

    if (hasDecrypted) {
      setBlocks(updatedBlocks);
    }
    showToast("Bóveda desbloqueada con éxito (AES-256 verificado)");
  };

  // Handler para crear nueva página
  const handleCreatePage = async (isEncrypted: boolean = false) => {
    const newPageId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `page-${Date.now()}`;
    const initialBlockId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `b-init-${Date.now()}`;

    let canary: string | undefined = undefined;
    if (isEncrypted) {
      canary = await createVaultCanary("agendar2026");
    }

    const newBlock: Block = {
      id: initialBlockId,
      type: "paragraph",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      parentId: newPageId,
    };

    const newPage: PageItem = {
      id: newPageId,
      title: isEncrypted ? "Bóveda Nueva" : "Página Nueva",
      icon: isEncrypted ? "🔒" : "📄",
      isFavorite: false,
      isEncrypted,
      encryptionSalt: canary,
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
    showToast(isEncrypted ? "Bóveda cifrada creada con éxito (AES-256)" : "Página creada");
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
    storage.deletePage(pageId);
    if (activePageId === pageId) {
      setActivePageId(remaining[0].id);
    }
    showToast("Página eliminada.");
  };

  // Sincronizar bloque con Google Calendar
  const handleSyncCalendarBlock = async (block: Block) => {
    if (!block || !block.calendarEventDate) return;

    try {
      const gcalClient = new GoogleCalendarClient();
      const eventPayload = blockToCalendarEvent(block);
      const res = await gcalClient.createEvent(eventPayload);

      if (res.success && res.event) {
        handleUpdateBlock(block.id, { calendarEventId: res.event.id });
        showToast("¡Evento sincronizado con Google Calendar!");
      }
    } catch {
      showToast("Error al sincronizar con Google Calendar");
    }
  };

  // Aplicar plantilla predefinida (en nueva página o en la actual si se especifica)
  const handleSelectTemplate = (template: TemplateDefinition, targetPageId?: string) => {
    const pageIdToUse =
      targetPageId ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `tmpl-${Date.now()}`);

    const isTargetingCurrent = !!targetPageId;
    const newBlockIds: string[] = [];
    const newBlocksMap: Record<string, Block> = {};

    template.blocks.forEach((item, idx) => {
      const bId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `b-tmpl-${Date.now()}-${idx}`;
      newBlockIds.push(bId);
      newBlocksMap[bId] = {
        id: bId,
        type: item.type,
        content: item.content,
        checked: item.checked,
        icon: item.icon,
        language: item.language,
        calendarEventDate: item.calendarEventDate,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        parentId: pageIdToUse,
      };
    });

    if (isTargetingCurrent) {
      const updatedPages = pages.map((p) =>
        p.id === pageIdToUse
          ? {
              ...p,
              title: template.name,
              icon: template.icon,
              isEncrypted: !!template.isEncrypted,
              blockIds: newBlockIds,
              updatedAt: Date.now(),
            }
          : p
      );
      const updatedBlocks = { ...blocks, ...newBlocksMap };
      setBlocks(updatedBlocks);
      setPages(updatedPages);
      storage.saveBlocks(updatedBlocks);
      storage.savePages(updatedPages);
      showToast(`Plantilla "${template.name}" aplicada con éxito.`);
    } else {
      const newPage: PageItem = {
        id: pageIdToUse,
        title: template.name,
        icon: template.icon,
        isFavorite: false,
        isEncrypted: !!template.isEncrypted,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        blockIds: newBlockIds,
      };

      const updatedBlocks = { ...blocks, ...newBlocksMap };
      const updatedPages = [...pages, newPage];

      setBlocks(updatedBlocks);
      setPages(updatedPages);
      setActivePageId(pageIdToUse);

      storage.saveBlocks(updatedBlocks);
      storage.savePages(updatedPages);
      showToast(`Plantilla "${template.name}" cargada con éxito.`);
    }
  };

  // Aplicar bloques generados por el Asistente IA
  const handleApplyAIGeneratedBlocks = (
    suggestedTitle: string,
    generatedBlocks: Omit<Block, "id" | "createdAt" | "updatedAt">[]
  ) => {
    const newPageId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `ai-${Date.now()}`;
    const newBlockIds: string[] = [];
    const newBlocksMap: Record<string, Block> = {};

    generatedBlocks.forEach((item, idx) => {
      const bId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `b-ai-${Date.now()}-${idx}`;
      newBlockIds.push(bId);
      newBlocksMap[bId] = {
        id: bId,
        type: item.type,
        content: item.content,
        icon: item.icon,
        checked: item.checked,
        language: item.language,
        calendarEventDate: item.calendarEventDate,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        parentId: newPageId,
      };
    });

    const newPage: PageItem = {
      id: newPageId,
      title: suggestedTitle || "Página Asistida por IA",
      icon: "✨",
      isFavorite: false,
      isEncrypted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      blockIds: newBlockIds,
    };

    const updatedBlocks = { ...blocks, ...newBlocksMap };
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
        onOpenNewPageModal={() => setIsNewPageModalOpen(true)}
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
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0c0d12]">
        {/* Top Navbar */}
        <header className="h-14 border-b border-white/[0.06] px-6 flex items-center justify-between text-xs text-slate-400 bg-[#0c0d12]/75 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{activePage?.icon || "📄"}</span>
            <span className="font-semibold text-white tracking-tight truncate max-w-xs text-sm">
              {activePage?.title || "Sin título"}
            </span>

            <button
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors ${
                activePage?.isFavorite ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
              }`}
              title={activePage?.isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>

            {activePage?.isPrivate && (
              <span className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/25 font-medium">
                <Shield className="w-3 h-3" /> Privado
              </span>
            )}

            {activePage?.isEncrypted && (
              <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/25 font-medium">
                <Lock className="w-3 h-3" /> E2EE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sync Cloud Indicator Badge */}
            {syncState.status === "synced" && (
              <span
                className="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25 font-medium shadow-sm"
                title="Sincronizado y respaldado en Supabase Cloud"
              >
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nube Supabase OK</span>
              </span>
            )}
            {syncState.status === "syncing" && (
              <span
                className="hidden md:flex items-center gap-1.5 text-[11px] text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/25 animate-pulse font-medium"
                title="Guardando cambios en Supabase..."
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Guardando...</span>
              </span>
            )}
            {syncState.status === "error" && (
              <span
                className="hidden md:flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25 font-medium"
                title={syncState.errorMessage || "Copia local preservada"}
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span>Caché Local</span>
              </span>
            )}

            <button
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-purple-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 text-purple-200 border border-purple-500/30 hover:border-purple-400/50 transition-all font-semibold shadow-sm text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Asistente IA</span>
            </button>

            <button
              onClick={() => setIsTemplatesModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-cyan-400 border border-white/[0.08] hover:border-cyan-500/30 transition-all font-medium text-xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Plantillas</span>
            </button>

            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-emerald-400 border border-white/[0.08] hover:border-emerald-500/30 transition-all font-medium text-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isGoogleLinked ? "Google Calendar" : "Conectar Calendar"}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] hover:border-white/20 transition-all font-medium text-xs"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Compartir</span>
            </button>

            {/* User Account Button */}
            {currentUser ? (
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] hover:border-white/20 transition-all text-xs"
                title="Cuenta activa - Clic para cambiar"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="truncate max-w-[120px] font-mono text-[11px] text-slate-300">{currentUser.email}</span>
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-md shadow-blue-600/25 active:scale-95 text-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar con Gmail</span>
              </button>
            )}

            <span className="text-[11px] text-slate-500 hidden xl:flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-slate-500" /> Guardado
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
          onApplyTemplate={(tpl) => handleSelectTemplate(tpl, activePage.id)}
          onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
        />
      </main>

      {/* New Page & Template Chooser Modal */}
      <NewPageModal
        isOpen={isNewPageModalOpen}
        onClose={() => setIsNewPageModalOpen(false)}
        onCreateBlankPage={(isEncrypted) => handleCreatePage(isEncrypted)}
        onSelectTemplate={(tpl) => handleSelectTemplate(tpl)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenTemplatesGallery={() => setIsTemplatesModalOpen(true)}
      />

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
        page={activePage}
        onUnlockSuccess={handleUnlockVaultSuccess}
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
