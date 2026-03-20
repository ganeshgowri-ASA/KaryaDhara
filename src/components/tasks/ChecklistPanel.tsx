'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, CheckSquare, Square } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  position: number;
}

interface ChecklistPanelProps {
  taskId: string;
  items: ChecklistItem[];
  onAdd: (title: string) => void;
  onToggle: (itemId: string, completed: boolean) => void;
  onDelete: (itemId: string) => void;
  onReorder?: (items: ChecklistItem[]) => void;
}

export function ChecklistPanel({ taskId, items, onAdd, onToggle, onDelete }: ChecklistPanelProps) {
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium dark:text-gray-200">Checklist</span>
          <span className="text-xs text-gray-500">({completedCount}/{items.length})</span>
        </div>
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Items */}
      <div className="space-y-1">
        {items.sort((a, b) => a.position - b.position).map(item => (
          <div key={item.id} className="flex items-center gap-2 group px-1 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <GripVertical className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 cursor-grab" />
            <button onClick={() => onToggle(item.id, !item.completed)} className="flex-shrink-0">
              {item.completed ? (
                <CheckSquare className="w-4 h-4 text-blue-500" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <span className={`text-sm flex-1 ${item.completed ? 'line-through text-gray-400' : 'dark:text-gray-200'}`}>
              {item.title}
            </span>
            <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add item */}
      {isAdding ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setIsAdding(false); setNewItem(''); } }}
            placeholder="Add an item..."
            className="flex-1 text-sm px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <button onClick={handleAdd} className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Add</button>
          <button onClick={() => { setIsAdding(false); setNewItem(''); }} className="text-sm px-2 py-1 text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500">
          <Plus className="w-4 h-4" /> Add checklist item
        </button>
      )}
    </div>
  );
}
