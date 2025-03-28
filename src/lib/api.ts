import axiosClient, { APIError, isAPIError } from './axios'

export interface Todo {
  id: string
  title: string
  description: string | null
  is_completed: boolean
  priority: number
  due_date: string | null
  created_at: string
  updated_at: string
  status: 'active' | 'review' | 'completed'
  user_id: string
}

export interface TodoFormData {
  title: string
  description?: string | null
  is_completed?: boolean
  priority: number
  due_date?: string | null
  status?: 'active' | 'review' | 'completed'
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
  isValid?: boolean
  errors?: string[]
}

export interface ImageUploadResponse {
  url: string
  filename: string
}

export interface ApiResult<T> {
  data: T | null
  error: APIError | null
  loading: boolean
}

// Usando chaves de tradução diretas
// Estas chaves serão traduzidas por componentes React quando exibidas
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
          : { message: 'api.unknownErrorDuringRegistration' },
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
          : { message: 'api.errorCheckingPasswordSecurity' },
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
          : { message: 'api.errorProcessingPasswordReset' },
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
          : { message: 'api.invalidOrExpiredToken' },
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
          : { message: 'api.errorCheckingCurrentPassword' },
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
          : { message: 'api.errorResettingPassword' },
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
      const isProtectedRoute =
        typeof window !== 'undefined' &&
        ['/dashboard', '/profile', '/settings', '/todo'].some((path) =>
          window.location.pathname.startsWith(path),
        )

      if (!isProtectedRoute) {
        return { data: null, error: null, loading: false }
      }

      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'api.errorLoadingProfile' },
        loading: false,
      }
    }
  },

  async updateProfile(data: {
    name: string
    image?: string | null
  }): Promise<ApiResult<ProfileData>> {
    try {
      const response = await axiosClient.put('/api/profile', data)
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'api.errorUpdatingProfile' },
        loading: false,
      }
    }
  },

  async uploadProfileImage(
    file: File,
  ): Promise<ApiResult<ImageUploadResponse>> {
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await axiosClient.post(
        '/api/profile/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'api.errorUploadingProfileImage' },
        loading: false,
      }
    }
  },

  async deleteProfileImage(): Promise<
    ApiResult<{ message: string; provider: string | null }>
  > {
    try {
      const response = await axiosClient.delete('/api/profile/delete-image')
      return { data: response.data, error: null, loading: false }
    } catch (error) {
      return {
        data: null,
        error: isAPIError(error)
          ? error
          : { message: 'api.errorDeletingProfileImage' },
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
          : { message: 'api.errorDeletingAccount' },
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
          : { message: 'api.errorLoadingStatistics' },
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
        error: isAPIError(error) ? error : { message: 'api.errorLoadingTasks' },
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
        error: isAPIError(error) ? error : { message: 'api.errorLoadingTask' },
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
        error: isAPIError(error) ? error : { message: 'api.errorCreatingTask' },
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
        error: isAPIError(error) ? error : { message: 'api.errorUpdatingTask' },
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
        error: isAPIError(error) ? error : { message: 'api.errorDeletingTask' },
        loading: false,
      }
    }
  },
}
