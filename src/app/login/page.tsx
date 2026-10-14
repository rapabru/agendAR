"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import {
  signInWithEmail,
  signUpWithEmail,
  sendMagicLink,
  signInWithGoogle,
  setLocalGmailSession,
} from "@/lib/supabase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup" | "magic">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Iniciar sesión con Email y Contraseña
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { user, error } = await signInWithEmail(email, password);

    if (error) {
      if (error.includes("Invalid login credentials")) {
        setErrorMessage("Credenciales incorrectas. Si es tu primera vez, haz clic en la pestaña 'Crear Cuenta'.");
      } else if (error.includes("Email not confirmed")) {
        setErrorMessage(
          "Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada o desactiva 'Confirm email' en tu panel de Supabase."
        );
      } else {
        setErrorMessage(error);
      }
      setIsLoading(false);
      return;
    }

    setSuccessMessage("¡Sesión iniciada con éxito! Redirigiendo a tu espacio...");
    setTimeout(() => {
      router.push("/");
    }, 600);
  };

  // Crear nueva cuenta
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { user, error, sessionEstablished } = await signUpWithEmail(email, password, fullName);

    if (error) {
      setErrorMessage(error);
      setIsLoading(false);
      return;
    }

    if (sessionEstablished) {
      setSuccessMessage("¡Cuenta creada y conectada! Entrando a tu espacio de trabajo...");
      setTimeout(() => {
        router.push("/");
      }, 800);
    } else {
      setSuccessMessage(
        "¡Cuenta registrada! Te enviamos un enlace de confirmación a tu correo. (Si prefieres ingresar sin confirmación, apaga 'Confirm email' en tu panel de Supabase)."
      );
      setIsLoading(false);
    }
  };

  // Enviar Magic Link
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await sendMagicLink(email);

    if (error) {
      setErrorMessage(error);
      setIsLoading(false);
      return;
    }

    setSuccessMessage("¡Enlace mágico enviado! Revisa tu correo de Gmail y haz clic en el enlace para entrar.");
    setIsLoading(false);
  };

  // Login con Google OAuth
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await signInWithGoogle();

    if (error) {
      setErrorMessage(
        `OAuth de Google: ${error}. Si aún no creaste el Client ID en Google Cloud, ingresa directamente con tu correo y contraseña abajo.`
      );
      setIsLoading(false);
    }
  };

  // Acceso Local Rápido (fallback sin credenciales)
  const handleGuestLogin = () => {
    const userEmail = email.trim() || "usuario.agendar@gmail.com";
    setLocalGmailSession(userEmail);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0c0d12] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-[#0c0d12] to-[#0c0d12] flex flex-col justify-center items-center px-4 select-none py-12 text-[#f0f2f7]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-xl shadow-cyan-950/50 mx-auto mb-4">
            <div className="w-full h-full bg-[#0c0d12] rounded-[15px] flex items-center justify-center font-bold text-xl text-white">
              A
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">AgendAR Cloud</h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Espacio de trabajo conectado con base de datos en tiempo real
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#13141d]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-7 shadow-2xl space-y-5">
          {/* Sign in with Google (OAuth) */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#181a24] hover:bg-[#202230] border border-white/[0.08] text-white text-xs font-medium py-3 rounded-xl transition group shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoading ? "Conectando con Google..." : "Continuar con Google"}</span>
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="h-[1px] flex-1 bg-white/[0.06]" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">o con tu correo</span>
            <div className="h-[1px] flex-1 bg-white/[0.06]" />
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#181a24] p-1.5 rounded-2xl border border-white/[0.06] text-xs">
            <button
              onClick={() => {
                setTab("signin");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 rounded-xl font-medium transition ${
                tab === "signin"
                  ? "bg-white/[0.1] text-white shadow-sm ring-1 ring-white/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setTab("signup");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 rounded-xl font-medium transition ${
                tab === "signup"
                  ? "bg-white/[0.1] text-white shadow-sm ring-1 ring-white/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Crear Cuenta
            </button>
            <button
              onClick={() => {
                setTab("magic");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 rounded-xl font-medium transition ${
                tab === "magic"
                  ? "bg-white/[0.1] text-white shadow-sm ring-1 ring-white/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* Formulario: Iniciar Sesión */}
          {tab === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 font-medium mb-1.5 block">
                  Correo Electrónico (Gmail)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.correo@gmail.com"
                    required
                    className="w-full bg-[#181a24] border border-white/[0.08] focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium mb-1.5 block">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-[#181a24] border border-white/[0.08] focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-medium text-xs py-3 rounded-xl transition shadow-lg shadow-cyan-950/40 mt-4"
              >
                <span>{isLoading ? "Iniciando..." : "Entrar a mi Espacio"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Formulario: Crear Cuenta */}
          {tab === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 font-medium mb-1.5 block">Nombre Completo</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu Nombre"
                    className="w-full bg-[#181a24] border border-white/[0.08] focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium mb-1.5 block">
                  Correo Electrónico (Gmail)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.correo@gmail.com"
                    required
                    className="w-full bg-[#181a24] border border-white/[0.08] focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium mb-1.5 block">
                  Contraseña (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                    className="w-full bg-[#181a24] border border-white/[0.08] focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-medium text-xs py-3 rounded-xl transition shadow-lg shadow-emerald-950/40 mt-4"
              >
                <span>{isLoading ? "Creando cuenta..." : "Crear mi Cuenta y Espacio"}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Formulario: Magic Link */}
          {tab === "magic" && (
            <form onSubmit={handleMagicLink} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 font-medium mb-1.5 block">
                  Correo Electrónico (Gmail)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.correo@gmail.com"
                    required
                    className="w-full bg-[#181a24] border border-white/[0.08] focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Te enviaremos un enlace de 1 clic directo a tu correo sin requerir contraseña.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium text-xs py-3 rounded-xl transition shadow-lg shadow-indigo-950/40 mt-4"
              >
                <span>{isLoading ? "Enviando enlace..." : "Enviar Enlace Mágico"}</span>
                <KeyRound className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Mensajes de Feedback */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1 leading-relaxed">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="flex-1 leading-relaxed">
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Quick guest fallback */}
          <div className="pt-2 text-center">
            <button
              onClick={handleGuestLogin}
              className="text-xs text-slate-400 hover:text-white transition underline underline-offset-4"
            >
              O continuar en modo local offline
            </button>
          </div>

          {/* Encryption notice */}
          <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Datos cifrados y aislados en Supabase PostgreSQL</span>
          </div>
        </div>

        {/* Back Link */}
        <p className="text-center text-xs text-slate-500 mt-5">
          <Link href="/" className="hover:text-cyan-400 transition font-medium">
            ← Volver al espacio de trabajo
          </Link>
        </p>
      </div>
    </div>
  );
}
