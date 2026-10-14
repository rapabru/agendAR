"use client";

import React, { useState } from "react";
import { Lock, Unlock, KeyRound, X, AlertTriangle, ShieldCheck } from "lucide-react";
import { verifyVaultPassphrase } from "@/lib/crypto";
import { PageItem } from "@/lib/types";

interface VaultUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  page?: PageItem;
  canaryString?: string;
  onUnlockSuccess: (passphrase: string) => void;
}

export const VaultUnlockModal: React.FC<VaultUnlockModalProps> = ({
  isOpen,
  onClose,
  page,
  canaryString,
  onUnlockSuccess,
}) => {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassphrase = passphrase.trim();
    if (!cleanPassphrase) {
      setError("Por favor introduce la contraseña de la bóveda.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const verificationTarget = canaryString || page?.encryptionSalt;

      // Si existe un canary o testigo cifrado previo, verificamos la autenticidad con AES-GCM
      if (verificationTarget) {
        const isValid = await verifyVaultPassphrase(cleanPassphrase, verificationTarget);
        if (!isValid) {
          setError("Contraseña incorrecta. La clave criptográfica derivada no coincide.");
          setIsVerifying(false);
          return;
        }
      }

      setIsVerifying(false);
      onUnlockSuccess(cleanPassphrase);
      onClose();
    } catch {
      setError("Error al derivar las claves criptográficas con PBKDF2.");
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-sm rounded-3xl bg-[#13141d]/95 backdrop-blur-2xl border border-white/[0.1] text-[#f0f2f7] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06] transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/30 shadow-lg shadow-indigo-950/50">
          <KeyRound className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white tracking-tight mb-1">Desbloquear Bóveda Cifrada</h3>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Ingresa la clave maestra para descifrar el contenido protegido con AES-256 en tu navegador.
        </p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 font-medium mb-1.5 block">
              Contraseña de Bóveda
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="••••••••••••"
              autoFocus
              className="w-full bg-[#181a24] border border-white/[0.08] focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-[11px] text-red-300 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Zero-Knowledge: la clave nunca se envía al servidor.</span>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium text-xs py-2.5 rounded-xl transition shadow-lg shadow-indigo-950/40"
          >
            {isVerifying ? (
              <span>Derivando claves criptográficas...</span>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Desbloquear y Ver Nota</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
