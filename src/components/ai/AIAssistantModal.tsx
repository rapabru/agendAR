"use client";

import React, { useState, useEffect } from "react";
import { AIAssistantClient, AIProvider, AISettings } from "@/lib/ai/assistant";
import { Block } from "@/lib/types";
import {
  Sparkles,
  X,
  Send,
  Key,
  Settings,
  Bot,
  CheckCircle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedBlocks: (title: string, blocks: Omit<Block, "id" | "createdAt" | "updatedAt">[]) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyGeneratedBlocks,
}) => {
  const [activeTab, setActiveTab] = useState<"chat" | "settings">("chat");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [geminiKey, setGeminiKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Cargar llaves guardadas en localStorage
  useEffect(() => {
    const savedGemini = localStorage.getItem("agendar_gemini_key") || "";
    const savedClaude = localStorage.getItem("agendar_claude_key") || "";
    const savedOpenai = localStorage.getItem("agendar_openai_key") || "";
    const savedProvider = (localStorage.getItem("agendar_ai_provider") as AIProvider) || "gemini";

    setGeminiKey(savedGemini);
    setClaudeKey(savedClaude);
    setOpenaiKey(savedOpenai);
    setProvider(savedProvider);
  }, []);

  if (!isOpen) return null;

  const handleSaveKeys = () => {
    localStorage.setItem("agendar_gemini_key", geminiKey);
    localStorage.setItem("agendar_claude_key", claudeKey);
    localStorage.setItem("agendar_openai_key", openaiKey);
    localStorage.setItem("agendar_ai_provider", provider);
    setStatusMessage("¡Configuración de IA guardada con éxito!");
    setTimeout(() => {
      setStatusMessage(null);
      setActiveTab("chat");
    }, 1200);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setStatusMessage(null);

    const client = new AIAssistantClient({
      provider,
      geminiKey: geminiKey.trim() || undefined,
      claudeKey: claudeKey.trim() || undefined,
      openaiKey: openaiKey.trim() || undefined,
    });

    const res = await client.generatePageFromPrompt(prompt);
    setIsLoading(false);

    if (res.success && res.generatedBlocks) {
      onApplyGeneratedBlocks(prompt, res.generatedBlocks);
      onClose();
    } else if (res.error) {
      setStatusMessage(res.error);
    }
  };

  const quickPrompts = [
    "Plan de lanzamiento de producto con fechas y tareas",
    "Estructura para curso intensivo de programación",
    "Gestión de finanzas personales y presupuesto mensual",
    "Estrategia de contenidos para redes sociales",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-xl rounded-3xl bg-[#13141d]/95 backdrop-blur-2xl border border-white/[0.1] text-[#f0f2f7] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5 pr-8">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-lg shadow-indigo-950/40">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Asistente Inteligente AgendAR
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
                  BYOK
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Genera páginas, resúmenes y plantillas estructuradas con IA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#181a24] p-1.5 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => setActiveTab("chat")}
              className={`p-2 rounded-lg text-xs transition ${
                activeTab === "chat" ? "bg-white/[0.1] text-white shadow-sm ring-1 ring-white/10" : "text-slate-400 hover:text-white"
              }`}
              title="Generador"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`p-2 rounded-lg text-xs transition ${
                activeTab === "settings" ? "bg-white/[0.1] text-white shadow-sm ring-1 ring-white/10" : "text-slate-400 hover:text-white"
              }`}
              title="Configuración de Claves"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>

        {activeTab === "chat" ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium mb-1.5 block">
                ¿Qué deseas que la IA organice o construya hoy?
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ej: 'Crea un plan de sprint ágil para el rediseño del checkout con fechas y responsables'..."
                  className="w-full bg-[#181a24] border border-white/[0.08] focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 rounded-2xl p-3.5 text-xs text-white outline-none placeholder-slate-600 transition resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Quick Prompts */}
            <div>
              <span className="text-[11px] text-slate-400 mb-2 block font-medium">Ideas rápidas:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((qp) => (
                  <button
                    key={qp}
                    onClick={() => setPrompt(qp)}
                    className="text-[11px] text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white border border-white/[0.07] px-3 py-1.5 rounded-xl transition text-left"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Provider Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/[0.06]">
              <span className="flex items-center gap-2 text-[11px]">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Motor: <strong className="text-white capitalize">{provider}</strong></span>
                {provider === "gemini" && (
                  <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Gratuito
                  </span>
                )}
              </span>

              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white font-medium text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-indigo-950/40"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generando bloques...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generar Página</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-[#181a24] rounded-2xl border border-white/[0.06] text-xs space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-medium">
                <Key className="w-4 h-4" />
                <span>Modelo BYOK (Bring Your Own Key)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Puedes utilizar la clave gratuita de <strong>Google AI Studio (Gemini)</strong> sin pagar nada, o conectar tu clave de Anthropic o OpenAI. Las claves se almacenan localmente en tu navegador.
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium mb-1.5 block">
                Proveedor Principal
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as AIProvider)}
                className="w-full bg-[#181a24] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              >
                <option value="gemini">Google Gemini (Recomendado - Plan Gratuito)</option>
                <option value="claude">Anthropic Claude</option>
                <option value="openai">OpenAI (GPT-4o / Codex)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium mb-1.5 block">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#181a24] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition"
              />
            </div>

            <button
              onClick={handleSaveKeys}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs py-2.5 rounded-xl transition shadow-lg shadow-indigo-950/40"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Guardar Configuración de IA</span>
            </button>
          </div>
        )}

        {statusMessage && (
          <p className="mt-4 text-[11px] text-center text-indigo-300 bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 font-medium">
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
};
