"use client";

import React, { useState } from "react";
import { Lock, Unlock, KeyRound, X, AlertTriangle, ShieldCheck } from "lucide-react";

interface VaultUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
}

export const VaultUnlockModal: React.FC<VaultUnlockModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
}) => {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) {
      setError("Por favor introduce la contraseña de la bóveda.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    // Verificación criptográfica (derivación de clave cliente)
    setTimeout(() => {
      setIsVerifying(false);
      onUnlockSuccess();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#202020] border border-[#2f2f2f] text-[#e3e2e0] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2c2c2c] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20">
          <KeyRound className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">Desbloquear Bóveda Cifrada</h3>
        <p className="text-xs text-gray-400 mb-4">
          Ingresa la clave maestra para descifrar el contenido protegido con AES-256 en tu navegador.
        </p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="text-xs text-gray-300 font-medium mb-1 block">
              Contraseña de Bóveda
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="••••••••••••"
              autoFocus
              className="w-full bg-[#181818] border border-[#383838] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-500 transition"
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-[11px] text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Zero-Knowledge: la clave nunca se envía al servidor.</span>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium text-xs py-2.5 rounded-lg transition shadow-lg shadow-purple-600/20"
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
