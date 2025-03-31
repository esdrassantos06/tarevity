import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileAPI } from '@/lib/api'
import { showSuccess, showError } from '@/lib/toast'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'

interface QueryOptions {
  enabled?: boolean
  [key: string]: unknown
}

const PROFILE_CACHE_TIME = 30 * 60 * 1000
const PROFILE_STALE_TIME = 15 * 60 * 1000
const STATS_CACHE_TIME = 30 * 60 * 1000
const STATS_STALE_TIME = 10 * 60 * 1000

export function useProfileQuery(options: QueryOptions = {}) {
  const t = useTranslations('profileQuery')
  const { status, data: sessionData } = useSession()
  const isAuthenticated = status === 'authenticated'
  const userId = sessionData?.user?.id

  return useQuery({
    queryKey: ['profile', userId],
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
    staleTime: PROFILE_STALE_TIME,
    retry: isAuthenticated ? 1 : 0,
    gcTime: PROFILE_CACHE_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (oldData) => oldData,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export function useStatsQuery(options: QueryOptions = {}) {
  const t = useTranslations('profileQuery')
  const { status, data: sessionData } = useSession()
  const isAuthenticated = status === 'authenticated'
  const userId = sessionData?.user?.id

  return useQuery({
    queryKey: ['stats', userId],
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
    staleTime: STATS_STALE_TIME,
    retry: isAuthenticated ? 1 : 0,
    gcTime: STATS_CACHE_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

export function useUpdateProfileMutation() {
  const t = useTranslations('profileQuery')
  const queryClient = useQueryClient()
  const { data: sessionData } = useSession()
  const userId = sessionData?.user?.id

  return useMutation({
    mutationFn: (data: { name: string; image?: string | null }) =>
      profileAPI.updateProfile(data),
    onSuccess: (response) => {
      queryClient.setQueryData(['profile', userId], response.data)
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      queryClient.refetchQueries({ queryKey: ['profile'] })
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
  const { data: sessionData } = useSession()
  const userId = sessionData?.user?.id

  return useMutation({
    mutationFn: () => profileAPI.deleteProfileImage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      queryClient.refetchQueries({ queryKey: ['profile', userId] })
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
