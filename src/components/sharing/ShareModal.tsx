"use client";

import React, { useState } from "react";
import { PageItem } from "@/lib/types";
import {
  Users,
  X,
  Link as LinkIcon,
  Copy,
  Check,
  Shield,
  Lock,
  Globe,
  UserPlus,
  Mail,
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: PageItem;
  onTogglePrivate: (isPrivate: boolean) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  page,
  onTogglePrivate,
}) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [copied, setCopied] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState<
    { email: string; role: string; avatar: string }[]
  >([
    { email: "tu (Tú - Propietario)", role: "Owner", avatar: "👤" },
    { email: "colaborador@equipo.com", role: "Editor", avatar: "👩‍💻" },
  ]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://agendar-one.vercel.app/app?page=${page.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInvitedMembers([
      ...invitedMembers,
      { email: inviteEmail.trim(), role: inviteRole, avatar: "✉️" },
    ]);
    setInviteEmail("");
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Compartir y Permisos</h3>
            <p className="text-xs text-gray-400 truncate max-w-xs">{page.title || "Esta página"}</p>
          </div>
        </div>

        {/* Privacy Switch */}
        <div className="p-3.5 rounded-xl bg-[#252525] border border-[#333333] mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Proyecto Privado</span>
                <span className="text-[10px] text-gray-400">
                  {page.isPrivate
                    ? "Solo visible para ti (los demás miembros no la verán)"
                    : "Visible para todos los miembros del Workspace"}
                </span>
              </div>
            </div>

            <button
              onClick={() => onTogglePrivate(!page.isPrivate)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                page.isPrivate ? "bg-blue-600 justify-end" : "bg-gray-700 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* Invite by Email */}
        <form onSubmit={handleInvite} className="space-y-3 mb-5">
          <label className="text-xs text-gray-300 font-medium block">Invitar personas por correo</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="companero@empresa.com"
                className="w-full bg-[#181818] border border-[#383838] rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="bg-[#181818] border border-[#383838] rounded-lg px-2.5 py-2 text-xs text-white outline-none"
            >
              <option value="editor">Editor</option>
              <option value="lector">Lector</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg font-medium transition"
            >
              Invitar
            </button>
          </div>
        </form>

        {/* Members List */}
        <div className="space-y-2 mb-4">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Miembros con acceso ({invitedMembers.length})
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {invitedMembers.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-[#252525] rounded-lg border border-[#303030]"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{m.avatar}</span>
                  <span className="truncate text-gray-200">{m.email}</span>
                </div>
                <span className="text-[10px] text-gray-400 bg-[#1e1e1e] px-2 py-0.5 rounded capitalize">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Copy Shareable Link */}
        <div className="pt-3 border-t border-[#2f2f2f] flex items-center justify-between">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <LinkIcon className="w-3.5 h-3.5" />}
            <span>{copied ? "¡Enlace copiado al portapapeles!" : "Copiar enlace de invitación"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
