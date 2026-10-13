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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#202020] border border-[#2f2f2f] text-[#e3e2e0] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2c2c2c] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Sincronización con Google Calendar</h3>
            <p className="text-xs text-gray-400">Vincula tu agenda para sincronizar eventos en tiempo real</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="my-5 p-3.5 rounded-xl bg-[#252525] border border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3 h-3 rounded-full ${
                isLinked ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-amber-500"
              }`}
            />
            <div className="text-xs">
              <div className="font-semibold text-white">
                {isLinked ? "Cuenta Vinculada" : "Sin Conexión"}
              </div>
              <div className="text-[11px] text-gray-400">
                {isLinked ? `Sincronizando con ${googleEmailInput}` : "Conecta tu cuenta de Gmail"}
              </div>
            </div>
          </div>

          {isLinked && (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Activo
            </span>
          )}
        </div>

        {/* Connection Form */}
        {!isLinked ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-300 font-medium mb-1 block">
                Cuenta de Google (Gmail)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="tu.cuenta@gmail.com"
                  className="w-full bg-[#181818] border border-[#383838] rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs py-2.5 rounded-lg transition shadow-lg shadow-emerald-600/20"
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
            <div className="text-xs space-y-2 text-gray-300">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Permisos otorgados: Lectura y escritura de eventos</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Todas las notas o bloques con fecha en AgendAR se enviarán a tu calendario principal de Google.
              </p>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs py-2 rounded-lg transition font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Desvincular Google Calendar</span>
            </button>
          </div>
        )}

        {syncStatus && (
          <p className="mt-4 text-[11px] text-center text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
            {syncStatus}
          </p>
        )}
      </div>
    </div>
  );
};
