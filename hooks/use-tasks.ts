import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/lib/generated/prisma/browser';
import { TaskStatus, TaskPriority } from '@/lib/generated/prisma/enums';
import { TaskCounts } from '@/types/TaskCount';
import { CACHE_TTL } from '@/lib/cache-constants';

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
      const res = await fetch('/api/tasks/counts');
      if (!res.ok) {
        throw new Error('Failed to fetch task counts');
      }
      return res.json();
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
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      await queryClient.cancelQueries({ queryKey: ['tasks-calendar'] });
      await queryClient.cancelQueries({ queryKey: ['tasks-stats'] });
      await queryClient.cancelQueries({ queryKey: ['task-counts'] });

      const previousTasksQueries = queryClient.getQueriesData({
        queryKey: ['tasks'],
      });
      const previousCalendarQueries = queryClient.getQueriesData({
        queryKey: ['tasks-calendar'],
      });
      const previousStatsQueries = queryClient.getQueriesData({
        queryKey: ['tasks-stats'],
      });
      const previousCountsQueries = queryClient.getQueriesData({
        queryKey: ['task-counts'],
      });

      queryClient.setQueriesData<TasksResponse>(
        { queryKey: ['tasks'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks.map((task) =>
              task.id === taskId ? { ...task, status } : task,
            ),
          };
        },
      );

      queryClient.setQueriesData<Task[]>(
        { queryKey: ['tasks-calendar'] },
        (old) => {
          if (!old) return old;
          return old.map((task) =>
            task.id === taskId ? { ...task, status } : task,
          );
        },
      );

      return {
        previousTasksQueries,
        previousCalendarQueries,
        previousStatsQueries,
        previousCountsQueries,
      };
    },
    onError: (error, variables, context) => {
      if (context) {
        context.previousTasksQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
        context.previousCalendarQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
        context.previousStatsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
        context.previousCountsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks-calendar'],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks-stats'],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: ['task-counts'],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
        refetchType: 'none',
      });
    },
    onSettled: () => {
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
