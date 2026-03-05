/**
 * Cache TTL constants (in seconds)
 * These can be safely imported in client components
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 5 * 60, // 5 minutes
  LONG: 15 * 60, // 15 minutes
} as const;

/**
 * Cache key generators
 * These can be safely imported in client components
 */
export const cacheKeys = {
  tasks: (userId: string, page: number, filters: string) =>
    `tasks:${userId}:${page}:${filters}`,
  taskCount: (userId: string, status?: string) =>
    status ? `tasks:count:${userId}:${status}` : `tasks:count:${userId}`,
  taskStats: (userId: string) => `tasks:stats:${userId}`,
  notifications: (userId: string) => `notifications:${userId}`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  userStats: (userId: string) => `user:${userId}:stats`,
  task: (userId: string, taskId: string) => `task:${userId}:${taskId}`,
  calendar: (userId: string, month: number, year: number) =>
    `calendar:${userId}:${year}:${month}`,
  userTaskKeys: (userId: string) => `cache_keys:user_tasks:${userId}`,
};
