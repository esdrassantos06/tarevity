'use client'

import React from 'react'
import { FaClipboardList, FaClipboardCheck, FaClock } from 'react-icons/fa'

interface UserStatsProps {
  userStats?: {
    total: number
    completed: number
    pending: number
  }
}

export default function UserStats({ userStats }: UserStatsProps) {
  if (!userStats) {
    return (
      <div className="border-t border-gray-200 px-6 py-6 dark:border-gray-700">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          Task Statistics
        </h3>
        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
          Loading statistics...
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 px-6 py-6 dark:border-gray-700">
      <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
        Task Statistics
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {userStats.total}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <FaClipboardList className="mr-1" />
            Created Tasks
          </div>
        </div>
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {userStats.completed}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <FaClipboardCheck className="mr-1" />
            Completed Tasks
          </div>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/30">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {userStats.pending}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <FaClock className="mr-1" />
            Pending
          </div>
        </div>
      </div>
    </div>
  )
}
