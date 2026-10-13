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
} from "lucide-react";

interface SidebarProps {
  pages: PageItem[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onCreatePage: (isEncrypted?: boolean) => void;
  onDeletePage: (id: string) => void;
  onOpenCalendarModal: () => void;
  googleCalendarLinked: boolean;
  googleEmail?: string;
  userEmail: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onOpenCalendarModal,
  googleCalendarLinked,
  googleEmail,
  userEmail,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showFavorites, setShowFavorites] = useState(true);
  const [showPages, setShowPages] = useState(true);

  const favoritePages = pages.filter((p) => p.isFavorite);
  const normalPages = pages.filter((p) => !p.isFavorite);

  return (
    <aside
      className={`h-screen bg-[#202020] text-[#9b9a97] flex flex-col border-r border-[#2f2f2f] select-none transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Workspace Header */}
      <div className="p-3 border-b border-[#2f2f2f] flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/30">
            A
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold text-[#e3e2e0] truncate flex items-center gap-1.5">
                AgendAR
                <span className="text-[10px] px-1 py-0.2 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                  PRO
                </span>
              </span>
              <span className="text-[11px] text-gray-500 truncate">{userEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 space-y-1">
        <button
          onClick={onOpenCalendarModal}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs hover:bg-[#2c2c2c] hover:text-[#e3e2e0] transition text-left group"
        >
          <Calendar className="w-4 h-4 text-emerald-400" />
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between">
              <span>Google Calendar</span>
              {googleCalendarLinked ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sincronizado" />
              ) : (
                <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-1 rounded">Conectar</span>
              )}
            </div>
          )}
        </button>

        <button
          onClick={() => onCreatePage(true)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs hover:bg-[#2c2c2c] hover:text-[#e3e2e0] transition text-left"
        >
          <Lock className="w-4 h-4 text-purple-400" />
          {!collapsed && <span>Nueva Bóveda (E2EE)</span>}
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
                onClick={() => onCreatePage(false)}
                title="Añadir una página"
                className="hover:text-[#e3e2e0] p-0.5 hover:bg-[#2c2c2c] rounded"
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security & Sync Status Bar */}
      <div className="p-3 border-t border-[#2f2f2f] text-xs">
        <div className="flex items-center justify-between text-gray-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            {!collapsed && <span>Cifrado Activo</span>}
          </div>
          {!collapsed && googleCalendarLinked && (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              G-Calendar OK
            </span>
          )}
        </div>
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
      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition ${
        isActive
          ? "bg-[#2c2c2c] text-[#e3e2e0] font-medium"
          : "hover:bg-[#262626] hover:text-[#e3e2e0] text-[#9b9a97]"
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <span className="text-sm shrink-0">{page.icon || (page.isEncrypted ? "🔒" : "📄")}</span>
        <span className="truncate">{page.title || "Sin título"}</span>
      </div>

      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition">
        {page.isEncrypted && (
          <span title="Bóveda Cifrada" className="text-purple-400 text-[10px]">
            E2EE
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:text-red-400 hover:bg-[#333333] rounded"
          title="Eliminar página"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
