'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  FaMoon,
  FaSun,
  FaDesktop,
  FaUserCircle,
  FaShieldAlt,
} from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import ConfirmationDialog, {
  useConfirmationDialog,
} from '@/components/common/ConfirmationDialog'
import {
  useProfileQuery,
  useDeleteAccountMutation,
} from '@/hooks/useProfileQuery'
import { showSuccess, showError, showLoading, updateToast } from '@/lib/toast'
import AdminSettings from './admin'

export default function SettingsComponent() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('appearance')
  const router = useRouter()

  const {
    dialogState,
    openConfirmDialog,
    closeConfirmDialog,
    setLoading: setDialogLoading,
  } = useConfirmationDialog()

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useProfileQuery()

  const deleteAccountMutation = useDeleteAccountMutation()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
    showError('Could not load your profile information')
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    showSuccess(
      `Theme changed to ${
        newTheme === 'dark' ? 'dark' : newTheme === 'light' ? 'light' : 'system'
      }`,
    )
  }

  const handleDeleteAccount = () => {
    openConfirmDialog({
      title: 'Delete Account',
      description:
        'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        closeConfirmDialog()

        setTimeout(() => {
          openConfirmDialog({
            title: 'WARNING: Permanent Action',
            description:
              'This is a permanent action. All your tasks and data will be lost. Do you want to continue?',
            variant: 'danger',
            confirmText: 'Yes, Delete My Account',
            cancelText: 'No, Keep My Account',
            onConfirm: async () => {
              try {
                setDialogLoading(true)

                const toastId = showLoading('Deleting your account...')

                deleteAccountMutation.mutate(undefined, {
                  onSuccess: async () => {
                    updateToast(toastId, 'Account deleted successfully', {
                      type: 'success',
                      isLoading: false,
                      autoClose: 3000,
                    })

                    await signOut({ redirect: false })
                    router.push('/')
                  },
                  onError: (error) => {
                    console.error('Error deleting account:', error)

                    updateToast(toastId, 'Failed to delete account', {
                      type: 'error',
                      isLoading: false,
                      autoClose: 5000,
                    })

                    showError(
                      error instanceof Error
                        ? error.message
                        : 'An error occurred while deleting your account',
                    )
                  },
                  onSettled: () => {
                    setDialogLoading(false)
                    closeConfirmDialog()
                  },
                })
              } catch (error) {
                console.error('Error initiating account deletion:', error)
                setDialogLoading(false)
                closeConfirmDialog()
                showError('Failed to initiate account deletion')
              }
            },
          })
        }, 100)
      },
    })
  }

  const isAdmin = session?.user?.is_admin || false

  if (!session) {
    return (
      <div className="dark:bg-BlackLight rounded-lg bg-white p-6 shadow">
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to access settings.
        </p>
      </div>
    )
  }

  return (
    <div className="dark:bg-BlackLight rounded-lg bg-white shadow">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar / Tab Navigation */}
        <div className="w-full border-b border-gray-200 md:w-64 md:flex-shrink-0 md:border-r md:border-b-0 dark:border-gray-700">
          <nav className="space-y-1 p-4">
            <button
              aria-label="Appearance"
              onClick={() => setActiveTab('appearance')}
              className={`flex w-full items-center rounded-md px-4 py-2 text-sm transition-colors ${
                activeTab === 'appearance'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <FaDesktop className="mr-3 size-4" />
              Appearance
            </button>
            <button
              aria-label="General"
              onClick={() => setActiveTab('account')}
              className={`flex w-full items-center rounded-md px-4 py-2 text-sm transition-colors ${
                activeTab === 'account'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <FaUserCircle className="mr-3 size-4" />
              Account
            </button>

            {/* Admin tab - only visible for admins */}
            {isAdmin && (
              <button
                aria-label="Admin"
                onClick={() => setActiveTab('admin')}
                className={`flex w-full items-center rounded-md px-4 py-2 text-sm transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <FaShieldAlt className="mr-3 size-4" />
                Admin Panel
              </button>
            )}
          </nav>
        </div>

        {/* Content Area */}
        <div className="min-w-0 flex-1 p-6">
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
                      aria-label="Light Theme"
                      type="button"
                      className={`relative flex items-center justify-center rounded-md border px-4 py-3 ${
                        theme === 'light'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <FaSun
                        className={`xs:flex hidden size-5 items-center ${
                          theme === 'light'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      />
                      <span className="ml-2">Light</span>
                    </button>
                    <button
                      aria-label="Dark Theme"
                      type="button"
                      className={`relative flex items-center justify-center rounded-md border px-4 py-3 ${
                        theme === 'dark'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <FaMoon
                        className={`xs:flex hidden size-5 ${
                          theme === 'dark'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      />
                      <span className="ml-2">Dark</span>
                    </button>
                    <button
                      aria-label="System Theme"
                      type="button"
                      className={`relative flex items-center justify-center rounded-md border px-4 py-3 ${
                        theme === 'system'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => handleThemeChange('system')}
                    >
                      <FaDesktop
                        className={`xs:flex hidden size-5 ${
                          theme === 'system'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      />
                      <span className="ml-2">System</span>
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    The theme affects how Tarevity appears to you. The dark
                    theme is ideal for night use and can reduce eye strain. The
                    light theme provides better visibility in well-lit
                    environments. The system option automatically follows your
                    device preferences.
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
                        {isLoadingProfile
                          ? 'Loading...'
                          : profileData?.name || 'Name not set'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">
                        {isLoadingProfile
                          ? 'Loading...'
                          : profileData?.email || 'Email not available'}
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
                      aria-label="Edit Profile"
                      className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={() => {
                        showSuccess('Redirecting to profile page')
                        router.push('/profile')
                      }}
                    >
                      Edit profile
                    </button>

                    <button
                      aria-label="Delete Account"
                      className="flex items-center text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      onClick={handleDeleteAccount}
                      disabled={deleteAccountMutation.isPending}
                    >
                      {deleteAccountMutation.isPending
                        ? 'Deleting...'
                        : 'Delete my account'}
                    </button>

                    {deleteAccountMutation.isPending && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        We are processing your request. This may take a few
                        moments.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Settings */}
          {activeTab === 'admin' && isAdmin && <AdminSettings />}
        </div>
      </div>

      {/* Render confirmation dialog */}
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
        isLoading={dialogState.isLoading}
      />
    </div>
  )
}
