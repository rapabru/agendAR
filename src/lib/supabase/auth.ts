import { createClient } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  provider: "google" | "email" | "credentials";
}

const LOCAL_USER_SESSION_KEY = "agendar_current_user_session";

/**
 * Obtiene el usuario activo (primero intenta Supabase Cloud, luego fallback a caché local)
 */
export async function getActiveUser(): Promise<AuthUser | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!error && user) {
      const authUser: AuthUser = {
        id: user.id,
        email: user.email || "",
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Usuario",
        avatarUrl:
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email || "user")}`,
        provider: user.app_metadata?.provider === "google" ? "google" : "email",
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(authUser));
      }
      return authUser;
    }
  } catch (err) {
    console.warn("Supabase session check error:", err);
  }

  // Fallback a sesión local si el usuario inició sesión previamente o en modo offline
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
 * Iniciar sesión con Correo / Gmail y Contraseña directamente en Supabase
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user?: AuthUser; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        name:
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          email.split("@")[0],
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
        provider: "email",
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(authUser));
      }

      return { user: authUser };
    }

    return { error: "No se pudo iniciar sesión" };
  } catch (err: any) {
    return { error: err?.message || "Error al conectar con el servidor" };
  }
}

/**
 * Registro de nueva cuenta con Correo y Contraseña en Supabase
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string
): Promise<{ user?: AuthUser; error?: string; sessionEstablished?: boolean }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName || email.split("@")[0],
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        name: fullName || email.split("@")[0],
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
        provider: "email",
      };

      const hasSession = !!data.session;
      if (hasSession && typeof window !== "undefined") {
        localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(authUser));
      }

      return { user: authUser, sessionEstablished: hasSession };
    }

    return { error: "No se pudo registrar la cuenta" };
  } catch (err: any) {
    return { error: err?.message || "Error al registrar la cuenta" };
  }
}

/**
 * Enviar Enlace Mágico (Magic Link OTP) al correo
 */
export async function sendMagicLink(email: string): Promise<{ error?: string }> {
  try {
    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (err: any) {
    return { error: err?.message || "Error al enviar enlace mágico" };
  }
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
 * Sesión local para entorno de desarrollo o modo sin conexión
 */
export function setLocalGmailSession(gmailAddress: string, name?: string): AuthUser {
  const user: AuthUser = {
    id: `usr_${btoa(gmailAddress).replace(/[^a-zA-Z0-9]/g, "")}`,
    email: gmailAddress,
    name: name || gmailAddress.split("@")[0],
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(gmailAddress)}`,
    provider: "email",
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_USER_SESSION_KEY, JSON.stringify(user));
  }

  return user;
}

/**
 * Cierra la sesión activa en Supabase y localmente
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
