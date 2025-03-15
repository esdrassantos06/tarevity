'use client'

import React from 'react'
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
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {profileData.name || 'User'}
        </h2>
        <button
          onClick={onEdit}
          className="inline-flex items-center rounded-md border border-transparent p-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none dark:text-blue-400 dark:hover:text-blue-300"
          aria-label="Edit profile"
        >
          <FaPencilAlt className="h-4 w-4" />
          <span className="ml-1">Edit</span>
        </button>
      </div>
      <div className="mt-2 flex items-center text-gray-600 dark:text-gray-400">
        <FaEnvelope className="mr-2 h-4 w-4" />
        <span>{profileData.email}</span>
      </div>
      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            Login method:{' '}
            {profileData.provider
              ? profileData.provider.charAt(0).toUpperCase() +
                profileData.provider.slice(1)
              : 'Email/Password'}
          </p>
        </div>
      </div>
    </div>
  )
}
