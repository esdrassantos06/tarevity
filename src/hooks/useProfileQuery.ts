import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileAPI } from '@/lib/api'
import { showSuccess, showError } from '@/lib/toast'
import { useSession } from 'next-auth/react'


interface QueryOptions {
  enabled?: boolean;
  [key: string]: unknown;
}

export function useProfileQuery(options: QueryOptions = {}) {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const result = await profileAPI.getProfile();
        if (result.error) throw new Error(result.error.message);
        return result.data;
      } catch (error) {
        const isProtectedRoute = typeof window !== 'undefined' && 
          ['/dashboard', '/profile', '/settings', '/todo'].some(path => 
            window.location.pathname.startsWith(path)
          );
          
        if (isProtectedRoute) {
          showError(
            error instanceof Error ? error.message : 'Failed to load profile',
          );
        }
        throw error;
      }
    },
    ...options,
    enabled: isAuthenticated && (options.enabled !== false),
    staleTime: 5 * 60 * 1000,
    retry: isAuthenticated ? 1 : 0,
    gcTime: 10 * 60 * 1000,
  });
}

export function useStatsQuery(options: QueryOptions = {}) {
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
        const isProtectedRoute = typeof window !== 'undefined' && 
          ['/dashboard', '/profile', '/settings', '/todo'].some(path => 
            window.location.pathname.startsWith(path)
          );
          
        if (isProtectedRoute) {
          showError(
            error instanceof Error ? error.message : 'Failed to load statistics',
          );
        }
        throw error
      }
    },
    ...options,
    enabled: isAuthenticated && (options.enabled !== false),
    staleTime: 5 * 60 * 1000,
    retry: isAuthenticated ? 1 : 0,
    gcTime: 10 * 60 * 1000,
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; image?: string | null }) =>
      profileAPI.updateProfile(data),
    onSuccess: (response) => {
      queryClient.setQueryData(['profile'], response.data)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error: Error) => {
      showError('Failed to update profile: ' + error.message)
      console.error('Error updating profile:', error)
    },
  })
}

export function useUploadImageMutation() {
  return useMutation({
    mutationFn: (file: File) => profileAPI.uploadProfileImage(file),
    onError: (error: Error) => {
      showError('Failed to upload image: ' + error.message)
      console.error('Error uploading image:', error)
    },
  })
}

export function useDeleteProfileImageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => profileAPI.deleteProfileImage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error: Error) => {
      showError('Failed to remove profile image: ' + error.message)
      console.error('Error deleting profile image:', error)
    },
  })
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => profileAPI.deleteAccount(),
    onSuccess: () => {
      queryClient.clear()
      showSuccess('Your account has been successfully deleted')
    },
    onError: (error: Error) => {
      showError('Failed to delete account: ' + error.message)
      console.error('Error deleting account:', error)
    },
  })
}