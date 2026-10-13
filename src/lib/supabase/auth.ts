import { createClient } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  provider: "google" | "credentials";
}

const LOCAL_USER_SESSION_KEY = "agendar_current_user_session";

/**
 * Obtiene el usuario activo (primero intenta Supabase, luego sesión local guardada)
 */
export async function getActiveUser(): Promise<AuthUser | null> {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (!error && session?.user) {
      const user = session.user;
      const authUser: AuthUser = {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0],
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        provider: user.app_metadata?.provider === "google" ? "google" : "credentials",
      };
      // Cachear localmente
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(authUser));
      }
      return authUser;
    }
  } catch (err) {
    console.warn("Supabase session check error:", err);
  }

  // Fallback a sesión local si el usuario inició sesión previamente
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(LOCAL_USER_SESSION_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as AuthUser;
      } catch {
        localStorage.removeItem(LOCAL_USER_SESSION_KEY);
      }
    }
  }

  return null;
}

/**
 * Inicia sesión real con Google OAuth a través de Supabase
 */
export async function signInWithGoogle(): Promise<{ error?: string }> {
  const supabase = createClient();
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        scopes: "https://www.googleapis.com/auth/calendar.events email profile",
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (err: any) {
    return { error: err?.message || "Error al conectar con Google" };
  }
}

/**
 * Inicia sesión directa con Gmail (para entornos donde las credenciales de Supabase aún no se cargaron en Vercel)
 */
export function setLocalGmailSession(gmailAddress: string, name?: string): AuthUser {
  const user: AuthUser = {
    id: `usr_${btoa(gmailAddress).replace(/[^a-zA-Z0-9]/g, "")}`,
    email: gmailAddress,
    name: name || gmailAddress.split("@")[0],
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(gmailAddress)}`,
    provider: "google",
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(user));
  }

  return user;
}

/**
 * Cierra la sesión activa
 */
export async function logoutUser(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_USER_SESSION_KEY);
  }
}
