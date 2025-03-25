import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IProject } from '@/lib/types';

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: Record<string, any> = {}) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (slug: string) => [...projectKeys.details(), slug] as const,
  featured: () => [...projectKeys.all, 'featured'] as const,
};

// API functions
const fetchProjects = async (params = {}): Promise<{ projects: IProject[] }> => {
    const searchParams = new URLSearchParams(params as Record<string, string>);
    const response = await fetch(`/api/projects?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

const fetchProjectBySlug = async (slug: string): Promise<IProject> => {
  const response = await fetch(`/api/projects?slug=${slug}`);
  if (!response.ok) throw new Error('Failed to fetch project');
  return response.json();
};

const fetchFeaturedProjects = async (): Promise<{ projects: IProject[] }> => {
  const response = await fetch('/api/projects?featured=true');
  if (!response.ok) throw new Error('Failed to fetch featured projects');
  return response.json();
};

const createProject = async (project: Omit<IProject, '_id'>): Promise<IProject> => {
  console.log("at db2 of projects")
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
  if (!response.ok) throw new Error('Failed to create project');
  return response.json();
};

const updateProject = async ({ id, data }: { id: string; data: Partial<IProject> }): Promise<IProject> => {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update project');
  return response.json();
};

const deleteProject = async (id: string): Promise<void> => {
  const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete project');
  return response.json();
};

// Hooks
export function useProjects(filters = {}) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => fetchProjects(filters),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: projectKeys.detail(slug),
    queryFn: () => fetchProjectBySlug(slug),
    enabled: !!slug, // Only run when slug is available
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
  });
}

export function useFeaturedProjects() {
  return useQuery({
    queryKey: projectKeys.featured(),
    queryFn: fetchFeaturedProjects,
    staleTime: 1000 * 60 * 30, // Consider data fresh for 30 minutes
  });
}

export function useCreateProject() {
  console.log("at db 1")
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.featured() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data._id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.featured() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.featured() });
    },
  });
}