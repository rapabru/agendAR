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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-[#202020] border border-[#2f2f2f] text-[#e3e2e0] p-6 shadow-2xl relative max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2c2c2c] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Galería de Plantillas de AgendAR</h3>
            <p className="text-xs text-gray-400">
              Inicia tus proyectos al instante con flujos de trabajo probados y estructurados
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 pb-3 border-b border-[#2c2c2c] overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-[#282828] text-gray-400 hover:text-white hover:bg-[#333333]"
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
              className="bg-[#262626] hover:bg-[#2b2b2b] border border-[#333333] hover:border-blue-500/40 rounded-xl p-4 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{tpl.icon}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e1e1e] border border-[#383838] text-gray-400">
                    {tpl.category}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition mb-1">
                  {tpl.name}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">{tpl.description}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#333333] flex items-center justify-between">
                <span className="text-[11px] text-gray-500">{tpl.blocks.length} bloques</span>
                <button
                  onClick={() => {
                    onSelectTemplate(tpl);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs px-3 py-1.5 rounded-lg font-medium transition"
                >
                  <span>Usar Plantilla</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
