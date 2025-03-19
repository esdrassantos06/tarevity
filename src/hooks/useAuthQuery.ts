import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '@/lib/api'
import { showError } from '@/lib/toast'

export function usePasswordCheckQuery(
  password: string,
  enabled: boolean = false,
) {
  return useQuery({
    queryKey: ['passwordCheck', password],
    queryFn: async () => {
      if (!password || password.length < 8) return null
      const result = await authAPI.checkPassword(password)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    enabled: enabled && !!password && password.length >= 8,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useRegisterMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string
      email: string
      password: string
    }) => authAPI.register(name, email, password),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwordCheck'] })
    },
    onError: (error) => {
      console.error('Unexpected registration error:', error)
      showError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred during registration',
      )
    },
  })
}
