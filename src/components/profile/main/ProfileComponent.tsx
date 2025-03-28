'use client'
import React, { useEffect } from 'react'
import ProfileManager from './ProfileManager'
import { useProfileQuery } from '@/hooks/useProfileQuery'
import { toast } from 'react-toastify'
import { useTranslations } from 'next-intl'

export default function ProfileComponent() {
  const t = useTranslations('profile.component')
  const { data: profileData, isLoading, error } = useProfileQuery()

  useEffect(() => {
    if (error) {
      console.error('Error fetching profile:', error)
      toast.error(t('errors.loadFailed'))
    }
  }, [error, t])

  if (isLoading && !profileData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return <ProfileManager />
}
