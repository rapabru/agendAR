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
    <div className="rounded-xl border border-[#2f2f2f] bg-[#1e1e1e] p-4 text-[#e3e2e0] shadow-xl">
      {/* View Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2c2c2c] pb-3 mb-4">
        <div className="flex items-center gap-1 bg-[#252525] p-1 rounded-lg border border-[#333333]">
          <button
            onClick={() => setActiveView("board")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              activeView === "board"
                ? "bg-[#333333] text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Kanban className="w-3.5 h-3.5 text-blue-400" />
            <span>Tablero Kanban</span>
          </button>
          <button
            onClick={() => setActiveView("table")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              activeView === "table"
                ? "bg-[#333333] text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tabla</span>
          </button>
          <button
            onClick={() => setActiveView("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              activeView === "calendar"
                ? "bg-[#333333] text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>Calendario</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filtrar tareas..."
            className="bg-[#262626] border border-[#383838] px-2.5 py-1 rounded-md text-xs text-[#e3e2e0] outline-none placeholder-gray-500 w-40"
          />
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1 rounded-md font-medium transition"
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
          <div key={col} className="bg-[#242424] rounded-lg p-3 border border-[#2f2f2f] flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    col === "Completado"
                      ? "bg-emerald-500"
                      : col === "En Progreso"
                      ? "bg-blue-500"
                      : "bg-gray-400"
                  }`}
                />
                {col}
              </span>
              <span className="text-[11px] text-gray-400 bg-[#1c1c1c] px-1.5 py-0.5 rounded-full font-mono">
                {colRows.length}
              </span>
            </div>

            <div className="space-y-2 flex-1">
              {colRows.map((row) => (
                <div
                  key={row.id}
                  className="bg-[#2a2a2a] hover:bg-[#303030] p-3 rounded-lg border border-[#383838] transition shadow-sm group"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <button
                      onClick={() => onToggleDone(row.id)}
                      className="mt-0.5 text-gray-400 hover:text-emerald-400 transition"
                    >
                      {row.properties["prop-done"] ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-medium leading-snug flex-1 ${
                        row.properties["prop-done"] ? "line-through text-gray-500" : "text-[#e3e2e0]"
                      }`}
                    >
                      {row.properties["prop-title"]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-[#333333]">
                    <span className="px-1.5 py-0.5 rounded bg-[#1f1f1f] border border-[#383838]">
                      {row.properties["prop-priority"]}
                    </span>
                    <span className="font-mono text-gray-400">{row.properties["prop-date"]}</span>
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
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-[#2f2f2f] text-gray-400 uppercase tracking-wider text-[10px]">
            <th className="py-2 px-3 w-8">Listo</th>
            <th className="py-2 px-3">Tarea</th>
            <th className="py-2 px-3">Estado</th>
            <th className="py-2 px-3">Prioridad</th>
            <th className="py-2 px-3">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2a2a2a]">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-[#252525] transition">
              <td className="py-2 px-3">
                <button onClick={() => onToggleDone(row.id)}>
                  {row.properties["prop-done"] ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </td>
              <td className={`py-2 px-3 font-medium ${row.properties["prop-done"] ? "line-through text-gray-500" : ""}`}>
                {row.properties["prop-title"]}
              </td>
              <td className="py-2 px-3">
                <span className="px-2 py-0.5 rounded text-[11px] bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {row.properties["prop-status"]}
                </span>
              </td>
              <td className="py-2 px-3">
                <span className="px-2 py-0.5 rounded text-[11px] bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {row.properties["prop-priority"]}
                </span>
              </td>
              <td className="py-2 px-3 font-mono text-gray-400">{row.properties["prop-date"]}</td>
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
    <div className="p-4 bg-[#232323] rounded-lg border border-[#2f2f2f] text-center">
      <h4 className="text-sm font-semibold mb-2 flex items-center justify-center gap-2 text-emerald-400">
        <Calendar className="w-4 h-4" />
        Vista de Proyección de Tareas en Calendario
      </h4>
      <div className="grid grid-cols-7 gap-2 mt-4 text-xs">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} className="font-semibold text-gray-400 py-1 border-b border-[#333333]">
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
              className="h-20 bg-[#1c1c1c] border border-[#2d2d2d] rounded p-1 text-left flex flex-col justify-between"
            >
              <span className="text-[10px] text-gray-400">{dayNum} Oct</span>
              <div className="space-y-1">
                {matchingRows.map((r) => (
                  <div
                    key={r.id}
                    className="text-[9px] bg-blue-600/30 text-blue-300 p-0.5 rounded truncate border border-blue-500/20"
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
