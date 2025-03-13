import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileAPI } from '@/lib/api'
import { toast } from 'react-toastify'

export function useProfileQuery() {
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const result = await profileAPI.getProfile();
            if(result.error) throw new Error(result.error.message);
            return result.data;
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
            const result = await profileAPI.getStats();
            if(result.error) throw new Error(result.error.message);
            return result.data;
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
            toast.success('Profile updated successfully!');
        },
        onError: (error: Error) => {
            toast.error('Failed to update profile');
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
            toast.success('Your account has been successfully deleted');
        },
        onError: (error: Error) => {
            toast.error('Failed to delete account');
            console.error('Error deleting account:', error);
        }
    });
}