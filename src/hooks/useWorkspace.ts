'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  ownerId: string;
}

interface UseWorkspaceReturn {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;
  switchWorkspace: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
}

export function useWorkspace(): UseWorkspaceReturn {
  const { data: session } = useSession();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch('/api/workspaces');
      if (!res.ok) {
        // If no workspace API exists yet, create a default workspace object
        const defaultWorkspace: Workspace = {
          id: 'default',
          name: 'My Workspace',
          slug: 'default',
          ownerId: session.user.id || 'unknown',
        };
        setWorkspaces([defaultWorkspace]);
        setCurrentWorkspace(defaultWorkspace);
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      const ws = Array.isArray(data) ? data : data.workspaces || [];
      setWorkspaces(ws);
      if (ws.length > 0) {
        // Check localStorage for last used workspace
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('kd-workspace-id') : null;
        const saved = ws.find((w: Workspace) => w.id === savedId);
        setCurrentWorkspace(saved || ws[0]);
      }
    } catch {
      // Fallback to default workspace
      const defaultWorkspace: Workspace = {
        id: 'default',
        name: 'My Workspace',
        slug: 'default',
        ownerId: session.user.id || 'unknown',
      };
      setWorkspaces([defaultWorkspace]);
      setCurrentWorkspace(defaultWorkspace);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  const switchWorkspace = (workspaceId: string) => {
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (ws) {
      setCurrentWorkspace(ws);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kd-workspace-id', workspaceId);
      }
    }
  };

  return {
    currentWorkspace,
    workspaces,
    isLoading,
    error,
    switchWorkspace,
    refreshWorkspaces: fetchWorkspaces,
  };
}
