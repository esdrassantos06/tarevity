import axiosClient, { APIError, isAPIError } from './axios'

// Type definitions (you already have good ones)
export interface Todo {
  id: string
  title: string
  description: string | null
  is_completed: boolean
  priority: number
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TodoFormData {
  title: string
  description?: string | null
  priority: number
  due_date?: string | null
  is_completed?: boolean
}

export interface ProfileData {
  id: string
  name: string
  email: string
  image: string | null
  provider: string | null
}

export interface UserStats {
  total: number
  completed: number
  pending: number
}

export interface PasswordCheckResponse {
  isCompromised: boolean
  strength: number
  isStrong: boolean
}

// Result type for all API functions with better error handling
export interface ApiResult<T> {
  data: T | null
  error: APIError | null
  loading: boolean
}

// Auth API with improved error handling
export const authAPI = {
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<ApiResult<{ id: string }>> {
    try {
      const response = await axiosClient.post('/api/auth/register', {
        name,
        email,
        password,
      })
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'Unknown error during registration' },
        loading: false,
      }
    }
  },

  async checkPassword(
    password: string,
  ): Promise<ApiResult<PasswordCheckResponse>> {
    try {
      const response = await axiosClient.post('/api/auth/check-password', {
        password,
      })
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'Error checking password security' },
        loading: false,
      }
    }
  },

  async forgotPassword(email: string): Promise<ApiResult<{ message: string }>> {
    try {
      const response = await axiosClient.post('/api/auth/forgot-password', {
        email,
      })
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'Error processing password reset' },
        loading: false,
      }
    }
  },

  async validateResetToken(
    token: string,
  ): Promise<ApiResult<{ userId: string }>> {
    try {
      const response = await axiosClient.get(
        `/api/auth/validate-reset-token?token=${token}`,
      )
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'Invalid or expired token' },
        loading: false,
      }
    }
  },

  async checkCurrentPassword(
    token: string,
    password: string,
  ): Promise<ApiResult<{ isCurrentPassword: boolean }>> {
    try {
      const response = await axiosClient.post(
        '/api/auth/check-current-password',
        { token, password },
      )
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'Error checking current password' },
        loading: false,
      }
    }
  },

  async resetPassword(
    token: string,
    password: string,
  ): Promise<ApiResult<{ message: string }>> {
    try {
      const response = await axiosClient.post('/api/auth/reset-password', {
        token,
        password,
      })
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'Error resetting password' },
        loading: false,
      }
    }
  },
}

// Profile API with improved error handling
export const profileAPI = {
  async getProfile(): Promise<ApiResult<ProfileData>> {
    try {
      const response = await axiosClient.get('/api/profile')
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error) ? error : { message: 'Error loading profile' },
        loading: false,
      }
    }
  },

  async updateProfile(data: { name: string }): Promise<ApiResult<ProfileData>> {
    try {
      const response = await axiosClient.put('/api/profile', data)
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'Error updating profile' },
        loading: false,
      }
    }
  },

  async deleteAccount(): Promise<ApiResult<{ message: string }>> {
    try {
      const response = await axiosClient.delete('/api/account/delete')
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'Error deleting account' },
        loading: false,
      }
    }
  },

  async getStats(): Promise<ApiResult<UserStats>> {
    try {
      const response = await axiosClient.get('/api/stats')
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'Error loading statistics' },
        loading: false,
      }
    }
  },
}

// Todo API with improved error handling
export const todoAPI = {
  async getAllTodos(): Promise<ApiResult<Todo[]>> {
    try {
      const response = await axiosClient.get('/api/todos')
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error) ? error : { message: 'Error loading tasks' },
        loading: false,
      }
    }
  },

  async getTodo(id: string): Promise<ApiResult<Todo>> {
    try {
      const response = await axiosClient.get(`/api/todos/${id}`)
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error) ? error : { message: 'Error loading task' },
        loading: false,
      }
    }
  },

  async createTodo(todoData: TodoFormData): Promise<ApiResult<Todo>> {
    try {
      const response = await axiosClient.post('/api/todos', todoData)
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error) ? error : { message: 'Error creating task' },
        loading: false,
      }
    }
  },

  async updateTodo(
    id: string,
    todoData: Partial<Todo>,
  ): Promise<ApiResult<Todo>> {
    try {
      const response = await axiosClient.put(`/api/todos/${id}`, todoData)
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error) ? error : { message: 'Error updating task' },
        loading: false,
      }
    }
  },

  async deleteTodo(id: string): Promise<ApiResult<{ message: string }>> {
    try {
      const response = await axiosClient.delete(`/api/todos/${id}`)
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error) ? error : { message: 'Error deleting task' },
        loading: false,
      }
    }
  },
}
