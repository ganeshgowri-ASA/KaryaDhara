"use client";
import { useState, useEffect } from "react";
import { Briefcase, Plus, Settings, Users, FolderOpen, Star, Archive, Trash2 } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  description: string;
  color: string;
  members: number;
  projects: number;
  starred: boolean;
  archived: boolean;
}

const COLORS = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-teal-500"];

export default function WorkspacePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<"all" | "starred" | "archived">("all");

  useEffect(() => {
    const saved = localStorage.getItem("kd-workspaces");
    if (saved) setWorkspaces(JSON.parse(saved));
    else {
      const defaults: Workspace[] = [
        { id: "1", name: "Personal", description: "Personal tasks and projects", color: "bg-blue-500", members: 1, projects: 3, starred: true, archived: false },
        { id: "2", name: "Work", description: "Professional workspace", color: "bg-green-500", members: 5, projects: 8, starred: false, archived: false },
        { id: "3", name: "Side Projects", description: "Hobby and side projects", color: "bg-purple-500", members: 2, projects: 4, starred: false, archived: false },
      ];
      setWorkspaces(defaults);
    }
  }, []);

  useEffect(() => {
    if (workspaces.length > 0) localStorage.setItem("kd-workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

  const createWorkspace = () => {
    if (!name.trim()) return;
    const ws: Workspace = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      members: 1,
      projects: 0,
      starred: false,
      archived: false,
    };
    setWorkspaces((prev) => [...prev, ws]);
    setName("");
    setDescription("");
    setShowCreate(false);
  };

  const toggleStar = (id: string) => setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, starred: !w.starred } : w)));
  const toggleArchive = (id: string) => setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, archived: !w.archived } : w)));
  const deleteWorkspace = (id: string) => setWorkspaces((prev) => prev.filter((w) => w.id !== id));

  const filtered = workspaces.filter((w) => {
    if (filter === "starred") return w.starred && !w.archived;
    if (filter === "archived") return w.archived;
    return !w.archived;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-indigo-600" /> Workspaces
        </h1>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> New Workspace
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {(["all", "starred", "archived"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              filter === f ? "bg-white dark:bg-gray-700 shadow-sm" : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-3">
          <h3 className="font-semibold">Create Workspace</h3>
          <input type="text" placeholder="Workspace name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-transparent" />
          <input type="text" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-transparent" />
          <div className="flex gap-2">
            <button onClick={createWorkspace} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ws) => (
          <div key={ws.id} className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
            <div className={`${ws.color} h-2`} />
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{ws.name}</h3>
                  <p className="text-sm text-gray-500">{ws.description}</p>
                </div>
                <button onClick={() => toggleStar(ws.id)} className={ws.starred ? "text-yellow-500" : "text-gray-300 hover:text-yellow-500"}>
                  <Star className="w-5 h-5" fill={ws.starred ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {ws.members}</span>
                <span className="flex items-center gap-1"><FolderOpen className="w-4 h-4" /> {ws.projects} projects</span>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <button onClick={() => toggleArchive(ws.id)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <Archive className="w-3.5 h-3.5" /> {ws.archived ? "Unarchive" : "Archive"}
                </button>
                <button onClick={() => deleteWorkspace(ws.id)} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 ml-auto">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-8">No workspaces found</p>
      )}
    </div>
  );
}
