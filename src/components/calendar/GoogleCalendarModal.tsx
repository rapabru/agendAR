"use client";

import React, { useState } from "react";
import {
  Calendar,
  CheckCircle,
  X,
  ExternalLink,
  RefreshCw,
  LogOut,
  Mail,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface GoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLinked: boolean;
  userEmail: string;
  onLinkAccount: (email: string) => void;
  onUnlinkAccount: () => void;
}

export const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({
  isOpen,
  onClose,
  isLinked,
  userEmail,
  onLinkAccount,
  onUnlinkAccount,
}) => {
  const [loading, setLoading] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState(userEmail || "usuario@gmail.com");
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setLoading(true);
    // Simula flujo OAuth con Google
    setTimeout(() => {
      onLinkAccount(googleEmailInput);
      setLoading(false);
      setSyncStatus("¡Conexión establecida con éxito con Google Calendar API v3!");
    }, 1000);
  };

  const handleDisconnect = () => {
    onUnlinkAccount();
    setSyncStatus("Cuenta desvinculada.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#13141d]/95 backdrop-blur-2xl border border-white/[0.1] text-[#f0f2f7] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25 shadow-lg shadow-emerald-950/40">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Sincronización con Google Calendar</h3>
            <p className="text-xs text-slate-400">Vincula tu agenda para sincronizar eventos en tiempo real</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="my-5 p-4 rounded-2xl bg-[#181a24] border border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isLinked ? "bg-emerald-400 shadow-md shadow-emerald-400/60" : "bg-amber-400 shadow-md shadow-amber-400/40"
              }`}
            />
            <div className="text-xs">
              <div className="font-semibold text-white">
                {isLinked ? "Cuenta Vinculada" : "Sin Conexión"}
              </div>
              <div className="text-[11px] text-slate-400">
                {isLinked ? `Sincronizando con ${googleEmailInput}` : "Conecta tu cuenta de Gmail"}
              </div>
            </div>
          </div>

          {isLinked && (
            <span className="text-[10px] text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30 font-medium">
              Activo
            </span>
          )}
        </div>

        {/* Connection Form */}
        {!isLinked ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium mb-1.5 block">
                Cuenta de Google (Gmail)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="tu.cuenta@gmail.com"
                  className="w-full bg-[#181a24] border border-white/[0.08] focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition"
                />
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-medium text-xs py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/40"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Conectar con Google Calendar</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs space-y-2 text-slate-300 bg-[#181a24] p-3.5 rounded-2xl border border-white/[0.06]">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Permisos otorgados: Lectura y escritura</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Todas las notas o bloques con fecha en AgendAR se enviarán a tu calendario principal de Google.
              </p>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs py-2.5 rounded-xl transition font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Desvincular Google Calendar</span>
            </button>
          </div>
        )}

        {syncStatus && (
          <p className="mt-4 text-[11px] text-center text-emerald-300 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 font-medium">
            {syncStatus}
          </p>
        )}
      </div>
    </div>
  );
};
