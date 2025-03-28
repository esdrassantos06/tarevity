import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileAPI } from '@/lib/api'
import { showSuccess, showError } from '@/lib/toast'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'

interface QueryOptions {
  enabled?: boolean
  [key: string]: unknown
}

export function useProfileQuery(options: QueryOptions = {}) {
  const t = useTranslations('profileQuery')
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const result = await profileAPI.getProfile()
        if (result.error) throw new Error(result.error.message)
        return result.data
      } catch (error) {
        const isProtectedRoute =
          typeof window !== 'undefined' &&
          ['/dashboard', '/profile', '/settings', '/todo'].some((path) =>
            window.location.pathname.startsWith(path),
          )

        if (isProtectedRoute) {
          showError(
            error instanceof Error ? error.message : t('failedToLoadProfile'),
          )
        }
        throw error
      }
    },
    ...options,
    enabled: isAuthenticated && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    retry: isAuthenticated ? 1 : 0,
    gcTime: 10 * 60 * 1000,
  })
}

export function useStatsQuery(options: QueryOptions = {}) {
  const t = useTranslations('profileQuery')
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      try {
        const result = await profileAPI.getStats()
        if (result.error) throw new Error(result.error.message)
        return result.data
      } catch (error) {
        const isProtectedRoute =
          typeof window !== 'undefined' &&
          ['/dashboard', '/profile', '/settings', '/todo'].some((path) =>
            window.location.pathname.startsWith(path),
          )

        if (isProtectedRoute) {
          showError(
            error instanceof Error
              ? error.message
              : t('failedToLoadStatistics'),
          )
        }
        throw error
      }
    },
    ...options,
    enabled: isAuthenticated && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    retry: isAuthenticated ? 1 : 0,
    gcTime: 10 * 60 * 1000,
  })
}

export function useUpdateProfileMutation() {
  const t = useTranslations('profileQuery')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; image?: string | null }) =>
      profileAPI.updateProfile(data),
    onSuccess: (response) => {
      queryClient.setQueryData(['profile'], response.data)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error: Error) => {
      showError(t('failedToUpdateProfile', { message: error.message }))
      console.error(t('errorUpdatingProfile'), error)
    },
  })
}

export function useUploadImageMutation() {
  const t = useTranslations('profileQuery')

  return useMutation({
    mutationFn: (file: File) => profileAPI.uploadProfileImage(file),
    onError: (error: Error) => {
      showError(t('failedToUploadImage', { message: error.message }))
      console.error(t('errorUploadingImage'), error)
    },
  })
}

export function useDeleteProfileImageMutation() {
  const t = useTranslations('profileQuery')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => profileAPI.deleteProfileImage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error: Error) => {
      showError(t('failedToRemoveProfileImage', { message: error.message }))
      console.error(t('errorDeletingProfileImage'), error)
    },
  })
}

export function useDeleteAccountMutation() {
  const t = useTranslations('profileQuery')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => profileAPI.deleteAccount(),
    onSuccess: () => {
      queryClient.clear()
      showSuccess(t('accountSuccessfullyDeleted'))
    },
    onError: (error: Error) => {
      showError(t('failedToDeleteAccount', { message: error.message }))
      console.error(t('errorDeletingAccount'), error)
    },
  })
}
