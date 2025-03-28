'use client'
import React from 'react'
import { useTranslations } from 'next-intl'
import { FaEnvelope, FaPencilAlt } from 'react-icons/fa'

interface ProfileHeaderProps {
  profileData: {
    name: string
    email: string
    provider?: string | null
  }
  onEdit: () => void
}

export default function ProfileHeader({
  profileData,
  onEdit,
}: ProfileHeaderProps) {
  const t = useTranslations('profile.header')

  const formatLoginMethod = (provider?: string | null) => {
    if (!provider) return t('defaultLoginMethod')
    return provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {profileData.name || t('defaultName')}
        </h2>
        <button
          onClick={onEdit}
          className="inline-flex items-center rounded-md border border-transparent p-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none dark:text-blue-400 dark:hover:text-blue-300"
          aria-label={t('editProfileAriaLabel')}
        >
          <FaPencilAlt className="size-4" />
          <span className="ml-1">{t('editProfile')}</span>
        </button>
      </div>
      <div className="mt-2 flex items-center text-gray-600 dark:text-gray-400">
        <FaEnvelope className="mr-2 size-4" />
        <span>{profileData.email}</span>
      </div>
      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            {t('loginMethod')}: {formatLoginMethod(profileData.provider)}
          </p>
        </div>
      </div>
    </div>
  )
}
