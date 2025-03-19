import React from 'react'
import { FaFlag, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa'
import ExpandableSearch from './ExpandableSearch'
import { FiPlus } from 'react-icons/fi'

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
  return (
    <>
      <div className="mb-4 flex flex-col justify-between sm:flex-row sm:items-center">
        <h1 className="mb-2 text-5xl font-bold text-gray-900 dark:text-white">
          Tasks
        </h1>
        <div className="max-xs:flex-col mt-4 flex items-start justify-around gap-4 sm:mt-0 sm:flex-row sm:items-center">
          <button
            aria-label="Create new task"
            onClick={createNewTodo}
            className="flex w-40 cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-white transition-colors hover:bg-blue-700"
          >
            <FiPlus className="h-5 w-5" /> Create Task
          </button>
          <ExpandableSearch value={searchQuery} onChange={onSearchChange} />
        </div>
      </div>

      {/* Filtering tabs and sorting controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 overflow-x-auto sm:gap-2">
          <button
            aria-label="All tasks"
            className={`flex items-center rounded-md px-4 py-2 font-medium ${
              activeTab === 'all'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => onTabChange('all')}
          >
            <span className="mr-2 h-3 w-3 rounded-full bg-blue-600"></span>
            All
          </button>

          <div className="mx-2 hidden h-8 items-center border-r border-gray-300 sm:flex dark:border-gray-600"></div>

          <button
            aria-label="Priority sorting"
            className={`flex items-center rounded-md px-4 py-2 font-medium ${
              activeTab === 'active'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => onTabChange('active')}
          >
            <span className="mr-1 text-blue-600 dark:text-blue-400">•</span>{' '}
            Active
          </button>

          <button
            aria-label="Completed tasks"
            className={`flex items-center rounded-md px-4 py-2 font-medium ${
              activeTab === 'completed'
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => onTabChange('completed')}
          >
            <span className="mr-1 text-green-600 dark:text-green-400">•</span>{' '}
            Completed
          </button>

          <button
            aria-label="Review tasks"
            className={`flex items-center rounded-md px-4 py-2 font-medium ${
              activeTab === 'review'
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300'
                : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => onTabChange('review')}
          >
            <span className="mr-1 text-amber-600 dark:text-amber-400">•</span>{' '}
            Review
          </button>
        </div>

        {/* Priority Sort Button */}
        <button
          aria-label="Sort by priority"
          onClick={onTogglePrioritySort}
          className="border-BorderLight dark:border-BorderDark dark:bg-BlackLight dark:hover:bg-BlackLight/80 mt-4 flex items-center rounded-md border bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-white/50 sm:mt-0 dark:text-gray-200"
        >
          <FaFlag className="mr-2 text-gray-500 dark:text-gray-400" />
          Sort by Priority
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
