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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#13141d]/95 backdrop-blur-2xl border border-white/[0.1] text-[#f0f2f7] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/25 shadow-lg shadow-cyan-950/40">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Compartir y Permisos</h3>
            <p className="text-xs text-slate-400 truncate max-w-xs">{page.title || "Esta página"}</p>
          </div>
        </div>

        {/* Privacy Switch */}
        <div className="p-4 rounded-2xl bg-[#181a24] border border-white/[0.07] mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Proyecto Privado</span>
                <span className="text-[11px] text-slate-400">
                  {page.isPrivate
                    ? "Solo visible para ti (los demás miembros no la verán)"
                    : "Visible para todos los miembros del Workspace"}
                </span>
              </div>
            </div>

            <button
              onClick={() => onTogglePrivate(!page.isPrivate)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                page.isPrivate ? "bg-cyan-500 justify-end" : "bg-slate-700 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* Invite by Email */}
        <form onSubmit={handleInvite} className="space-y-3 mb-5">
          <label className="text-xs text-slate-300 font-medium block">Invitar personas por correo</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="companero@empresa.com"
                className="w-full bg-[#181a24] border border-white/[0.08] focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition"
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="bg-[#181a24] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
            >
              <option value="editor">Editor</option>
              <option value="lector">Lector</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs px-3.5 py-2.5 rounded-xl font-medium transition shadow-md shadow-cyan-950/40"
            >
              Invitar
            </button>
          </div>
        </form>

        {/* Members List */}
        <div className="space-y-2 mb-4">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Miembros con acceso ({invitedMembers.length})
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {invitedMembers.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-2 px-3 bg-[#181a24] rounded-xl border border-white/[0.05]"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-base">{m.avatar}</span>
                  <span className="truncate text-slate-200">{m.email}</span>
                </div>
                <span className="text-[10px] text-slate-300 bg-white/[0.06] border border-white/[0.08] px-2.5 py-0.5 rounded-full capitalize font-medium">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Copy Shareable Link */}
        <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4" />}
            <span>{copied ? "¡Enlace copiado al portapapeles!" : "Copiar enlace de invitación"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
