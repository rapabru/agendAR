"use client";

import React, { useState } from "react";
import { Block, BlockType, PageItem } from "@/lib/types";
import {
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Calendar,
  Code,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  Lock,
  Unlock,
  Database,
  ArrowUp,
  ArrowDown,
  Layers,
} from "lucide-react";
import { DatabaseViewComponent } from "../database/DatabaseView";
import { INITIAL_DATABASE, INITIAL_DATABASE_ROWS } from "@/lib/mock-data";
import { TEMPLATE_LIBRARY, TemplateDefinition } from "@/lib/templates";

interface BlockEditorProps {
  page: PageItem;
  blocks: Block[];
  onUpdateTitle: (title: string) => void;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  onAddBlock: (type: BlockType, afterId?: string) => void;
  onDeleteBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: "up" | "down") => void;
  onSyncCalendarBlock: (block: Block) => void;
  isUnlocked: boolean;
  onUnlockVault: () => void;
  onApplyTemplate?: (template: TemplateDefinition) => void;
  onOpenTemplatesModal?: () => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  page,
  blocks,
  onUpdateTitle,
  onUpdateBlock,
  onAddBlock,
  onDeleteBlock,
  onMoveBlock,
  onSyncCalendarBlock,
  isUnlocked,
  onUnlockVault,
  onApplyTemplate,
  onOpenTemplatesModal,
}) => {
  const [activeSlashMenuBlockId, setActiveSlashMenuBlockId] = useState<string | null>(null);

  const isBlankPage =
    blocks.length === 0 ||
    (blocks.length === 1 &&
      blocks[0].type === "paragraph" &&
      (!blocks[0].content || blocks[0].content.trim() === ""));

  // Si la página es cifrada y no está desbloqueada
  if (page.isEncrypted && !isUnlocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#191919] text-[#e3e2e0]">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 border border-purple-500/20">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Bóveda Cifrada (E2EE)</h2>
        <p className="text-sm text-gray-400 max-w-md text-center mb-6">
          Esta nota está protegida con cifrado cliente de extremo a extremo mediante AES-256-GCM.
          Introduce tu clave de desbloqueo para visualizar y editar el contenido.
        </p>
        <button
          onClick={onUnlockVault}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition shadow-lg shadow-purple-600/20"
        >
          <Unlock className="w-4 h-4" />
          <span>Desbloquear Bóveda</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#191919] text-[#e3e2e0] p-8 md:px-20 max-w-5xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-8 group">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl cursor-pointer hover:opacity-80 transition">
            {page.icon || (page.isEncrypted ? "🔒" : "📄")}
          </span>
          {page.isEncrypted && (
            <span className="flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              <Lock className="w-3 h-3" /> Cifrado E2EE Activo
            </span>
          )}
        </div>

        <input
          type="text"
          value={page.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="Sin título"
          className="w-full bg-transparent text-3xl md:text-4xl font-extrabold outline-none text-[#e3e2e0] placeholder-gray-600 tracking-tight"
        />
      </div>

      {/* Starter Template Chooser for New / Empty Pages */}
      {isBlankPage && (
        <div className="my-6 p-5 rounded-2xl bg-[#202020] border border-[#2d2d2d] shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Comenzar con una plantilla predeterminada
              </span>
            </div>
            {onOpenTemplatesModal && (
              <button
                onClick={onOpenTemplatesModal}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ver todas las plantillas →</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {TEMPLATE_LIBRARY.slice(0, 6).map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => onApplyTemplate && onApplyTemplate(tpl)}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#252525] hover:bg-[#2c2c2c] border border-[#333333] hover:border-blue-500/40 text-left transition group shadow-sm"
              >
                <span className="text-2xl shrink-0 group-hover:scale-110 transition">{tpl.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white group-hover:text-blue-400 transition truncate">
                      {tpl.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{tpl.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-3.5 pt-3 border-t border-[#2c2c2c] flex items-center justify-between text-xs text-gray-500">
            <span>O presiona aquí para escribir en una página en blanco</span>
            <button
              onClick={() => onAddBlock("paragraph")}
              className="px-2.5 py-1 rounded bg-[#2a2a2a] hover:bg-[#333333] text-gray-300 hover:text-white transition"
            >
              Lienzo en blanco
            </button>
          </div>
        </div>
      )}

      {/* Block List */}
      <div className="space-y-2">
        {blocks.map((block, index) => (
          <div key={block.id} className="relative group flex items-start gap-1 py-1">
            {/* Action Bar (Drag / Move / Delete) */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 pt-1 -ml-12 shrink-0 transition text-gray-500">
              <button
                onClick={() => onMoveBlock(block.id, "up")}
                disabled={index === 0}
                className="p-1 hover:text-[#e3e2e0] hover:bg-[#2c2c2c] rounded disabled:opacity-30"
                title="Mover arriba"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => onMoveBlock(block.id, "down")}
                disabled={index === blocks.length - 1}
                className="p-1 hover:text-[#e3e2e0] hover:bg-[#2c2c2c] rounded disabled:opacity-30"
                title="Mover abajo"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => setActiveSlashMenuBlockId(activeSlashMenuBlockId === block.id ? null : block.id)}
                className="p-1 hover:text-[#e3e2e0] hover:bg-[#2c2c2c] rounded"
                title="Comandos (/)"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
              </button>
              <button
                onClick={() => onDeleteBlock(block.id)}
                className="p-1 hover:text-red-400 hover:bg-[#2c2c2c] rounded"
                title="Eliminar bloque"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Block Content Renderer */}
            <div className="flex-1 min-w-0">
              {renderBlock(block, onUpdateBlock, onSyncCalendarBlock)}
            </div>

            {/* Slash Menu Popover */}
            {activeSlashMenuBlockId === block.id && (
              <SlashMenu
                onSelect={(type) => {
                  onAddBlock(type, block.id);
                  setActiveSlashMenuBlockId(null);
                }}
                onClose={() => setActiveSlashMenuBlockId(null)}
              />
            )}
          </div>
        ))}

        {/* Empty state or quick add */}
        <div className="pt-4 flex items-center gap-2">
          <button
            onClick={() => onAddBlock("paragraph")}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#e3e2e0] px-3 py-1.5 rounded hover:bg-[#262626] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir bloque (o escribe &apos;/&apos;)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Renderizador de cada bloque específico
 */
function renderBlock(
  block: Block,
  onUpdate: (id: string, updates: Partial<Block>) => void,
  onSyncCalendar: (block: Block) => void
) {
  switch (block.type) {
    case "heading_1":
      return (
        <input
          type="text"
          value={block.content}
          onChange={(e) => onUpdate(block.id, { content: e.target.value })}
          placeholder="Encabezado 1"
          className="w-full bg-transparent text-2xl font-bold text-[#e3e2e0] outline-none tracking-tight"
        />
      );

    case "heading_2":
      return (
        <input
          type="text"
          value={block.content}
          onChange={(e) => onUpdate(block.id, { content: e.target.value })}
          placeholder="Encabezado 2"
          className="w-full bg-transparent text-xl font-semibold text-[#e3e2e0] outline-none"
        />
      );

    case "heading_3":
      return (
        <input
          type="text"
          value={block.content}
          onChange={(e) => onUpdate(block.id, { content: e.target.value })}
          placeholder="Encabezado 3"
          className="w-full bg-transparent text-lg font-medium text-[#e3e2e0] outline-none"
        />
      );

    case "todo":
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!block.checked}
            onChange={(e) => onUpdate(block.id, { checked: e.target.checked })}
            className="w-4 h-4 rounded border-[#3f3f3f] bg-transparent text-blue-500 focus:ring-0 cursor-pointer"
          />
          <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="Por hacer..."
            className={`w-full bg-transparent text-sm outline-none ${
              block.checked ? "line-through text-gray-500" : "text-[#e3e2e0]"
            }`}
          />
        </div>
      );

    case "callout":
      return (
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#242424] border border-[#2f2f2f] text-sm">
          <span className="text-xl select-none">{block.icon || "💡"}</span>
          <textarea
            rows={2}
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="Nota destacada o recordatorio..."
            className="w-full bg-transparent outline-none text-[#e3e2e0] resize-none leading-relaxed"
          />
        </div>
      );

    case "calendar_event":
      return (
        <div className="p-3.5 rounded-lg bg-[#1e2820] border border-emerald-900/40 text-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Google Calendar Evento</span>
            </div>
            <button
              onClick={() => onSyncCalendar(block)}
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition"
              title="Sincronizar con Google Calendar"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{block.calendarEventId ? "Sincronizado" : "Sincronizar"}</span>
            </button>
          </div>
          <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="Nombre del evento / reunión..."
            className="w-full bg-transparent font-medium text-[#e3e2e0] outline-none"
          />
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Fecha y hora:</span>
            <input
              type="datetime-local"
              value={block.calendarEventDate || "2026-10-15T15:00"}
              onChange={(e) => onUpdate(block.id, { calendarEventDate: e.target.value })}
              className="bg-[#262626] text-gray-200 px-2 py-1 rounded border border-[#3a3a3a] outline-none text-xs"
            />
          </div>
        </div>
      );

    case "code":
      return (
        <div className="rounded-lg bg-[#202020] border border-[#2f2f2f] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1 bg-[#282828] text-xs text-gray-400 border-b border-[#2f2f2f]">
            <span className="uppercase font-mono text-[10px]">{block.language || "code"}</span>
          </div>
          <textarea
            rows={4}
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="// Código fuente..."
            className="w-full p-3 bg-transparent font-mono text-xs text-emerald-400 outline-none resize-none leading-relaxed"
          />
        </div>
      );

    case "database":
      return (
        <div className="my-4">
          <DatabaseViewComponent database={INITIAL_DATABASE} initialRows={INITIAL_DATABASE_ROWS} />
        </div>
      );

    case "paragraph":
    default:
      return (
        <textarea
          rows={1}
          value={block.content}
          onChange={(e) => {
            onUpdate(block.id, { content: e.target.value });
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          placeholder="Escribe texto o presiona '/' para comandos..."
          className="w-full bg-transparent text-sm text-[#e3e2e0] outline-none resize-none leading-relaxed overflow-hidden"
        />
      );
  }
}

/**
 * Menú contextual Slash (/)
 */
interface SlashMenuProps {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

const SlashMenu: React.FC<SlashMenuProps> = ({ onSelect, onClose }) => {
  const commands = [
    { type: "paragraph" as BlockType, title: "Texto", desc: "Párrafo simple de texto", icon: <Type className="w-4 h-4 text-gray-400" /> },
    { type: "heading_1" as BlockType, title: "Título 1", desc: "Encabezado grande de sección", icon: <Heading1 className="w-4 h-4 text-blue-400" /> },
    { type: "heading_2" as BlockType, title: "Título 2", desc: "Encabezado mediano", icon: <Heading2 className="w-4 h-4 text-blue-400" /> },
    { type: "todo" as BlockType, title: "Tarea (To-Do)", desc: "Casilla verificable", icon: <CheckSquare className="w-4 h-4 text-emerald-400" /> },
    { type: "calendar_event" as BlockType, title: "Google Calendar Event", desc: "Sincroniza con tu calendario Google", icon: <Calendar className="w-4 h-4 text-emerald-400" /> },
    { type: "callout" as BlockType, title: "Callout", desc: "Destaca texto con icono", icon: <AlertCircle className="w-4 h-4 text-amber-400" /> },
    { type: "code" as BlockType, title: "Código", desc: "Fragmento con sintaxis técnica", icon: <Code className="w-4 h-4 text-purple-400" /> },
    { type: "database" as BlockType, title: "Base de Datos Embebida", desc: "Vistas Tabla, Kanban y Calendario", icon: <Database className="w-4 h-4 text-cyan-400" /> },
  ];

  return (
    <div className="absolute top-8 left-0 z-50 w-72 bg-[#252525] border border-[#333333] rounded-lg shadow-2xl p-1.5 space-y-0.5 backdrop-blur-md">
      <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
        Comandos Básicos
      </div>
      {commands.map((cmd) => (
        <button
          key={cmd.type}
          onClick={() => onSelect(cmd.type)}
          className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-[#333333] text-left transition group"
        >
          <div className="p-1 rounded bg-[#1e1e1e] border border-[#2f2f2f]">{cmd.icon}</div>
          <div>
            <div className="text-xs font-medium text-[#e3e2e0] group-hover:text-blue-400">{cmd.title}</div>
            <div className="text-[10px] text-gray-400">{cmd.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
};
