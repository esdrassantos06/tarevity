'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import {
  FaMoon,
  FaSun,
  FaDesktop,
  FaUserCircle,
  FaShieldAlt,
} from 'react-icons/fa'
import { useRouter } from '@/i18n/navigation'
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
  const t = useTranslations('Settings')

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
      title: t('deleteAccount.firstConfirmTitle'),
      description: t('deleteAccount.firstConfirmDescription'),
      variant: 'danger',
      confirmText: t('deleteAccount.confirmText'),
      cancelText: t('deleteAccount.cancelText'),
      onConfirm: async () => {
        closeConfirmDialog()

        setTimeout(() => {
          openConfirmDialog({
            title: t('deleteAccount.secondConfirmTitle'),
            description: t('deleteAccount.secondConfirmDescription'),
            variant: 'danger',
            confirmText: t('deleteAccount.secondConfirmButton'),
            cancelText: t('deleteAccount.secondCancelButton'),
            onConfirm: async () => {
              try {
                setDialogLoading(true)

                const toastId = showLoading(t('deleteAccount.loadingMessage'))

                deleteAccountMutation.mutate(undefined, {
                  onSuccess: async () => {
                    updateToast(
                      await toastId,
                      t('deleteAccount.successMessage'),
                      {
                        type: 'success',
                        isLoading: false,
                        autoClose: 3000,
                      },
                    )

                    await signOut({ redirect: false })
                    router.push('/')
                  },
                  onError: async (error) => {
                    console.error('Error deleting account:', error)

                    updateToast(
                      await toastId,
                      t('deleteAccount.errorMessage'),
                      {
                        type: 'error',
                        isLoading: false,
                        autoClose: 5000,
                      },
                    )

                    showError(
                      error instanceof Error
                        ? error.message
                        : t('deleteAccount.genericErrorMessage'),
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
                showError(t('deleteAccount.initiationErrorMessage'))
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
        <p className="text-gray-600 dark:text-gray-400">{t('notLoggedIn')}</p>
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
              aria-label={t('tabs.appearance')}
              onClick={() => setActiveTab('appearance')}
              className={`flex w-full items-center rounded-md px-4 py-2 text-sm transition-colors ${
                activeTab === 'appearance'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <FaDesktop className="mr-3 size-4" />
              {t('tabs.appearance')}
            </button>
            <button
              aria-label={t('tabs.account')}
              onClick={() => setActiveTab('account')}
              className={`flex w-full items-center rounded-md px-4 py-2 text-sm transition-colors ${
                activeTab === 'account'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <FaUserCircle className="mr-3 size-4" />
              {t('tabs.account')}
            </button>

            {/* Admin tab - only visible for admins */}
            {isAdmin && (
              <button
                aria-label={t('tabs.admin')}
                onClick={() => setActiveTab('admin')}
                className={`flex w-full items-center rounded-md px-4 py-2 text-sm transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <FaShieldAlt className="mr-3 size-4" />
                {t('tabs.admin')}
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
                {t('appearance.title')}
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('appearance.theme.label')}
                  </label>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <button
                      aria-label={t('appearance.theme.light')}
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
                      <span className="ml-2">
                        {t('appearance.theme.light')}
                      </span>
                    </button>
                    <button
                      aria-label={t('appearance.theme.dark')}
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
                      <span className="ml-2">{t('appearance.theme.dark')}</span>
                    </button>
                    <button
                      aria-label={t('appearance.theme.system')}
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
                      <span className="ml-2">
                        {t('appearance.theme.system')}
                      </span>
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    {t('appearance.theme.description')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Account Settings */}
          {activeTab === 'account' && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                {t('account.title')}
              </h2>
              <div className="space-y-6">
                <div className="bg-backgroundLight dark:bg-backgroundDark/50 rounded-lg p-4">
                  <h3 className="mb-2 text-base font-medium text-gray-800 dark:text-gray-200">
                    {t('account.basicInfo.title')}
                  </h3>
                  <div className="flex flex-col space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('account.basicInfo.name')}
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">
                        {isLoadingProfile
                          ? 'Loading...'
                          : profileData?.name ||
                            t('account.basicInfo.nameNotSet')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('account.basicInfo.email')}
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">
                        {isLoadingProfile
                          ? 'Loading...'
                          : profileData?.email ||
                            t('account.basicInfo.emailNotAvailable')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('account.basicInfo.loginMethod')}
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">
                        {isLoadingProfile
                          ? 'Loading...'
                          : profileData?.provider
                            ? profileData.provider.charAt(0).toUpperCase() +
                              profileData.provider.slice(1)
                            : t('profile.header.defaultLoginMethod')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                  <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-gray-200">
                    {t('account.management.title')}
                  </h3>
                  <div className="flex flex-col space-y-4">
                    <button
                      aria-label={t('account.management.editProfile')}
                      className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={() => {
                        showSuccess('Redirecting to profile page')
                        router.push('/profile')
                      }}
                    >
                      {t('account.management.editProfile')}
                    </button>

                    <button
                      aria-label={t('account.management.deleteAccount')}
                      className="flex items-center text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      onClick={handleDeleteAccount}
                      disabled={deleteAccountMutation.isPending}
                    >
                      {deleteAccountMutation.isPending
                        ? t('account.management.deleting')
                        : t('account.management.deleteAccount')}
                    </button>

                    {deleteAccountMutation.isPending && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t('account.management.deletingMessage')}
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
