import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '@/lib/api'
import { showError } from '@/lib/toast'
import { useTranslations } from 'next-intl'

export function usePasswordCheckQuery(
  password: string,
  enabled: boolean = false,
) {
  const t = useTranslations('authQuery')

  return useQuery({
    queryKey: ['passwordCheck', password],
    queryFn: async () => {
      if (!password || password.length < 8) return null
      const result = await authAPI.checkPassword(password)
      if (result.error) throw new Error(t('passwordCheckError'))
      return result.data
    },
    enabled: enabled && !!password && password.length >= 8,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useRegisterMutation() {
  const t = useTranslations('auth')
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
      queryClient.refetchQueries({ queryKey: ['passwordCheck'] })
    },
    onError: (error) => {
      console.error('Unexpected registration error:', error)
      showError(
        error instanceof Error
          ? error.message
          : t('unexpectedRegistrationError'),
      )
    },
  })
}
