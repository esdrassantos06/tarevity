import axiosClient from './axios';

// Interfaces de tipos
export interface Todo {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  priority: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TodoFormData {
  title: string;
  description?: string | null;
  priority: number;
  due_date?: string | null;
  is_completed?: boolean;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  provider: string | null;
}

export interface UserStats {
  total: number;
  completed: number;
  pending: number;
}

export interface PasswordCheckResponse {
  isCompromised: boolean;
  strength: number;
  isStrong: boolean;
}

// APIs de Autenticação
export const authAPI = {
  async register(name: string, email: string, password: string) {
    const response = await axiosClient.post('/api/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  async checkPassword(password: string): Promise<PasswordCheckResponse> {
    const response = await axiosClient.post('/api/auth/check-password', {
      password,
    });
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await axiosClient.post('/api/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  async validateResetToken(token: string) {
    const response = await axiosClient.get(`/api/auth/validate-reset-token?token=${token}`);
    return response.data;
  },

  async resetPassword(token: string, password: string) {
    const response = await axiosClient.post('/api/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },
};

// APIs de Perfil
export const profileAPI = {
  async getProfile(): Promise<ProfileData> {
    const response = await axiosClient.get('/api/profile');
    return response.data;
  },

  async updateProfile(data: { name: string }): Promise<ProfileData> {
    const response = await axiosClient.put('/api/profile', data);
    return response.data;
  },

  async deleteAccount() {
    const response = await axiosClient.delete('/api/account/delete');
    return response.data;
  },

  async getStats(): Promise<UserStats> {
    const response = await axiosClient.get('/api/stats');
    return response.data;
  },
};

// APIs de Tarefas
export const todoAPI = {
  async getAllTodos(): Promise<Todo[]> {
    const response = await axiosClient.get('/api/todos');
    return response.data;
  },

  async getTodo(id: string): Promise<Todo> {
    const response = await axiosClient.get(`/api/todos/${id}`);
    return response.data;
  },

  async createTodo(todoData: TodoFormData): Promise<Todo> {
    const response = await axiosClient.post('/api/todos', todoData);
    return response.data;
  },

  async updateTodo(id: string, todoData: Partial<Todo>): Promise<Todo> {
    const response = await axiosClient.put(`/api/todos/${id}`, todoData);
    return response.data;
  },

  async deleteTodo(id: string) {
    const response = await axiosClient.delete(`/api/todos/${id}`);
    return response.data;
  },
};