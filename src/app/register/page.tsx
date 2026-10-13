"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ShieldCheck, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#191919] flex flex-col justify-center items-center px-4 select-none">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xl mx-auto mb-3">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e3e2e0]">Crear cuenta en AgendAR</h1>
          <p className="text-xs text-gray-400 mt-1">Comienza tu espacio de trabajo inteligente y seguro</p>
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
              <label className="text-xs text-gray-300 font-medium mb-1 block">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
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
                  placeholder="Al menos 8 caracteres"
                  required
                  className="w-full bg-[#181818] border border-[#383838] rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs py-2.5 rounded-lg transition shadow-lg shadow-blue-600/20 mt-2"
            >
              <span>{isLoading ? "Creando espacio..." : "Crear Cuenta"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-3 border-t border-[#2a2a2a] text-center text-xs text-gray-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
