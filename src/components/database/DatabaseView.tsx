"use client";

import React, { useState } from "react";
import { DatabaseCollection, DatabaseRow } from "@/lib/types";
import {
  Table as TableIcon,
  Kanban,
  Calendar,
  Plus,
  Filter,
  CheckCircle2,
  Circle,
  MoreHorizontal,
} from "lucide-react";

interface DatabaseViewProps {
  database: DatabaseCollection;
  initialRows: DatabaseRow[];
}

export const DatabaseViewComponent: React.FC<DatabaseViewProps> = ({
  database,
  initialRows,
}) => {
  const [activeView, setActiveView] = useState<"table" | "board" | "calendar">("board");
  const [rows, setRows] = useState<DatabaseRow[]>(initialRows);
  const [filterText, setFilterText] = useState("");

  const handleAddRow = () => {
    const newRow: DatabaseRow = {
      id: `row-${Date.now()}`,
      pageId: database.id,
      properties: {
        "prop-title": "Nueva Tarea",
        "prop-status": "Por Hacer",
        "prop-priority": "Media",
        "prop-date": new Date().toISOString().split("T")[0],
        "prop-done": false,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setRows([newRow, ...rows]);
  };

  const handleToggleDone = (rowId: string) => {
    setRows(
      rows.map((r) =>
        r.id === rowId
          ? {
              ...r,
              properties: {
                ...r.properties,
                "prop-done": !r.properties["prop-done"],
                "prop-status": !r.properties["prop-done"] ? "Completado" : "En Progreso",
              },
            }
          : r
      )
    );
  };

  const handleUpdateStatus = (rowId: string, newStatus: string) => {
    setRows(
      rows.map((r) =>
        r.id === rowId
          ? {
              ...r,
              properties: {
                ...r.properties,
                "prop-status": newStatus,
                "prop-done": newStatus === "Completado",
              },
            }
          : r
      )
    );
  };

  const filteredRows = rows.filter((r) =>
    (r.properties["prop-title"] || "").toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#12131b]/90 backdrop-blur-xl p-5 text-[#f0f2f7] shadow-2xl">
      {/* View Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4 mb-5">
        <div className="flex items-center gap-1.5 bg-[#181a24] p-1.5 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => setActiveView("board")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeView === "board"
                ? "bg-white/[0.1] text-white shadow-sm ring-1 ring-white/10"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <div className="w-5 h-5 rounded-md bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
              <Kanban className="w-3 h-3 text-cyan-400" />
            </div>
            <span>Tablero Kanban</span>
          </button>
          <button
            onClick={() => setActiveView("table")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeView === "table"
                ? "bg-white/[0.1] text-white shadow-sm ring-1 ring-white/10"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <div className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <TableIcon className="w-3 h-3 text-emerald-400" />
            </div>
            <span>Tabla</span>
          </button>
          <button
            onClick={() => setActiveView("calendar")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeView === "calendar"
                ? "bg-white/[0.1] text-white shadow-sm ring-1 ring-white/10"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <div className="w-5 h-5 rounded-md bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
              <Calendar className="w-3 h-3 text-purple-400" />
            </div>
            <span>Calendario</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filtrar tareas..."
            className="bg-[#181a24] border border-white/[0.08] px-3.5 py-1.5 rounded-xl text-xs text-white outline-none placeholder-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 w-48 transition"
          />
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs px-3.5 py-1.5 rounded-xl font-medium transition shadow-md shadow-cyan-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* View Content */}
      {activeView === "board" && (
        <KanbanBoard
          rows={filteredRows}
          onUpdateStatus={handleUpdateStatus}
          onToggleDone={handleToggleDone}
        />
      )}

      {activeView === "table" && (
        <TableView
          rows={filteredRows}
          onToggleDone={handleToggleDone}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {activeView === "calendar" && <CalendarGridView rows={filteredRows} />}
    </div>
  );
};

/**
 * Vista Tablero Kanban
 */
const KanbanBoard: React.FC<{
  rows: DatabaseRow[];
  onUpdateStatus: (id: string, status: string) => void;
  onToggleDone: (id: string) => void;
}> = ({ rows, onUpdateStatus, onToggleDone }) => {
  const columns = ["Por Hacer", "En Progreso", "Completado"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => {
        const colRows = rows.filter((r) => (r.properties["prop-status"] || "Por Hacer") === col);

        return (
          <div key={col} className="bg-[#161822]/90 rounded-2xl p-4 border border-white/[0.06] flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    col === "Completado"
                      ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                      : col === "En Progreso"
                      ? "bg-cyan-400 shadow-sm shadow-cyan-400/50"
                      : "bg-slate-500"
                  }`}
                />
                {col}
              </span>
              <span className="text-[11px] text-slate-400 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded-full font-mono">
                {colRows.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {colRows.map((row) => (
                <div
                  key={row.id}
                  className="bg-[#1c1e2b] hover:bg-[#212433] p-3.5 rounded-xl border border-white/[0.07] hover:border-cyan-500/30 transition shadow-sm group"
                >
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <button
                      onClick={() => onToggleDone(row.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition"
                    >
                      {row.properties["prop-done"] ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-medium leading-snug flex-1 ${
                        row.properties["prop-done"] ? "line-through text-slate-500" : "text-[#f0f2f7]"
                      }`}
                    >
                      {row.properties["prop-title"]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/[0.05]">
                    <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300">
                      {row.properties["prop-priority"]}
                    </span>
                    <span className="font-mono text-slate-400">{row.properties["prop-date"]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Vista Tabla (Data Grid)
 */
const TableView: React.FC<{
  rows: DatabaseRow[];
  onToggleDone: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}> = ({ rows, onToggleDone }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-white/[0.02]">
          <tr className="border-b border-white/[0.08] text-slate-400 uppercase tracking-wider text-[10px]">
            <th className="py-2.5 px-3.5 w-8">Listo</th>
            <th className="py-2.5 px-3.5">Tarea</th>
            <th className="py-2.5 px-3.5">Estado</th>
            <th className="py-2.5 px-3.5">Prioridad</th>
            <th className="py-2.5 px-3.5">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-white/[0.03] transition">
              <td className="py-2.5 px-3.5">
                <button onClick={() => onToggleDone(row.id)}>
                  {row.properties["prop-done"] ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                  )}
                </button>
              </td>
              <td className={`py-2.5 px-3.5 font-medium ${row.properties["prop-done"] ? "line-through text-slate-500" : "text-[#f0f2f7]"}`}>
                {row.properties["prop-title"]}
              </td>
              <td className="py-2.5 px-3.5">
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {row.properties["prop-status"]}
                </span>
              </td>
              <td className="py-2.5 px-3.5">
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {row.properties["prop-priority"]}
                </span>
              </td>
              <td className="py-2.5 px-3.5 font-mono text-slate-400">{row.properties["prop-date"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Vista Calendario
 */
const CalendarGridView: React.FC<{ rows: DatabaseRow[] }> = ({ rows }) => {
  return (
    <div className="p-5 bg-[#161822]/80 rounded-2xl border border-white/[0.06] text-center">
      <h4 className="text-sm font-semibold mb-3 flex items-center justify-center gap-2 text-emerald-400">
        <Calendar className="w-4 h-4" />
        Vista de Proyección de Tareas en Calendario
      </h4>
      <div className="grid grid-cols-7 gap-2.5 mt-4 text-xs">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} className="font-semibold text-slate-400 py-1.5 border-b border-white/[0.06]">
            {d}
          </div>
        ))}
        {Array.from({ length: 14 }).map((_, i) => {
          const dayNum = 10 + i;
          const dateStr = `2026-10-${dayNum}`;
          const matchingRows = rows.filter((r) => r.properties["prop-date"] === dateStr);

          return (
            <div
              key={i}
              className="h-20 bg-[#12131b] border border-white/[0.06] rounded-xl p-2 text-left flex flex-col justify-between hover:border-cyan-500/30 transition shadow-inner"
            >
              <span className="text-[10px] text-slate-400 font-mono">{dayNum} Oct</span>
              <div className="space-y-1">
                {matchingRows.map((r) => (
                  <div
                    key={r.id}
                    className="text-[9px] bg-cyan-600/20 text-cyan-300 p-1 rounded-md truncate border border-cyan-500/20 font-medium"
                    title={r.properties["prop-title"]}
                  >
                    {r.properties["prop-title"]}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
