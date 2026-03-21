'use client';
import { useState, useCallback, useRef } from 'react';
import { Plus, Trash2, Edit2, Check, X, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MindNode {
  id: string;
  text: string;
  color: string;
  children: MindNode[];
  x?: number;
  y?: number;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

interface NodeCardProps {
  node: MindNode;
  depth: number;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
}

function NodeCard({ node, depth, onAddChild, onDelete, onUpdate }: NodeCardProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(node.text);

  const save = () => {
    onUpdate(node.id, val);
    setEditing(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="group relative rounded-xl px-4 py-2 text-white font-medium shadow-lg cursor-pointer min-w-[120px] text-center"
        style={{ backgroundColor: node.color, opacity: depth === 0 ? 1 : 0.85 + depth * 0.05 }}
      >
        {editing ? (
          <div className="flex items-center gap-1">
            <Input
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
              className="h-6 w-32 text-sm text-black"
              autoFocus
            />
            <button onClick={save}><Check className="h-3 w-3" /></button>
            <button onClick={() => setEditing(false)}><X className="h-3 w-3" /></button>
          </div>
        ) : (
          <span onDoubleClick={() => setEditing(true)}>{node.text}</span>
        )}
        <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-1">
          <button
            onClick={() => onAddChild(node.id)}
            className="bg-white text-gray-700 rounded-full p-0.5 shadow hover:bg-gray-100"
          >
            <Plus className="h-3 w-3" />
          </button>
          {depth > 0 && (
            <button
              onClick={() => onDelete(node.id)}
              className="bg-red-500 text-white rounded-full p-0.5 shadow"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-500 text-white rounded-full p-0.5 shadow"
          >
            <Edit2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      {node.children.length > 0 && (
        <div className="flex gap-6 mt-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-400" />
          {node.children.map(child => (
            <div key={child.id} className="flex flex-col items-center">
              <div className="w-px h-4 bg-gray-400 mx-auto" />
              <NodeCard
                node={child}
                depth={depth + 1}
                onAddChild={onAddChild}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function addChildToTree(tree: MindNode, parentId: string, newNode: MindNode): MindNode {
  if (tree.id === parentId) {
    return { ...tree, children: [...tree.children, newNode] };
  }
  return {
    ...tree,
    children: tree.children.map(c => addChildToTree(c, parentId, newNode)),
  };
}

function deleteFromTree(tree: MindNode, id: string): MindNode {
  return {
    ...tree,
    children: tree.children
      .filter(c => c.id !== id)
      .map(c => deleteFromTree(c, id)),
  };
}

function updateInTree(tree: MindNode, id: string, text: string): MindNode {
  if (tree.id === id) return { ...tree, text };
  return { ...tree, children: tree.children.map(c => updateInTree(c, id, text)) };
}

const initialTree: MindNode = {
  id: 'root',
  text: 'KaryaDhara',
  color: '#6366f1',
  children: [
    {
      id: 'n1',
      text: 'Tasks',
      color: '#8b5cf6',
      children: [
        { id: 'n1a', text: 'Inbox', color: '#8b5cf6', children: [] },
        { id: 'n1b', text: 'My Day', color: '#8b5cf6', children: [] },
      ],
    },
    {
      id: 'n2',
      text: 'Projects',
      color: '#ec4899',
      children: [
        { id: 'n2a', text: 'Planning', color: '#ec4899', children: [] },
        { id: 'n2b', text: 'In Progress', color: '#ec4899', children: [] },
      ],
    },
    {
      id: 'n3',
      text: 'Goals',
      color: '#10b981',
      children: [
        { id: 'n3a', text: 'Q1 Goals', color: '#10b981', children: [] },
      ],
    },
  ],
};

export default function MindMapPage() {
  const [tree, setTree] = useState<MindNode>(initialTree);
  const colorIdx = useRef(2);

  const handleAddChild = useCallback((parentId: string) => {
    const color = COLORS[colorIdx.current % COLORS.length];
    colorIdx.current++;
    const newNode: MindNode = { id: generateId(), text: 'New Node', color, children: [] };
    setTree(prev => addChildToTree(prev, parentId, newNode));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTree(prev => deleteFromTree(prev, id));
  }, []);

  const handleUpdate = useCallback((id: string, text: string) => {
    setTree(prev => updateInTree(prev, id, text));
  }, []);

  const countNodes = (node: MindNode): number =>
    1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-primary" />
              Mind Map
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Visualize and organize your ideas. Double-click nodes to edit. Hover for actions.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Badge variant="outline">{countNodes(tree)} nodes</Badge>
            <Button onClick={() => handleAddChild('root')} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Branch
            </Button>
          </div>
        </div>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground flex flex-wrap gap-4">
            <span>• <strong>Hover</strong> a node to see actions (+, edit, delete)</span>
            <span>• <strong>Double-click</strong> a node to edit its text</span>
            <span>• <strong>Click +</strong> to add a child node</span>
            <span>• <strong>Click trash</strong> to delete a branch</span>
          </CardContent>
        </Card>

        <div className="bg-card border rounded-2xl p-8 overflow-auto min-h-[400px] flex items-start justify-center">
          <NodeCard
            node={tree}
            depth={0}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </div>
      </div>
    </div>
  );
}
