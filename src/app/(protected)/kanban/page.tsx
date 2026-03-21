"use client";
import { useState, useEffect } from "react";
import { Plus, GripVertical, X, MoreHorizontal, Columns3 } from "lucide-react";

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  priority: "P1" | "P2" | "P3" | "P4";
  labels: string[];
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

const PRIORITY_COLORS = { P1: "bg-red-100 text-red-700", P2: "bg-orange-100 text-orange-700", P3: "bg-blue-100 text-blue-700", P4: "bg-gray-100 text-gray-700" };

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "backlog", title: "Backlog", color: "border-t-gray-400", cards: [
    { id: "1", title: "Research competitors", description: "Analyze top 5 competitors", priority: "P3", labels: ["research"] },
    { id: "2", title: "Design system setup", description: "Create color palette and typography", priority: "P2", labels: ["design"] },
  ]},
  { id: "todo", title: "To Do", color: "border-t-blue-400", cards: [
    { id: "3", title: "User authentication", description: "Implement login/signup flow", priority: "P1", labels: ["feature"] },
  ]},
  { id: "in-progress", title: "In Progress", color: "border-t-yellow-400", cards: [
    { id: "4", title: "Dashboard layout", description: "Build responsive dashboard", priority: "P2", labels: ["frontend"] },
  ]},
  { id: "review", title: "In Review", color: "border-t-purple-400", cards: [] },
  { id: "done", title: "Done", color: "border-t-green-400", cards: [
    { id: "5", title: "Project setup", description: "Initialize Next.js project", priority: "P3", labels: ["setup"] },
  ]},
];

export default function KanbanPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [dragCard, setDragCard] = useState<{ colId: string; cardId: string } | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("kd-kanban");
    if (saved) setColumns(JSON.parse(saved));
    else setColumns(DEFAULT_COLUMNS);
  }, []);

  useEffect(() => {
    if (columns.length > 0) localStorage.setItem("kd-kanban", JSON.stringify(columns));
  }, [columns]);

  const addCard = (colId: string) => {
    if (!newTitle.trim()) return;
    const card: KanbanCard = { id: crypto.randomUUID(), title: newTitle.trim(), description: "", priority: "P3", labels: [] };
    setColumns((prev) => prev.map((c) => (c.id === colId ? { ...c, cards: [...c.cards, card] } : c)));
    setNewTitle("");
    setAddingTo(null);
  };

  const deleteCard = (colId: string, cardId: string) => {
    setColumns((prev) => prev.map((c) => (c.id === colId ? { ...c, cards: c.cards.filter((k) => k.id !== cardId) } : c)));
  };

  const handleDragStart = (colId: string, cardId: string) => setDragCard({ colId, cardId });

  const handleDrop = (targetColId: string) => {
    if (!dragCard || dragCard.colId === targetColId) { setDragCard(null); return; }
    const sourceCol = columns.find((c) => c.id === dragCard.colId);
    const card = sourceCol?.cards.find((k) => k.id === dragCard.cardId);
    if (!card) return;
    setColumns((prev) =>
      prev.map((c) => {
        if (c.id === dragCard.colId) return { ...c, cards: c.cards.filter((k) => k.id !== dragCard.cardId) };
        if (c.id === targetColId) return { ...c, cards: [...c.cards, card] };
        return c;
      })
    );
    setDragCard(null);
  };

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Columns3 className="w-6 h-6 text-blue-600" /> Kanban Board
        </h1>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 200px)" }}>
        {columns.map((col) => (
          <div
            key={col.id}
            className={`flex-shrink-0 w-72 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-t-4 ${col.color}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}
          >
            <div className="p-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm">{col.title} <span className="text-gray-400 font-normal">({col.cards.length})</span></h3>
              <button onClick={() => setAddingTo(col.id)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="px-3 pb-3 space-y-2 min-h-[100px]">
              {col.cards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(col.id, card.id)}
                  className="bg-white dark:bg-gray-800 rounded-lg border p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow group"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">{card.title}</p>
                    <button onClick={() => deleteCard(col.id, card.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {card.description && <p className="text-xs text-gray-500 mt-1">{card.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_COLORS[card.priority]}`}>{card.priority}</span>
                    {card.labels.map((l) => (
                      <span key={l} className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30">{l}</span>
                    ))}
                  </div>
                </div>
              ))}

              {addingTo === col.id && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Card title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCard(col.id)}
                    className="w-full text-sm px-2 py-1 border rounded bg-transparent"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={() => addCard(col.id)} className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Add</button>
                    <button onClick={() => { setAddingTo(null); setNewTitle(""); }} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
