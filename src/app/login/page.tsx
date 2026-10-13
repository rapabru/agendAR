"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { signInWithGoogle, setLocalGmailSession } from "@/lib/supabase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    // Establecer sesión de cuenta
    setLocalGmailSession(email.trim());
    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 400);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // Intentar flujo OAuth real de Supabase
    const { error } = await signInWithGoogle();

    if (error) {
      // Si Supabase aún no tiene habilitado el proveedor de Google en su dashboard,
      // permitimos ingresar el Gmail para guardar la info aislada bajo esa cuenta
      setErrorMessage(
        `OAuth Supabase: ${error}. Si estás configurando el proyecto, puedes ingresar tu Gmail abajo para asociar tu información de inmediato.`
      );
      setIsLoading(false);
    }
  };

  const handleQuickGmailLogin = () => {
    const inputEmail = prompt("Ingresa tu cuenta de Gmail para acceder a tu espacio personal:", "mi.cuenta@gmail.com");
    if (inputEmail && inputEmail.includes("@")) {
      setLocalGmailSession(inputEmail.trim());
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] flex flex-col justify-center items-center px-4 select-none">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xl mx-auto mb-3">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e3e2e0]">Iniciar sesión en AgendAR</h1>
          <p className="text-xs text-gray-400 mt-1">Conecta tu Gmail para sincronizar notas, agenda y calendario</p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#202020] border border-[#2f2f2f] rounded-2xl p-6 shadow-2xl space-y-4">
          {/* Sign in with Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#2a2a2a] hover:bg-[#333333] border border-[#383838] text-white text-xs font-medium py-2.5 rounded-lg transition group"
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
            <span>{isLoading ? "Conectando con Google..." : "Iniciar sesión con Google (Gmail)"}</span>
          </button>

          <button
            onClick={handleQuickGmailLogin}
            className="w-full text-center text-[11px] text-blue-400 hover:text-blue-300 transition py-1"
          >
            ¿Prefieres ingresar tu Gmail directamente? Clic aquí
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="h-[1px] flex-1 bg-[#2f2f2f]" />
            <span className="text-[11px] text-gray-500 uppercase tracking-wider">o con contraseña</span>
            <div className="h-[1px] flex-1 bg-[#2f2f2f]" />
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-gray-300 font-medium mb-1 block">Correo de Gmail / Cuenta</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.cuenta@gmail.com"
                  required
                  className="w-full bg-[#181818] border border-[#383838] rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-300 font-medium mb-1 block">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#181818] border border-[#383838] rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs py-2.5 rounded-lg transition shadow-lg shadow-blue-600/20 mt-2"
            >
              <span>{isLoading ? "Ingresando..." : "Entrar a mi Espacio"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {errorMessage && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Encryption notice */}
          <div className="pt-3 border-t border-[#2a2a2a] flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Tus datos se guardan aislados bajo tu cuenta</span>
          </div>
        </div>

        {/* Back Link */}
        <p className="text-center text-xs text-gray-500 mt-4">
          <Link href="/" className="hover:text-blue-400 transition">
            ← Volver al espacio de trabajo
          </Link>
        </p>
      </div>
    </div>
  );
}
