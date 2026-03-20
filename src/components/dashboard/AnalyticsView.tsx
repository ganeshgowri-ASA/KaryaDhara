'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  CheckCircle, Clock, AlertTriangle, FolderOpen, Users, TrendingUp,
  BarChart3, PieChart as PieIcon
} from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const STATUS_COLORS: Record<string, string> = {
  TODO: '#94A3B8', IN_PROGRESS: '#3B82F6', IN_REVIEW: '#F59E0B', DONE: '#10B981', CANCELLED: '#EF4444',
};

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalProjects: number;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  tasksByAssignee: { name: string; count: number; completed: number }[];
  projectProgress: { id: string; name: string; color: string; total: number; done: number; progress: number }[];
  weeklyTrend: { week: string; completed: number; created: number }[];
}

export function AnalyticsView() {
  const { currentWorkspace } = useWorkspace();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    fetch(`/api/analytics?workspaceId=${currentWorkspace.id}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentWorkspace?.id]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );

  if (!data) return <div className="p-6 text-center text-gray-500">No analytics data available</div>;

  const statusData = Object.entries(data.statusDistribution).map(([name, value]) => ({ name, value }));
  const priorityData = Object.entries(data.priorityDistribution).map(([name, value]) => ({ name, value }));
  const completionRate = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Analytics Dashboard</h1>
        <span className="text-sm text-gray-500">{currentWorkspace?.name}</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<CheckCircle className="w-5 h-5 text-green-500" />} label="Completed" value={data.completedTasks} subtext={`${completionRate}% completion rate`} color="green" />
        <KPICard icon={<Clock className="w-5 h-5 text-blue-500" />} label="Total Tasks" value={data.totalTasks} subtext="across all projects" color="blue" />
        <KPICard icon={<AlertTriangle className="w-5 h-5 text-red-500" />} label="Overdue" value={data.overdueTasks} subtext="need attention" color="red" />
        <KPICard icon={<FolderOpen className="w-5 h-5 text-purple-500" />} label="Projects" value={data.totalProjects} subtext="active projects" color="purple" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Weekly Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="created" stackId="1" stroke="#3B82F6" fill="#3B82F680" name="Created" />
              <Area type="monotone" dataKey="completed" stackId="2" stroke="#10B981" fill="#10B98180" name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
            <PieIcon className="w-5 h-5" /> Task Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Assignee */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5" /> Workload by Engineer
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.tasksByAssignee} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" name="Total" />
              <Bar dataKey="completed" fill="#10B981" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Project Progress
          </h3>
          <div className="space-y-4">
            {data.projectProgress.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium dark:text-gray-200">{project.name}</span>
                  <span className="text-gray-500">{project.done}/{project.total} ({project.progress}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${project.progress}%`, backgroundColor: project.color }} />
                </div>
              </div>
            ))}
            {data.projectProgress.length === 0 && <p className="text-gray-500 text-center py-8">No projects yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, subtext, color }: {
  icon: React.ReactNode; label: string; value: number; subtext: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };
  return (
    <div className={`rounded-xl p-4 border ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-sm text-gray-600 dark:text-gray-400">{label}</span></div>
      <div className="text-3xl font-bold dark:text-white">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{subtext}</div>
    </div>
  );
}
