"use client";

import React, { useState } from "react";
import { PageItem } from "@/lib/types";
import {
  Calendar,
  Lock,
  Plus,
  Search,
  Star,
  ChevronDown,
  ChevronRight,
  Settings,
  ShieldCheck,
  FileText,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  Bot,
  Shield,
  LogIn,
  LogOut,
  User,
} from "lucide-react";

interface SidebarProps {
  pages: PageItem[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onCreatePage: (isEncrypted?: boolean) => void;
  onOpenNewPageModal?: () => void;
  onDeletePage: (id: string) => void;
  onOpenCalendarModal: () => void;
  onOpenTemplates: () => void;
  onOpenAIModal: () => void;
  googleCalendarLinked: boolean;
  googleEmail?: string;
  userEmail: string;
  isLoggedIn?: boolean;
  userName?: string;
  onLogin?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onCreatePage,
  onOpenNewPageModal,
  onDeletePage,
  onOpenCalendarModal,
  onOpenTemplates,
  onOpenAIModal,
  googleCalendarLinked,
  googleEmail,
  userEmail,
  isLoggedIn,
  userName,
  onLogin,
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showFavorites, setShowFavorites] = useState(true);
  const [showPages, setShowPages] = useState(true);

  const favoritePages = pages.filter((p) => p.isFavorite);
  const normalPages = pages.filter((p) => !p.isFavorite);

  return (
    <aside
      className={`h-screen bg-[#0f1016] text-slate-400 flex flex-col border-r border-white/[0.06] select-none transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Workspace Header */}
      <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-400 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            A
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                AgendAR
                <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/15 text-cyan-300 rounded-full border border-cyan-500/30 font-medium">
                  PRO
                </span>
              </span>
              <span className="text-[11px] text-slate-500 truncate font-mono">{userEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 space-y-1">
        <button
          onClick={onOpenAIModal}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs hover:bg-white/[0.05] hover:text-white transition-all text-left group"
        >
          <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between">
              <span className="font-medium">Asistente IA</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                BYOK
              </span>
            </div>
          )}
        </button>

        <button
          onClick={onOpenTemplates}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs hover:bg-white/[0.05] hover:text-white transition-all text-left group"
        >
          <div className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Layers className="w-3.5 h-3.5" />
          </div>
          {!collapsed && <span className="font-medium">Galería de Plantillas</span>}
        </button>

        <button
          onClick={onOpenCalendarModal}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs hover:bg-white/[0.05] hover:text-white transition-all text-left group"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between">
              <span className="font-medium">Google Calendar</span>
              {googleCalendarLinked ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" title="Sincronizado" />
              ) : (
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-full border border-amber-500/20">Conectar</span>
              )}
            </div>
          )}
        </button>

        <button
          onClick={() => onCreatePage(true)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs hover:bg-white/[0.05] hover:text-white transition-all text-left group"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Lock className="w-3.5 h-3.5" />
          </div>
          {!collapsed && <span className="font-medium">Nueva Bóveda (E2EE)</span>}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Favoritos */}
        {favoritePages.length > 0 && !collapsed && (
          <div>
            <div
              onClick={() => setShowFavorites(!showFavorites)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium tracking-wider text-gray-500 uppercase cursor-pointer hover:text-gray-300"
            >
              {showFavorites ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Favoritos</span>
            </div>
            {showFavorites && (
              <div className="mt-1 space-y-0.5">
                {favoritePages.map((page) => (
                  <PageNavItem
                    key={page.id}
                    page={page}
                    isActive={activePageId === page.id}
                    onSelect={() => onSelectPage(page.id)}
                    onDelete={() => onDeletePage(page.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Todas las Páginas */}
        {!collapsed && (
          <div>
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-medium tracking-wider text-gray-500 uppercase">
              <div
                onClick={() => setShowPages(!showPages)}
                className="flex items-center gap-1 cursor-pointer hover:text-gray-300"
              >
                {showPages ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span>Páginas</span>
              </div>
              <button
                onClick={onOpenNewPageModal || (() => onCreatePage(false))}
                title="Añadir una página (elegir plantilla o en blanco)"
                className="hover:text-[#e3e2e0] p-0.5 hover:bg-[#2c2c2c] rounded transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {showPages && (
              <div className="mt-1 space-y-0.5">
                {pages.map((page) => (
                  <PageNavItem
                    key={page.id}
                    page={page}
                    isActive={activePageId === page.id}
                    onSelect={() => onSelectPage(page.id)}
                    onDelete={() => onDeletePage(page.id)}
                  />
                ))}

                <button
                  onClick={onOpenNewPageModal || (() => onCreatePage(false))}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-gray-400 hover:bg-[#2c2c2c] hover:text-[#e3e2e0] transition text-left mt-1 group"
                >
                  <Plus className="w-3.5 h-3.5 group-hover:text-blue-400 transition" />
                  <span>Añadir una página</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security & Sync Status Bar */}
      <div className="p-3 border-t border-white/[0.06] bg-[#0c0d12]/40 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            {!collapsed && <span className="font-medium text-slate-300">Cifrado Activo</span>}
          </div>
          {!collapsed && googleCalendarLinked && (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25 font-medium">
              G-Calendar OK
            </span>
          )}
        </div>

        {/* User Account Controls */}
        {!collapsed && (
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            {isLoggedIn ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white border border-white/20 flex items-center justify-center text-xs font-bold shadow-sm shadow-blue-500/25">
                    {userName ? userName[0].toUpperCase() : "U"}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-slate-200 truncate">{userName || "Usuario"}</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Sincronizado
                    </span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Cerrar sesión"
                  className="p-1.5 hover:text-rose-400 hover:bg-white/[0.06] rounded-lg text-slate-400 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-600/20 active:scale-[0.98]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar con Gmail</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

interface PageNavItemProps {
  page: PageItem;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const PageNavItem: React.FC<PageNavItemProps> = ({ page, isActive, onSelect, onDelete }) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all duration-150 ${
        isActive
          ? "bg-white/[0.08] text-white font-medium shadow-sm border-l-2 border-cyan-400 pl-2"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <span className="text-sm shrink-0">{page.icon || (page.isEncrypted ? "🔒" : "📄")}</span>
        <span className="truncate">{page.title || "Sin título"}</span>
      </div>

      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
        {page.isPrivate && (
          <span title="Proyecto Privado" className="text-cyan-400 text-[10px] px-1.5 py-0.2 bg-cyan-500/10 rounded border border-cyan-500/20">
            Privado
          </span>
        )}
        {page.isEncrypted && (
          <span title="Bóveda Cifrada" className="text-purple-400 text-[10px] px-1.5 py-0.2 bg-purple-500/10 rounded border border-purple-500/20">
            E2EE
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:text-rose-400 hover:bg-white/[0.08] rounded transition"
          title="Eliminar página"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
