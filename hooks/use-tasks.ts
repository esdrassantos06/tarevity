import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, TaskStatus, TaskPriority } from '@/lib/generated/prisma/client';
import { getTaskCounts } from '@/actions/profile-actions';
import { TaskCounts } from '@/types/TaskCount';
import { CACHE_TTL } from '@/lib/cache';

type FilterStatus = 'ALL' | keyof typeof TaskStatus;
type FilterPriority = 'ALL' | keyof typeof TaskPriority;
type SortBy = 'createdAt' | 'dueDate';
type SortOrder = 'asc' | 'desc';

interface UseTasksParams {
  page: number;
  pageSize: number;
  searchQuery: string;
  filter: FilterStatus;
  priorityFilter: FilterPriority;
  sortBy: SortBy;
  sortOrder: SortOrder;
  enabled?: boolean;
}

interface TasksResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useTasks({
  page,
  pageSize,
  searchQuery,
  filter,
  priorityFilter,
  sortBy,
  sortOrder,
  enabled = true,
}: UseTasksParams) {
  const queryKey = [
    'tasks',
    page,
    pageSize,
    searchQuery.trim(),
    filter,
    priorityFilter,
    sortBy,
    sortOrder,
  ] as const;

  return useQuery<TasksResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      if (filter !== 'ALL') {
        params.append('status', filter);
      }

      if (priorityFilter !== 'ALL') {
        params.append('priority', priorityFilter);
      }

      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return res.json();
    },
    enabled,
  });
}

export function useTaskCounts(enabled: boolean = true) {
  return useQuery<TaskCounts>({
    queryKey: ['task-counts'],
    queryFn: async () => {
      return await getTaskCounts();
    },
    enabled,
    staleTime: CACHE_TTL.SHORT * 1000,
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: string;
      status: TaskStatus;
    }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update task status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks-calendar'],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks-stats'],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['task-counts'],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
        refetchType: 'active',
      });
    },
  });
}
