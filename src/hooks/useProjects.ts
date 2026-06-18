import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { projectsApi, type CreateProjectRequest, type UpdateProjectRequest } from '@/api/projects.api'
import { getAuthToken } from '@/services/auth-token'
import type { Project } from '@/types/project'

export function useProjects(workspaceId?: string, includeArchived = false) {
  const queryClient = useQueryClient()
  const queryKey = ['projects', workspaceId, includeArchived] as const
  const query = useQuery({
    queryKey,
    queryFn: () => projectsApi.list(workspaceId!, includeArchived),
    enabled: Boolean(workspaceId && getAuthToken()),
    staleTime: 5 * 60 * 1000,
  })

  function updateCaches(project: Project) {
    queryClient.setQueryData<Project[]>(queryKey, current => {
      if (!current) return current
      const exists = current.some(item => item.id === project.id)
      const next = exists
        ? current.map(item => item.id === project.id ? project : item)
        : [...current, project]
      return next.filter(item => includeArchived || !item.archivedAt)
    })
  }

  const createMutation = useMutation({
    mutationFn: (input: Omit<CreateProjectRequest, 'workspaceId'>) => projectsApi.create({
      workspaceId: workspaceId!,
      ...input,
    }),
    onSuccess: project => {
      updateCaches(project)
      void queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectRequest }) => projectsApi.update(id, input),
    onSuccess: project => {
      updateCaches(project)
      void queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: projectsApi.archive,
    onSuccess: project => {
      updateCaches(project)
      void queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] })
    },
  })

  const restoreMutation = useMutation({
    mutationFn: projectsApi.restore,
    onSuccess: project => {
      updateCaches(project)
      void queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] })
    },
  })

  return {
    projects: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error
      ?? createMutation.error
      ?? updateMutation.error
      ?? archiveMutation.error
      ?? restoreMutation.error,
    refresh: query.refetch,
    createProject: createMutation.mutateAsync,
    updateProject: (id: string, input: UpdateProjectRequest) => updateMutation.mutateAsync({ id, input }),
    archiveProject: archiveMutation.mutateAsync,
    restoreProject: restoreMutation.mutateAsync,
  }
}
