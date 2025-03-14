import axiosClient, { APIError, isAPIError } from './axios'

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  priority: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  status: 'active' | 'review' | 'completed';
}

export interface TodoFormData {
  title: string;
  description?: string | null;
  is_completed?: boolean;
  priority: number;
  due_date?: string | null;
  status?: 'active' | 'review' | 'completed';
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
  isCompromised: boolean   // Whether the password was found in data breaches
  strength: number         // Numeric strength score (0-100)
  isStrong: boolean        // Whether the password is considered strong
  isValid?: boolean        // Whether the password meets validation criteria
  errors?: string[]        // Any validation error messages
}

export interface ImageUploadResponse {
  url: string
  filename: string
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


  async updateProfile(data: { name: string, image?: string | null }): Promise<ApiResult<ProfileData>> {
    try {
      // Log the data being sent to the API
      
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

  async uploadProfileImage(file: File): Promise<ApiResult<ImageUploadResponse>> {
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await axiosClient.post('/api/profile/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })



      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'Error uploading profile image' },
        loading: false,
      }
    }
  },
  
  async deleteProfileImage(): Promise<ApiResult<{ message: string, provider: string | null }>> {
    try {
      const response = await axiosClient.delete('/api/profile/delete-image')
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'Error deleting profile image' },
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