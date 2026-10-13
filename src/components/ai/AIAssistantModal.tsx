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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl bg-[#202020] border border-[#2f2f2f] text-[#e3e2e0] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2c2c2c] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 pr-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Asistente Inteligente AgendAR
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  BYOK
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Genera páginas, resúmenes y plantillas estructuradas con IA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#262626] p-1 rounded-lg border border-[#333333]">
            <button
              onClick={() => setActiveTab("chat")}
              className={`p-1.5 rounded text-xs transition ${
                activeTab === "chat" ? "bg-[#333333] text-white" : "text-gray-400 hover:text-white"
              }`}
              title="Generador"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`p-1.5 rounded text-xs transition ${
                activeTab === "settings" ? "bg-[#333333] text-white" : "text-gray-400 hover:text-white"
              }`}
              title="Configuración de Claves"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {activeTab === "chat" ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-300 font-medium mb-1.5 block">
                ¿Qué deseas que la IA organice o construya hoy?
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ej: 'Crea un plan de sprint ágil para el rediseño del checkout con fechas y responsables'..."
                  className="w-full bg-[#181818] border border-[#383838] rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500 transition resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Quick Prompts */}
            <div>
              <span className="text-[11px] text-gray-400 mb-2 block">Ideas rápidas:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((qp) => (
                  <button
                    key={qp}
                    onClick={() => setPrompt(qp)}
                    className="text-[11px] text-gray-300 bg-[#262626] hover:bg-[#303030] border border-[#383838] px-2.5 py-1 rounded-lg transition text-left"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Provider Indicator */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-[#2a2a2a]">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                Motor: <strong className="text-gray-200 capitalize">{provider}</strong>
                {provider === "gemini" && " (Plan Gratuito Disponible)"}
              </span>

              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium text-xs px-4 py-2 rounded-lg transition shadow-lg shadow-purple-600/20"
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
            <div className="p-3 bg-[#262626] rounded-xl border border-[#333333] text-xs space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-medium">
                <Key className="w-4 h-4" />
                <span>Modelo BYOK (Bring Your Own Key)</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Puedes utilizar la clave gratuita de <strong>Google AI Studio (Gemini)</strong> sin pagar nada, o conectar tu clave de Anthropic o OpenAI. Las claves se almacenan localmente en tu navegador.
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-300 font-medium mb-1 block">
                Proveedor Principal
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as AIProvider)}
                className="w-full bg-[#181818] border border-[#383838] rounded-lg px-3 py-2 text-xs text-white outline-none"
              >
                <option value="gemini">Google Gemini (Recomendado - Plan Gratuito)</option>
                <option value="claude">Anthropic Claude</option>
                <option value="openai">OpenAI (GPT-4o / Codex)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-300 font-medium mb-1 block">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#181818] border border-[#383838] rounded-lg px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <button
              onClick={handleSaveKeys}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs py-2 rounded-lg transition"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Guardar Configuración de IA</span>
            </button>
          </div>
        )}

        {statusMessage && (
          <p className="mt-3 text-[11px] text-center text-purple-300 bg-purple-500/10 p-2 rounded border border-purple-500/20">
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
};
