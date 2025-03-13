import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileAPI } from '@/lib/api'
import { showSuccess, showError } from '@/lib/toast'

export function useProfileQuery() {
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            try {
                const result = await profileAPI.getProfile();
                if(result.error) throw new Error(result.error.message);
                return result.data;
            } catch (error) {
                // Handle and transform the error
                showError(error instanceof Error ? error.message : 'Failed to load profile');
                // Re-throw to let React Query know the query failed
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        gcTime: 10 * 60 * 1000
    })
}

export function useStatsQuery() {
    return useQuery({
        queryKey: ['stats'],
        queryFn: async () => {
            try {
                const result = await profileAPI.getStats();
                if(result.error) throw new Error(result.error.message);
                return result.data;
            } catch (error) {
                // Handle and transform the error
                showError(error instanceof Error ? error.message : 'Failed to load statistics');
                // Re-throw to let React Query know the query failed
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
        gcTime: 10 * 60 * 1000
    })
}

export function useUpdateProfileMutation() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: { name: string }) => profileAPI.updateProfile(data),
        onSuccess: (response) => {
            queryClient.setQueryData(['profile'], response.data);
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            showSuccess('Profile updated successfully!');
        },
        onError: (error: Error) => {
            showError('Failed to update profile: ' + error.message);
            console.error('Error updating profile:', error);
        }
    });
}

export function useDeleteAccountMutation() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: () => profileAPI.deleteAccount(),
        onSuccess: () => {
            queryClient.clear();
            showSuccess('Your account has been successfully deleted');
        },
        onError: (error: Error) => {
            showError('Failed to delete account: ' + error.message);
            console.error('Error deleting account:', error);
        }
    });
}