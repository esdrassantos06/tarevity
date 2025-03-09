'use client'

import { useState } from 'react'
import { FaSearch, FaFilter } from 'react-icons/fa'

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ ...filters, search })
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
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Pesquisar tarefas..."
              className="bg-backgroundLight h-10 flex-grow rounded-l-md px-4 outline-none dark:bg-zinc-700 dark:text-white"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primaryHover h-10 rounded-r-md px-4 text-white"
            >
              <FaSearch />
            </button>
          </form>
        </div>

        <div className="flex w-full flex-col items-center gap-4 sm:flex-row md:w-1/2">
          <div className="w-full sm:w-1/2">
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="bg-backgroundLight w-full rounded-md px-4 py-2 outline-none dark:bg-zinc-700 dark:text-white"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Pendentes</option>
              <option value="completed">Concluídas</option>
            </select>
          </div>

          <div className="w-full sm:w-[60%]">
            <select
              value={filters.priority}
              onChange={handlePriorityChange}
              className="bg-backgroundLight w-full rounded-md px-4 py-2 outline-none dark:bg-zinc-700 dark:text-white"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="3">Prioridade Alta</option>
              <option value="2">Prioridade Média</option>
              <option value="1">Prioridade Baixa</option>
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
            <span>Filtros aplicados</span>
          </div>
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  )
}
