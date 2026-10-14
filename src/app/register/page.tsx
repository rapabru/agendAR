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
    <div className="min-h-screen bg-[#191919] flex flex-col justify-center items-center px-4 select-none">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xl mx-auto mb-3">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e3e2e0]">Crear cuenta en AgendAR</h1>
          <p className="text-xs text-gray-400 mt-1">Espacio seguro conectado a tu base de datos Supabase</p>
        </div>

        <div className="bg-[#202020] border border-[#2f2f2f] rounded-2xl p-6 shadow-2xl space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-gray-300 font-medium mb-1 block">Nombre Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu Nombre"
                  required
                  className="w-full bg-[#181818] border border-[#383838] rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-300 font-medium mb-1 block">Correo de Gmail / Trabajo</label>
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
                  placeholder="Al menos 6 caracteres"
                  required
                  minLength={6}
                  className="w-full bg-[#181818] border border-[#383838] rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs py-2.5 rounded-lg transition shadow-lg shadow-emerald-600/20 mt-2"
            >
              <span>{isLoading ? "Creando espacio..." : "Crear Cuenta"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {errorMessage && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="pt-3 border-t border-[#2a2a2a] text-center text-xs text-gray-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-400 hover:underline font-medium">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
