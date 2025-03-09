'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { toast } from 'react-toastify'
import { FaMoon, FaSun, FaDesktop, FaUserCircle } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

interface ProfileData {
  id: string
  name: string
  email: string
  image: string | null
  provider: string | null
}

export default function SettingsComponent() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('appearance')
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.id) return

      setIsLoadingProfile(true)
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to load profile data')
        }

        const data = await response.json()
        setProfileData(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Could not load your profile information')
      } finally {
        setIsLoadingProfile(false)
      }
    }

    if (session?.user) {
      fetchProfileData()
    }
  }, [session])

  // Function to handle theme change
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    toast.success(
      `Theme changed to ${
        newTheme === 'dark'
          ? 'dark'
          : newTheme === 'light'
            ? 'light'
            : 'system'
      }`
    )
  }

  // Function to handle account deletion
  const handleDeleteAccount = async () => {
    // Show a confirmation dialog to prevent accidental deletions
    if (
      !confirm(
        'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      )
    ) {
      return
    }

    // Double-check with a more serious warning
    if (
      !confirm(
        'WARNING: This is a permanent action. All your tasks and data will be lost. Do you want to continue?',
      )
    ) {
      return
    }

    try {
      setIsDeleting(true)

      // Make an API call to delete the user account
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Error deleting account')
      }

      // Show success message
      toast.success('Your account has been successfully deleted')

      // Sign out the user
      await signOut({ redirect: false })

      // Redirect to home page
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'An error occurred while deleting your account'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  if (!session) {
    return (
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to access settings.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-cardLightMode dark:bg-cardDarkMode overflow-hidden rounded-lg shadow">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar / Tab Navigation */}
        <div className="w-full border-b border-gray-200 md:w-64 md:border-r md:border-b-0 dark:border-gray-700">
          <nav className="space-y-1 p-4">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex w-full items-center rounded-md px-4 py-2 text-sm transition-colors ${
                activeTab === 'appearance'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <FaDesktop className="mr-3 h-4 w-4" />
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`flex w-full items-center rounded-md px-4 py-2 text-sm transition-colors ${
                activeTab === 'account'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <FaUserCircle className="mr-3 h-4 w-4" />
              Account
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Appearance
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Theme
                  </label>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      className={`relative flex items-center justify-center rounded-md border px-4 py-3 ${
                        theme === 'light'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <FaSun
                        className={`h-5 w-5 ${
                          theme === 'light'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      />
                      <span className="ml-2">Light</span>
                    </button>
                    <button
                      type="button"
                      className={`relative flex items-center justify-center rounded-md border px-4 py-3 ${
                        theme === 'dark'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <FaMoon
                        className={`h-5 w-5 ${
                          theme === 'dark'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      />
                      <span className="ml-2">Dark</span>
                    </button>
                    <button
                      type="button"
                      className={`relative flex items-center justify-center rounded-md border px-4 py-3 ${
                        theme === 'system'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => handleThemeChange('system')}
                    >
                      <FaDesktop
                        className={`h-5 w-5 ${
                          theme === 'system'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      />
                      <span className="ml-2">System</span>
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    The theme affects how Tarevity appears to you. The dark theme is ideal for night use and can reduce eye strain. The light theme provides better visibility in well-lit environments. The system option automatically follows your device preferences.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Account Settings */}
          {activeTab === 'account' && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Account
              </h2>
              <div className="space-y-6">
                <div className="bg-backgroundLight dark:bg-backgroundDark/50 rounded-lg p-4">
                  <h3 className="mb-2 text-base font-medium text-gray-800 dark:text-gray-200">
                    Basic Information
                  </h3>
                  <div className="flex flex-col space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">
                        {session.user?.name || 'Name not set'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">
                        {session.user?.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Login Method
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">
                        {isLoadingProfile
                          ? 'Loading...'
                          : profileData?.provider
                            ? profileData.provider.charAt(0).toUpperCase() +
                              profileData.provider.slice(1)
                            : session?.user?.provider
                              ? session.user.provider.charAt(0).toUpperCase() +
                                session.user.provider.slice(1)
                              : 'Email/Password'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                  <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-gray-200">
                    Account Management
                  </h3>
                  <div className="flex flex-col space-y-4">
                    <button
                      className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={() => {
                        toast.success('Redirecting to profile page')
                        router.push('/profile')
                      }}
                    >
                      Edit profile
                    </button>

                    <button
                      className="flex items-center text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete my account'}
                    </button>

                    {isDeleting && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        We are processing your request. This may take a few moments.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}