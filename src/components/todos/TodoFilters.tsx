import React from 'react'
import { FaFlag, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa'
import ExpandableSearch from './ExpandableSearch'
import { FiPlus } from 'react-icons/fi'
import { useTranslations } from 'next-intl'

interface TodoFiltersProps {
  activeTab: string
  searchQuery: string
  prioritySortDirection: 'asc' | 'desc'
  onTabChange: (tab: string) => void
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onTogglePrioritySort: () => void
  createNewTodo: () => void
}

const TodoFilters: React.FC<TodoFiltersProps> = ({
  activeTab,
  searchQuery,
  prioritySortDirection,
  onTabChange,
  onSearchChange,
  onTogglePrioritySort,
  createNewTodo,
}) => {
  const t = useTranslations('todoFilters')

  return (
    <>
      <div className="mb-4 flex flex-col justify-between sm:flex-row sm:items-center">
        <h1 className="mb-2 text-5xl font-bold text-gray-900 dark:text-white">
          {t('tasks')}
        </h1>
        <div className="max-xs:flex-col mt-4 flex items-start justify-around gap-4 sm:mt-0 sm:flex-row sm:items-center">
          <button
            aria-label={t('createNewTask')}
            onClick={createNewTodo}
            className="flex w-40 cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-white transition-colors hover:bg-blue-700"
          >
            <FiPlus className="size-5" /> {t('createTask')}
          </button>
          <ExpandableSearch value={searchQuery} onChange={onSearchChange} />
        </div>
      </div>

      {/* Filtering tabs and sorting controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 overflow-x-auto sm:gap-2">
          <button
            aria-label={t('allTasks')}
            className={`flex items-center rounded-md px-4 py-2 font-medium ${
              activeTab === 'all'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => onTabChange('all')}
          >
            <span className="mr-2 size-3 rounded-full bg-blue-600"></span>
            {t('all')}
          </button>

          <div className="mx-2 hidden h-8 items-center border-r border-gray-300 sm:flex dark:border-gray-600"></div>

          <button
            aria-label={t('activeTasks')}
            className={`flex items-center rounded-md px-4 py-2 font-medium ${
              activeTab === 'active'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => onTabChange('active')}
          >
            <span className="mr-1 text-blue-600 dark:text-blue-400">•</span>{' '}
            {t('active')}
          </button>

          <button
            aria-label={t('completedTasks')}
            className={`flex items-center rounded-md px-4 py-2 font-medium ${
              activeTab === 'completed'
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => onTabChange('completed')}
          >
            <span className="mr-1 text-green-600 dark:text-green-400">•</span>{' '}
            {t('completed')}
          </button>

          <button
            aria-label={t('reviewTasks')}
            className={`flex items-center rounded-md px-4 py-2 font-medium ${
              activeTab === 'review'
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300'
                : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => onTabChange('review')}
          >
            <span className="mr-1 text-amber-600 dark:text-amber-400">•</span>{' '}
            {t('review')}
          </button>
        </div>

        {/* Priority Sort Button */}
        <button
          aria-label={t('sortByPriority')}
          onClick={onTogglePrioritySort}
          className="border-BorderLight dark:border-BorderDark dark:bg-BlackLight dark:hover:bg-BlackLight/80 mt-4 flex items-center rounded-md border bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-white/50 sm:mt-0 dark:text-gray-200"
        >
          <FaFlag className="mr-2 text-gray-500 dark:text-gray-400" />
          {t('sortByPriority')}
          {prioritySortDirection === 'desc' ? (
            <FaSortAmountDown className="ml-2 text-gray-500 dark:text-gray-400" />
          ) : (
            <FaSortAmountUp className="ml-2 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>
    </>
  )
}

export default TodoFilters
