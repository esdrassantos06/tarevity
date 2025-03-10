'use client'

import { useState, useEffect } from 'react'
import { FaFilter } from 'react-icons/fa'

type Filters = {
  status: string
  priority: string
  search: string
}

interface TodoFiltersProps {
  filters: Filters
  setFilters: (filters: Filters) => void
}

export default function TodoFilters({ filters, setFilters }: TodoFiltersProps) {
  const [search, setSearch] = useState(filters.search)

  useEffect(() => {
    if (search === filters.search) return

    const timer = setTimeout(() => {
      setFilters({
         status: filters.status,
         priority: filters.priority,
          search 
        })
    }, 300)

    return () => clearTimeout(timer)
  }, [search, filters.search, filters.status, filters.priority, setFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, status: e.target.value })
  }

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, priority: e.target.value })
  }

  const handleClearFilters = () => {
    setSearch('')
    setFilters({
      status: 'all',
      priority: 'all',
      search: '',
    })
  }

  return (
    <div className="bg-cardLightMode dark:bg-cardDarkMode rounded-lg p-4 shadow">
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <div className="w-full md:w-1/2">
          <div className="flex">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
              className="bg-backgroundLight h-10 flex-grow rounded-md px-4 outline-none dark:bg-zinc-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-4 sm:flex-row md:w-1/2">
          <div className="w-full sm:w-1/2">
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="bg-backgroundLight w-full rounded-md px-4 py-2 outline-none dark:bg-zinc-700 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="w-full sm:w-[60%]">
            <select
              value={filters.priority}
              onChange={handlePriorityChange}
              className="bg-backgroundLight w-full rounded-md px-4 py-2 outline-none dark:bg-zinc-700 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="3">High Priority</option>
              <option value="2">Medium Priority</option>
              <option value="1">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {(filters.status !== 'all' ||
        filters.priority !== 'all' ||
        filters.search) && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FaFilter className="mr-1" />
            <span>Filters applied</span>
          </div>
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
