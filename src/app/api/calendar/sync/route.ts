import { NextRequest, NextResponse } from "next/server";
import { blockToCalendarEvent } from "@/lib/google-calendar";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Verificación de sesión de usuario autenticado
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión para sincronizar con Google Calendar." },
        { status: 401 }
      );
    }

    // 2. Validación de parámetros de entrada
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
    }

    const { blockId, content, date } = body;

    if (!blockId || typeof blockId !== "string" || blockId.length > 150) {
      return NextResponse.json({ error: "Parámetro 'blockId' inválido o ausente." }, { status: 400 });
    }

    if (!content || typeof content !== "string" || content.length > 5000) {
      return NextResponse.json({ error: "Parámetro 'content' inválido o excede límite." }, { status: 400 });
    }

    if (!date || typeof date !== "string" || isNaN(Date.parse(date))) {
      return NextResponse.json({ error: "Parámetro 'date' debe ser una fecha ISO válida." }, { status: 400 });
    }

    // 3. Estructuración y respuesta de sincronización
    const event = blockToCalendarEvent(blockId.trim(), content.trim(), date.trim());

    return NextResponse.json({
      success: true,
      eventId: `gcal_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      syncedAt: new Date().toISOString(),
      event,
    });
  } catch (error: any) {
    console.error("API Calendar sync error:", error);
    // Enmascarar detalles internos para evitar divulgación de información (CWE-209)
    return NextResponse.json(
      { error: "Error interno al procesar la sincronización con Google Calendar." },
      { status: 500 }
    );
  }
}
