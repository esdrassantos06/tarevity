'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FaUsers,
  FaChartBar,
  FaExclamationTriangle,
  FaUserSlash,
  FaUserShield,
} from 'react-icons/fa'
import { showSuccess, showError } from '@/lib/toast'
import axiosClient from '@/lib/axios'
import { useTranslations } from 'next-intl'
import ConfirmationDialog, {
  useConfirmationDialog,
} from '@/components/common/ConfirmationDialog'

interface User {
  id: string
  name: string
  email: string
  provider: string
  is_admin: boolean
  created_at: string
}

const AdminSettings: React.FC = () => {
  const t = useTranslations('admin')
  const [activeAdminTab, setActiveAdminTab] = useState<string>('users')
  const queryClient = useQueryClient()

  const { dialogState, openConfirmDialog, closeConfirmDialog, setLoading } =
    useConfirmationDialog()

  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await axiosClient.get('/api/admin/users')
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const {
    data: systemStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await axiosClient.get('/api/admin/stats')
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const updateUserAdminStatusMutation = useMutation({
    mutationFn: async ({
      userId,
      isAdmin,
    }: {
      userId: string
      isAdmin: boolean
    }) => {
      const response = await axiosClient.patch(`/api/admin/users/${userId}`, {
        is_admin: isAdmin,
      })
      return response.data
    },
    onSuccess: () => {
      showSuccess(t('userAdminStatusUpdated'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.refetchQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (error) => {
      console.error('Error updating user admin status:', error)
      showError(t('failedToUpdateUserAdminStatus'))
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await axiosClient.delete(`/api/admin/users/${userId}`)
      return response.data
    },
    onSuccess: () => {
      showSuccess(t('userDeletedSuccessfully'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      queryClient.refetchQueries({ queryKey: ['admin', 'users', 'stats'] })
    },
    onError: (error) => {
      console.error('Error deleting user:', error)
      showError(t('failedToDeleteUser'))
    },
  })

  const handleToggleAdminStatus = (user: User) => {
    openConfirmDialog({
      title: user.is_admin
        ? t('removeAdminPrivileges')
        : t('grantAdminPrivileges'),
      description: user.is_admin
        ? t('confirmRemoveAdminPrivileges', { name: user.name })
        : t('confirmGrantAdminPrivileges', { name: user.name }),
      variant: 'warning',
      confirmText: t('confirm'),
      cancelText: t('cancel'),
      onConfirm: () => {
        setLoading(true)
        updateUserAdminStatusMutation.mutate(
          {
            userId: user.id,
            isAdmin: !user.is_admin,
          },
          {
            onSettled: () => {
              setLoading(false)
              closeConfirmDialog()
            },
          },
        )
      },
    })
  }

  const handleDeleteUser = (user: User) => {
    openConfirmDialog({
      title: t('deleteUser'),
      description: t('confirmDeleteUser', { name: user.name }),
      variant: 'danger',
      confirmText: t('deleteUser'),
      cancelText: t('cancel'),
      onConfirm: () => {
        setLoading(true)
        deleteUserMutation.mutate(user.id, {
          onSettled: () => {
            setLoading(false)
            closeConfirmDialog()
          },
        })
      },
    })
  }

  if (usersError || statsError) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <div className="flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <h3 className="text-lg font-medium">{t('errorLoadingAdminData')}</h3>
        </div>
        <p className="mt-2">{t('errorLoadingAdminDataMessage')}</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        {t('adminPanel')}
      </h2>

      {/* Admin Tabs */}
      <div className="border-BorderLight dark:border-BorderDark mb-6 border-b">
        <ul className="-mb-px flex flex-wrap">
          <li className="mr-2">
            <button
              aria-label={t('users')}
              onClick={() => setActiveAdminTab('users')}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                activeAdminTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FaUsers className="mr-2" />
              {t('userManagement')}
            </button>
          </li>
          <li className="mr-2">
            <button
              aria-label={t('stats')}
              onClick={() => setActiveAdminTab('stats')}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                activeAdminTab === 'stats'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FaChartBar className="mr-2" />
              {t('systemStats')}
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {/* Users Management */}
        {activeAdminTab === 'users' && (
          <div className="w-full">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              {t('userManagement')}
            </h3>

            {isLoadingUsers ? (
              <div className="flex justify-center py-8">
                <div className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="w-full">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 font-medium">{t('name')}</th>
                        <th className="px-4 py-3 font-medium">{t('email')}</th>
                        <th className="px-4 py-3 font-medium">
                          {t('provider')}
                        </th>
                        <th className="px-4 py-3 font-medium">{t('status')}</th>
                        <th className="px-4 py-3 font-medium">
                          {t('actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user: User) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-100 dark:hover:bg-zinc-800"
                        >
                          <td className="px-4 py-3 font-medium">{user.name}</td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3 capitalize">
                            {user.provider || t('email')}
                          </td>
                          <td className="px-4 py-3">
                            {user.is_admin ? (
                              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                {t('admin')}
                              </span>
                            ) : (
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {t('user')}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                aria-label={t('editUser')}
                                onClick={() => handleToggleAdminStatus(user)}
                                className="rounded p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                title={
                                  user.is_admin
                                    ? t('removeAdminPrivileges')
                                    : t('grantAdminPrivileges')
                                }
                              >
                                <FaUserShield />
                              </button>
                              <button
                                aria-label={t('deleteUser')}
                                onClick={() => handleDeleteUser(user)}
                                className="rounded p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                                title={t('deleteUser')}
                              >
                                <FaUserSlash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {users.length === 0 && (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                      {t('noUsersFound')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* System Stats */}
        {activeAdminTab === 'stats' && (
          <div className="w-full">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              {t('systemStatistics')}
            </h3>

            {isLoadingStats ? (
              <div className="flex justify-center py-8">
                <div className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                  <div className="flex items-center">
                    <div className="rounded-md bg-blue-100 p-3 dark:bg-blue-900/30">
                      <FaUsers className="size-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('totalUsers')}
                      </h4>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {systemStats?.totalUsers || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                  <div className="flex items-center">
                    <div className="rounded-md bg-green-100 p-3 dark:bg-green-900/30">
                      <FaChartBar className="size-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('totalTasks')}
                      </h4>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {systemStats?.totalTasks || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                  <div className="flex items-center">
                    <div className="rounded-md bg-purple-100 p-3 dark:bg-purple-900/30">
                      <FaUserShield className="size-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('adminUsers')}
                      </h4>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {users.filter((user: User) => user.is_admin).length ||
                          0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
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

export default AdminSettings
