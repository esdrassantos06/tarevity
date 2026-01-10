import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { SuccessResponse } from '@/lib/api-response';

type TasksApiResponse = SuccessResponse<{
  user: {
    id: string;
    name: string | null;
  };
  tasks: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>;

global.fetch = vi.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  return Wrapper;
};

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch tasks successfully', async () => {
    const mockApiResponse = {
      data: {
        user: {
          id: 'user-1',
          name: 'Test User',
        },
        tasks: [
          { id: '1', title: 'Task 1', status: 'ACTIVE' },
          { id: '2', title: 'Task 2', status: 'COMPLETED' },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const { result } = renderHook(
      () =>
        useTasks({
          page: 1,
          pageSize: 10,
          searchQuery: '',
          filter: 'ALL',
          priorityFilter: 'ALL',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    if (result.current.data) {
      expect(result.current.data).toBeDefined();
      const data = result.current.data as unknown as
        | TasksApiResponse
        | {
            tasks: typeof mockApiResponse.data.tasks;
            pagination: typeof mockApiResponse.data.pagination;
          };
      if ('data' in data && data.data) {
        expect(data.data.tasks).toEqual(mockApiResponse.data.tasks);
        expect(data.data.pagination).toEqual(mockApiResponse.data.pagination);
      } else if ('tasks' in data) {
        expect(data.tasks).toEqual(mockApiResponse.data.tasks);
        expect(data.pagination).toEqual(mockApiResponse.data.pagination);
      }
    }
  });

  it('should handle errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(
      () =>
        useTasks({
          page: 1,
          pageSize: 10,
          searchQuery: '',
          filter: 'ALL',
          priorityFilter: 'ALL',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('should not fetch when enabled is false', () => {
    const { result } = renderHook(
      () =>
        useTasks({
          page: 1,
          pageSize: 10,
          searchQuery: '',
          filter: 'ALL',
          priorityFilter: 'ALL',
          sortBy: 'createdAt',
          sortOrder: 'desc',
          enabled: false,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.isFetching).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should include search query in request', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          tasks: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      }),
    } as Response);

    renderHook(
      () =>
        useTasks({
          page: 1,
          pageSize: 10,
          searchQuery: 'test query',
          filter: 'ALL',
          priorityFilter: 'ALL',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      const callUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(callUrl).toContain('search=test');
    });
  });
});
