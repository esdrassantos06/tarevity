'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import Image from 'next/image'
import {
  FaUser,
  FaEnvelope,
  FaPencilAlt,
  FaSave,
  FaTimes,
  FaClipboardList,
  FaClipboardCheck,
  FaClock,
} from 'react-icons/fa'
import { profileAPI } from '@/lib/api'

interface ProfileData {
  id: string
  name: string
  email: string
  image: string | null
  provider: string | null
}

interface UserStats {
  total: number
  completed: number
  pending: number
}

export default function ProfileComponent() {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
  })

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.id) return

      setIsLoading(true)
      try {
        const result = await profileAPI.getProfile()

        if (result.error) {
          throw new Error(result.error.message || 'Failed to load profile data')
        }

        if (result.data) {
          setProfileData(result.data)
          setFormData({
            name: result.data.name || '',
          })
        }

        // After loading profile, fetch the user statistics
        await fetchUserStats()
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Could not load your profile')
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchProfileData()
    }
  }, [session])

  // Function to fetch user task statistics
  const fetchUserStats = async () => {
    try {
      const result = await profileAPI.getStats()

      if (result.error) {
        throw new Error(result.error.message || 'Failed to load statistics')
      }

      if (result.data) {
        setUserStats(result.data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      toast.error('Could not load your statistics')
    }
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    // If there are unsaved changes, reset to original values
    if (formData.name !== profileData?.name) {
      if (
        window.confirm(
          'You have unsaved changes. Are you sure you want to discard them?',
        )
      ) {
        setFormData({
          name: profileData?.name || '',
        })
        setIsEditing(false)
      }
    } else {
      setIsEditing(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      const result = await profileAPI.updateProfile(formData)

      if (result.error) {
        throw new Error(result.error.message || 'Failed to update profile')
      }

      if (result.data) {
        setProfileData(result.data)

        // Update session data to reflect changes
        if (update) {
          await update({
            ...session,
            user: {
              ...session?.user,
              name: result.data.name,
            },
          })
        }

        toast.success('Profile updated successfully!')
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error updating profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !profileData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!session?.user || !profileData) {
    return (
      <div className="bg-cardLightMode dark:bg-cardDarkMode rounded-lg p-6 shadow">
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to view your profile.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-cardLightMode dark:bg-cardDarkMode overflow-hidden rounded-lg shadow">
      {/* Profile Header */}
      <div className="bg-secondary h-32"></div>

      <div className="px-6 py-8">
        <div className="flex flex-col items-center md:flex-row">
          {/* Profile Image */}
          <div className="relative -mt-16 mb-4 md:mr-6 md:mb-0">
            <div className="bg-backgroundLight border-borderLight dark:border-borderDark h-24 w-24 overflow-hidden rounded-full border-4">
              {profileData.image ? (
                <Image
                  src={profileData.image}
                  alt={profileData.name || 'Profile Picture'}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-100 dark:bg-blue-900">
                  <FaUser className="h-12 w-12 text-blue-500 dark:text-blue-300" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Info & Form */}
          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md p-2 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary hover:bg-primaryHover inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm outline-none"
                  >
                    <FaSave className="mr-2 -ml-1 h-4 w-4" />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm outline-none hover:bg-gray-50 dark:bg-zinc-600 dark:text-gray-200 dark:hover:bg-zinc-700"
                  >
                    <FaTimes className="mr-2 -ml-1 h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileData.name || 'User'}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center rounded-md border border-transparent p-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none dark:text-blue-400 dark:hover:text-blue-300"
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
            )}
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="border-t border-gray-200 px-6 py-6 dark:border-gray-700">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          Task Statistics
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {userStats ? userStats.total : '--'}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <FaClipboardList className="mr-1" />
              Created Tasks
            </div>
          </div>
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {userStats ? userStats.completed : '--'}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <FaClipboardCheck className="mr-1" />
              Completed Tasks
            </div>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/30">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {userStats ? userStats.pending : '--'}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <FaClock className="mr-1" />
              Pending
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
