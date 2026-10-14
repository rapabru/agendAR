"use client";

import React, { useState } from "react";
import { TEMPLATE_LIBRARY, TemplateDefinition } from "@/lib/templates";
import { X, Sparkles, Check, ArrowRight, Layers } from "lucide-react";

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateDefinition) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");

  if (!isOpen) return null;

  const categories = ["Todas", "Productividad", "Desarrollo", "Gestión", "Seguridad"];

  const filtered =
    selectedCategory === "Todas"
      ? TEMPLATE_LIBRARY
      : TEMPLATE_LIBRARY.filter((t) => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-[#13141d]/95 border border-white/[0.1] text-[#f0f2f7] p-6 md:p-8 shadow-2xl relative max-h-[85vh] flex flex-col backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.08] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Galería de Plantillas de AgendAR</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inicia tus proyectos al instante con flujos de trabajo probados y estructurados
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 pb-3.5 border-b border-white/[0.06] overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 font-semibold"
                  : "bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto py-4 pr-1 flex-1">
          {filtered.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-[#161822]/90 hover:bg-[#1c1e2b] border border-white/[0.07] hover:border-cyan-500/50 rounded-2xl p-4 transition-all group flex flex-col justify-between shadow-sm"
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
                <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">{tpl.blocks.length} bloques</span>
                <button
                  onClick={() => {
                    onSelectTemplate(tpl);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 bg-cyan-500/15 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 text-cyan-300 hover:text-white text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95"
                >
                  <span>Usar Plantilla</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
