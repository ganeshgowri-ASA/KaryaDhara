'use client';
import { useState } from 'react';
import { Plus, FolderOpen, CheckCircle2, Circle, ChevronRight, ChevronDown, Trash2, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  status: 'active' | 'completed' | 'on-hold';
  dueDate: string;
  subtasks: Subtask[];
  expanded: boolean;
}

const PROJECT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const initialProjects: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    color: '#6366f1',
    status: 'active',
    dueDate: '2025-04-30',
    expanded: true,
    subtasks: [
      { id: 's1', title: 'Design mockups', completed: true },
      { id: 's2', title: 'Frontend development', completed: true },
      { id: 's3', title: 'Backend API integration', completed: false },
      { id: 's4', title: 'Testing & QA', completed: false },
      { id: 's5', title: 'Deployment', completed: false },
    ],
  },
  {
    id: 'p2',
    name: 'Mobile App Launch',
    description: 'iOS and Android app development',
    color: '#ec4899',
    status: 'active',
    dueDate: '2025-06-15',
    expanded: false,
    subtasks: [
      { id: 's6', title: 'UI/UX Design', completed: true },
      { id: 's7', title: 'React Native setup', completed: false },
      { id: 's8', title: 'Push notifications', completed: false },
    ],
  },
  {
    id: 'p3',
    name: 'Q2 Marketing Campaign',
    description: 'Social media & content strategy',
    color: '#f59e0b',
    status: 'on-hold',
    dueDate: '2025-05-01',
    expanded: false,
    subtasks: [
      { id: 's9', title: 'Content calendar', completed: true },
      { id: 's10', title: 'Ad creatives', completed: false },
    ],
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [newProjectName, setNewProjectName] = useState('');
  const [addingProject, setAddingProject] = useState(false);
  const [newSubtask, setNewSubtask] = useState<{ [key: string]: string }>({});

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
    setProjects(prev => [...prev, {
      id: 'p' + Date.now(),
      name: newProjectName,
      description: 'New project',
      color,
      status: 'active',
      dueDate: '',
      expanded: true,
      subtasks: [],
    }]);
    setNewProjectName('');
    setAddingProject(false);
  };

  const toggleExpand = (id: string) =>
    setProjects(prev => prev.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p));

  const toggleSubtask = (pid: string, sid: string) =>
    setProjects(prev => prev.map(p => p.id === pid
      ? { ...p, subtasks: p.subtasks.map(s => s.id === sid ? { ...s, completed: !s.completed } : s) }
      : p
    ));

  const deleteProject = (id: string) =>
    setProjects(prev => prev.filter(p => p.id !== id));

  const addSubtask = (pid: string) => {
    const title = newSubtask[pid]?.trim();
    if (!title) return;
    setProjects(prev => prev.map(p => p.id === pid
      ? { ...p, subtasks: [...p.subtasks, { id: 's' + Date.now(), title, completed: false }] }
      : p
    ));
    setNewSubtask(prev => ({ ...prev, [pid]: '' }));
  };

  const deleteSubtask = (pid: string, sid: string) =>
    setProjects(prev => prev.map(p => p.id === pid
      ? { ...p, subtasks: p.subtasks.filter(s => s.id !== sid) }
      : p
    ));

  const getProgress = (p: Project) => p.subtasks.length === 0 ? 0
    : Math.round((p.subtasks.filter(s => s.completed).length / p.subtasks.length) * 100);

  const statusBadge = (s: Project['status']) => {
    const map = { active: 'bg-green-500/20 text-green-400', 'on-hold': 'bg-yellow-500/20 text-yellow-400', completed: 'bg-blue-500/20 text-blue-400' };
    return map[s];
  };

  const totalTasks = projects.reduce((a, p) => a + p.subtasks.length, 0);
  const completedTasks = projects.reduce((a, p) => a + p.subtasks.filter(s => s.completed).length, 0);

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-primary" />
              Projects
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{projects.length} projects &bull; {completedTasks}/{totalTasks} subtasks done</p>
          </div>
          <Button onClick={() => setAddingProject(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> New Project
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-sm text-muted-foreground">Total Subtasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{totalTasks > 0 ? Math.round(completedTasks/totalTasks*100) : 0}%</div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
            </CardContent>
          </Card>
        </div>

        {addingProject && (
          <Card className="mb-4 border-primary/50">
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Project name..."
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addProject()}
                  autoFocus
                />
                <Button onClick={addProject}>Create</Button>
                <Button variant="outline" onClick={() => setAddingProject(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {projects.map(project => {
            const progress = getProgress(project);
            return (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: project.color }} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{project.name}</CardTitle>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.dueDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{project.dueDate}
                        </span>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleExpand(project.id)}>
                        {project.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => deleteProject(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{project.subtasks.filter(s => s.completed).length}/{project.subtasks.length} subtasks</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </CardHeader>

                {project.expanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-1.5">
                      {project.subtasks.map(subtask => (
                        <div key={subtask.id} className="flex items-center gap-2 group p-1.5 rounded-lg hover:bg-muted/50">
                          <button onClick={() => toggleSubtask(project.id, subtask.id)}>
                            {subtask.completed
                              ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                              : <Circle className="h-4 w-4 text-muted-foreground" />}
                          </button>
                          <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {subtask.title}
                          </span>
                          <button
                            className="opacity-0 group-hover:opacity-100 text-red-400"
                            onClick={() => deleteSubtask(project.id, subtask.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Add subtask..."
                          value={newSubtask[project.id] || ''}
                          onChange={e => setNewSubtask(prev => ({ ...prev, [project.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addSubtask(project.id)}
                          className="h-8 text-sm"
                        />
                        <Button size="sm" variant="outline" onClick={() => addSubtask(project.id)}>
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
