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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-[#13141d]/95 border border-white/[0.1] text-[#f0f2f7] p-6 md:p-8 shadow-2xl relative max-h-[90vh] flex flex-col backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.08] transition"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Nueva Página</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comienza desde un lienzo en blanco o acelera tu flujo con una plantilla predeterminada
            </p>
          </div>
        </div>

        {/* Quick Launch Cards (Blank, Encrypted, AI) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {/* Opción 1: Página en blanco */}
          <div
            onClick={() => {
              onCreateBlankPage(false);
              onClose();
            }}
            className="group cursor-pointer p-4 rounded-2xl bg-[#161822]/90 hover:bg-[#1c1e2b] border border-white/[0.07] hover:border-cyan-500/50 transition-all flex flex-col justify-between shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-300 flex items-center justify-center group-hover:scale-105 transition-transform border border-cyan-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-cyan-400 transition font-medium">
                Comenzar →
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition">
                Página en Blanco
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
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
            className="group cursor-pointer p-4 rounded-2xl bg-[#161822]/90 hover:bg-[#1c1e2b] border border-white/[0.07] hover:border-purple-500/50 transition-all flex flex-col justify-between shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform border border-purple-500/20">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/25 font-semibold">
                AES-256
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                Bóveda Cifrada (E2EE)
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
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
            className="group cursor-pointer p-4 rounded-2xl bg-[#161822]/90 hover:bg-[#1c1e2b] border border-white/[0.07] hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center group-hover:scale-105 transition-transform border border-indigo-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-500/25 font-semibold">
                IA
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                Generar con IA
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Escribe un prompt y deja que la IA estructure el contenido y los bloques.
              </p>
            </div>
          </div>
        </div>

        {/* Section Divider & Categories */}
        <div className="flex items-center justify-between mb-4 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Plantillas Predeterminadas
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filterCategory === cat
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 font-semibold"
                    : "bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto pr-1 flex-1 max-h-[42vh]">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                onSelectTemplate(tpl);
                onClose();
              }}
              className="bg-[#161822]/90 hover:bg-[#1c1e2b] border border-white/[0.07] hover:border-cyan-500/50 rounded-2xl p-4 cursor-pointer transition-all group flex flex-col justify-between shadow-sm active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{tpl.icon}</span>
                  <div className="flex items-center gap-1.5">
                    {tpl.isEncrypted && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                        E2EE
                      </span>
                    )}
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-400 font-medium">
                      {tpl.category}
                    </span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition mb-1">
                  {tpl.name}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">{tpl.blocks.length} bloques</span>
                <span className="flex items-center gap-1 text-xs text-cyan-400 group-hover:text-cyan-300 font-semibold">
                  Usar plantilla <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-3 border-t border-white/[0.06] flex items-center justify-between">
          {onOpenTemplatesGallery && (
            <button
              onClick={() => {
                onClose();
                onOpenTemplatesGallery();
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1.5 font-medium transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ver todas las plantillas en la galería ampliada</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl text-xs bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white transition font-medium border border-white/[0.08]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
