"use client";

import React, { useState } from "react";
import { TEMPLATE_LIBRARY, TemplateDefinition } from "@/lib/templates";
import {
  X,
  FileText,
  Lock,
  Sparkles,
  Layers,
  ArrowRight,
  Plus,
  CheckCircle2,
} from "lucide-react";

interface NewPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBlankPage: (isEncrypted?: boolean) => void;
  onSelectTemplate: (template: TemplateDefinition) => void;
  onOpenAIModal?: () => void;
  onOpenTemplatesGallery?: () => void;
}

export const NewPageModal: React.FC<NewPageModalProps> = ({
  isOpen,
  onClose,
  onCreateBlankPage,
  onSelectTemplate,
  onOpenAIModal,
  onOpenTemplatesGallery,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>("Todas");

  if (!isOpen) return null;

  const categories = ["Todas", "Productividad", "Desarrollo", "Gestión", "Seguridad"];

  const filteredTemplates =
    filterCategory === "Todas"
      ? TEMPLATE_LIBRARY
      : TEMPLATE_LIBRARY.filter((t) => t.category === filterCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-[#202020] border border-[#2f2f2f] text-[#e3e2e0] p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2c2c2c] transition"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Nueva Página</h3>
            <p className="text-xs text-gray-400">
              Comienza desde un lienzo en blanco o acelera tu flujo con una plantilla predeterminada
            </p>
          </div>
        </div>

        {/* Quick Launch Cards (Blank, Encrypted, AI) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {/* Opción 1: Página en blanco */}
          <div
            onClick={() => {
              onCreateBlankPage(false);
              onClose();
            }}
            className="group cursor-pointer p-3.5 rounded-xl bg-[#262626] hover:bg-[#2e2e2e] border border-[#333333] hover:border-blue-500/50 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-105 transition">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-gray-500 group-hover:text-blue-400 transition">
                Comenzar →
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition">
                Página en Blanco
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                Lienzo limpio para escribir notas, listas de tareas y bloques libres.
              </p>
            </div>
          </div>

          {/* Opción 2: Bóveda Privada */}
          <div
            onClick={() => {
              onCreateBlankPage(true);
              onClose();
            }}
            className="group cursor-pointer p-3.5 rounded-xl bg-[#262626] hover:bg-[#2e2e2e] border border-[#333333] hover:border-purple-500/50 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-105 transition">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-purple-400/80 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                AES-256
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-purple-400 transition">
                Bóveda Cifrada (E2EE)
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                Notas y credenciales protegidas con cifrado cliente de grado militar.
              </p>
            </div>
          </div>

          {/* Opción 3: Generar con IA */}
          <div
            onClick={() => {
              onClose();
              if (onOpenAIModal) onOpenAIModal();
            }}
            className="group cursor-pointer p-3.5 rounded-xl bg-[#262626] hover:bg-[#2e2e2e] border border-[#333333] hover:border-purple-400/50 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600/15 text-purple-300 flex items-center justify-center group-hover:scale-105 transition">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-purple-300 bg-purple-600/15 px-1.5 py-0.5 rounded border border-purple-500/20">
                IA
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition">
                Generar con IA
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                Escribe un prompt y deja que la IA estructure el contenido y los bloques.
              </p>
            </div>
          </div>
        </div>

        {/* Section Divider & Categories */}
        <div className="flex items-center justify-between mb-3 pt-2 border-t border-[#2f2f2f]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Plantillas Predeterminadas
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition ${
                  filterCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-[#282828] text-gray-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1 max-h-[42vh]">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                onSelectTemplate(tpl);
                onClose();
              }}
              className="bg-[#262626] hover:bg-[#2c2c2c] border border-[#333333] hover:border-blue-500/50 rounded-xl p-3.5 cursor-pointer transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl group-hover:scale-110 transition">{tpl.icon}</span>
                  <div className="flex items-center gap-1.5">
                    {tpl.isEncrypted && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        E2EE
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e1e1e] border border-[#383838] text-gray-400">
                      {tpl.category}
                    </span>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition mb-1">
                  {tpl.name}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-[#333333] flex items-center justify-between">
                <span className="text-[11px] text-gray-500">{tpl.blocks.length} bloques</span>
                <span className="flex items-center gap-1 text-xs text-blue-400 group-hover:text-blue-300 font-medium">
                  Usar plantilla <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-3 border-t border-[#2f2f2f] flex items-center justify-between">
          {onOpenTemplatesGallery && (
            <button
              onClick={() => {
                onClose();
                onOpenTemplatesGallery();
              }}
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ver todas las plantillas en la galería ampliada</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-1.5 rounded-lg text-xs bg-[#2c2c2c] hover:bg-[#383838] text-gray-300 hover:text-white transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
