import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '@/lib/api'
import { toast } from 'react-toastify'

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
    staleTime: 10 * 60 * 1000, // Cache the result for 10 minutes
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
      toast.success('Account created successfully! Please log in to continue.')
      queryClient.invalidateQueries({ queryKey: ['passwordCheck'] })
    },
    onError: (error: Error) => {
      console.error('Registration error:', error)
    },
  })
}
