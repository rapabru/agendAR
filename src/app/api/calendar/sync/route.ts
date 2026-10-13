import { NextRequest, NextResponse } from "next/server";
import { blockToCalendarEvent } from "@/lib/google-calendar";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { blockId, content, date } = body;

    if (!blockId || !content || !date) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos: blockId, content, date" },
        { status: 400 }
      );
    }

    // Estructurar evento según formato Google Calendar API v3
    const event = blockToCalendarEvent(blockId, content, date);

    // En producción: const gcal = google.calendar({ version: 'v3', auth: oauth2Client });
    // await gcal.events.insert({ calendarId: 'primary', requestBody: event });

    return NextResponse.json({
      success: true,
      eventId: `gcal_${Date.now()}`,
      syncedAt: new Date().toISOString(),
      event,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al sincronizar con Google Calendar", details: error.message },
      { status: 500 }
    );
  }
}
