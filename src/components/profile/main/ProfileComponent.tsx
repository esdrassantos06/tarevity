'use client'

import React, { useEffect } from 'react'
import ProfileManager from './ProfileManager'
import { useProfileQuery } from '@/hooks/useProfileQuery'
import { toast } from 'react-toastify'

export default function ProfileComponent() {
  const { data: profileData, isLoading, error } = useProfileQuery()

  useEffect(() => {
    if (error) {
      console.error('Error fetching profile:', error)
      toast.error('Could not load your profile')
    }
  }, [error])

  if (isLoading && !profileData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return <ProfileManager />
}
