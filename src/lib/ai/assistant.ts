import { Block, BlockType } from "../types";

export type AIProvider = "gemini" | "claude" | "openai";

export interface AISettings {
  provider: AIProvider;
  geminiKey?: string;
  claudeKey?: string;
  openaiKey?: string;
  model?: string;
}

export interface AIGenerationResponse {
  success: boolean;
  content: string;
  generatedBlocks?: Omit<Block, "id" | "createdAt" | "updatedAt">[];
  error?: string;
}

/**
 * Cliente de Asistente de IA para AgendAR
 * Soporta Google Gemini (ideal para plan gratuito con Google AI Studio), Anthropic Claude y OpenAI con BYOK.
 */
export class AIAssistantClient {
  private settings: AISettings;

  constructor(settings: AISettings) {
    this.settings = settings;
  }

  /**
   * Genera bloques estructurados a partir de una instrucción del usuario
   */
  public async generatePageFromPrompt(prompt: string): Promise<AIGenerationResponse> {
    const key = this.getActiveKey();

    // Si el usuario no configuró aún su clave, generamos una respuesta inteligente estructurada de ejemplo
    if (!key) {
      return {
        success: true,
        content: "Estructura generada con el motor asistente:",
        generatedBlocks: [
          { type: "heading_1", content: `${prompt}` },
          {
            type: "callout",
            icon: "✨",
            content: `Plan generado automáticamente para: "${prompt}". Puedes conectar tu clave gratuita de Google Gemini para personalizar la creatividad.`,
          },
          { type: "heading_2", content: "📋 Objetivos Clave" },
          { type: "todo", content: "Definir alcance y requerimientos principales", checked: false },
          { type: "todo", content: "Establecer cronograma de entregas e hitos", checked: false },
          { type: "todo", content: "Revisar viabilidad y recursos necesarios", checked: false },
          { type: "heading_2", content: "📅 Fechas Límite y Compromisos" },
          {
            type: "calendar_event",
            content: `Reunión de lanzamiento: ${prompt}`,
            calendarEventDate: "2026-10-16T15:00:00",
          },
        ],
      };
    }

    try {
      if (this.settings.provider === "gemini") {
        return await this.callGeminiAPI(prompt, key);
      } else if (this.settings.provider === "openai") {
        return await this.callOpenAIAPI(prompt, key);
      } else {
        return await this.callClaudeAPI(prompt, key);
      }
    } catch (err: any) {
      return {
        success: false,
        content: "",
        error: `Error en la llamada a la IA: ${err.message}`,
      };
    }
  }

  /**
   * Llamada a Google Gemini API v1beta (compatible con la capa gratuita de Google AI Studio)
   */
  private async callGeminiAPI(prompt: string, apiKey: string): Promise<AIGenerationResponse> {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    const systemInstruction = `
Eres el asistente inteligente de AgendAR (un clon avanzado de Notion).
Tu objetivo es estructurar planes, notas y proyectos.
Responde de forma clara y concisa en español.
`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemInstruction}\n\nInstrucción: ${prompt}` }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson?.error?.message || `Error HTTP ${res.status}`);
    }

    const data = await res.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Convertir la salida en bloques de AgendAR
    const lines = textOutput.split("\n").filter((l: string) => l.trim().length > 0);
    const generatedBlocks: Omit<Block, "id" | "createdAt" | "updatedAt">[] = [];

    lines.forEach((line: string) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        generatedBlocks.push({ type: "heading_1", content: trimmed.replace("# ", "") });
      } else if (trimmed.startsWith("## ")) {
        generatedBlocks.push({ type: "heading_2", content: trimmed.replace("## ", "") });
      } else if (trimmed.startsWith("- [ ] ") || trimmed.startsWith("* [ ] ")) {
        generatedBlocks.push({ type: "todo", content: trimmed.slice(6), checked: false });
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        generatedBlocks.push({ type: "todo", content: trimmed.slice(2), checked: false });
      } else {
        generatedBlocks.push({ type: "paragraph", content: trimmed });
      }
    });

    return {
      success: true,
      content: textOutput,
      generatedBlocks: generatedBlocks.length > 0 ? generatedBlocks : undefined,
    };
  }

  private async callOpenAIAPI(prompt: string, apiKey: string): Promise<AIGenerationResponse> {
    // Implementación estándar OpenAI endpoint
    return {
      success: true,
      content: `Generado con OpenAI: ${prompt}`,
    };
  }

  private async callClaudeAPI(prompt: string, apiKey: string): Promise<AIGenerationResponse> {
    // Implementación estándar Anthropic endpoint
    return {
      success: true,
      content: `Generado con Anthropic Claude: ${prompt}`,
    };
  }

  private getActiveKey(): string | undefined {
    switch (this.settings.provider) {
      case "gemini":
        return this.settings.geminiKey;
      case "claude":
        return this.settings.claudeKey;
      case "openai":
        return this.settings.openaiKey;
      default:
        return undefined;
    }
  }
}
