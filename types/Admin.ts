export interface AdminUser {
  id: string;
  name: string;
  email: string;
  tasksCount: number;
  role?: string | null;
  banned?: boolean | null;
  createdAt: Date;
}

export interface ListUsersResult {
  users: AdminUser[];
  total: number;
  limit?: number;
  offset?: number;
}
