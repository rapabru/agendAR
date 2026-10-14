"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { signUpWithEmail } from "@/lib/supabase/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { user, error, sessionEstablished } = await signUpWithEmail(email, password, name);

    if (error) {
      setErrorMessage(error);
      setIsLoading(false);
      return;
    }

    if (sessionEstablished) {
      setSuccessMessage("¡Cuenta creada con éxito! Entrando a tu espacio de trabajo...");
      setTimeout(() => {
        router.push("/");
      }, 700);
    } else {
      setSuccessMessage(
        "¡Cuenta registrada en Supabase! Revisa tu correo para confirmar, o si desactivaste 'Confirm email' en tu panel de Supabase ya puedes iniciar sesión."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d12] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-[#0c0d12] to-[#0c0d12] flex flex-col justify-center items-center px-4 select-none py-12 text-[#f0f2f7]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-xl shadow-cyan-950/50 mx-auto mb-4">
            <div className="w-full h-full bg-[#0c0d12] rounded-[15px] flex items-center justify-center font-bold text-xl text-white">
              A
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Crear cuenta en AgendAR</h1>
          <p className="text-xs text-slate-400 mt-1.5">Espacio seguro conectado a tu base de datos Supabase</p>
        </div>

        <div className="bg-[#13141d]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-7 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium mb-1.5 block">Nombre Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu Nombre"
                  required
                  className="w-full bg-[#181a24] border border-white/[0.08] focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium mb-1.5 block">Correo de Gmail / Trabajo</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.cuenta@gmail.com"
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
                  placeholder="Al menos 6 caracteres"
                  required
                  minLength={6}
                  className="w-full bg-[#181a24] border border-white/[0.08] focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-medium text-xs py-3 rounded-xl transition shadow-lg shadow-emerald-950/40 mt-3"
            >
              <span>{isLoading ? "Creando espacio..." : "Crear Cuenta"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          <div className="pt-3.5 border-t border-white/[0.06] text-center text-xs text-slate-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-cyan-400 hover:underline font-medium">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
