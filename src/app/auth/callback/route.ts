import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getSafeRedirectUrl(target: string | null, origin: string): string {
  if (!target) return `${origin}/`;

  // Prevenir redirecciones de protocolo relativo (//evil.com), esquemas explícitos o caracteres de escape
  if (
    target.startsWith("//") ||
    target.startsWith("/\\") ||
    target.includes("://") ||
    target.includes("\\") ||
    /[\x00-\x1F\x7F]/.test(target)
  ) {
    return `${origin}/`;
  }

  // Debe comenzar estrictamente con una única barra relativa
  if (!target.startsWith("/")) {
    return `${origin}/`;
  }

  return `${origin}${target}`;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  const destination = getSafeRedirectUrl(next, origin);

  if (code) {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(destination);
      }
      console.error("Error exchanging code for session in callback:", error.message);
    } catch (err: any) {
      console.error("Supabase auth callback exception:", err);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
