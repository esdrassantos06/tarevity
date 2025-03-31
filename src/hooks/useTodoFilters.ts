import { useMemo, useState, useEffect, useCallback } from 'react'
import { parseISO } from 'date-fns'
import { Todo } from '@/lib/api'
import { useTranslations } from 'next-intl'

export interface TodoFilters {
  activeTab: string
  searchQuery: string
  prioritySortDirection: 'asc' | 'desc'
  dueDateFilter: string | null
}

/**
 * Custom hook for filtering and sorting todos with optimized performance using memoization
 */
export function useTodoFilters(
  todos: Todo[],
  initialDueDate: string | null = null,
) {
  const t = useTranslations('useTodoFilters')
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [prioritySortDirection, setPrioritySortDirection] = useState<
    'asc' | 'desc'
  >('desc')
  const [dueDateFilter, setDueDateFilter] = useState<string | null>(
    initialDueDate,
  )
  const [currentPage, setCurrentPage] = useState(1)
  const todosPerPage = 9

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery, prioritySortDirection, dueDateFilter])

  useEffect(() => {
    setDueDateFilter(initialDueDate)
  }, [initialDueDate])

  const togglePrioritySort = useCallback(() => {
    setPrioritySortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))
  }, [])

  const clearDueDateFilter = useCallback(() => {
    setDueDateFilter(null)
  }, [])

  const tabFilteredTodos = useMemo(() => {
    if (activeTab === 'all') return todos

    if (activeTab === 'active') {
      return todos.filter(
        (todo) => !todo.is_completed && todo.status !== 'review',
      )
    }

    if (activeTab === 'completed') {
      return todos.filter((todo) => todo.is_completed)
    }

    if (activeTab === 'review') {
      return todos.filter((todo) => todo.status === 'review')
    }

    if (activeTab === 'todo') {
      return todos.filter((todo) => todo.priority === 3)
    }

    return todos
  }, [todos, activeTab])

  const dateFilteredTodos = useMemo(() => {
    if (!dueDateFilter) return tabFilteredTodos

    try {
      const targetDate = parseISO(dueDateFilter)

      const filterYear = targetDate.getFullYear()
      const filterMonth = targetDate.getMonth()
      const filterDay = targetDate.getDate()

      return tabFilteredTodos.filter((todo) => {
        if (!todo.due_date) return false

        const todoDate = parseISO(todo.due_date)

        return (
          todoDate.getFullYear() === filterYear &&
          todoDate.getMonth() === filterMonth &&
          todoDate.getDate() === filterDay
        )
      })
    } catch (error) {
      console.error(t('errorFilteringByDate'), error)
      return tabFilteredTodos
    }
  }, [tabFilteredTodos, dueDateFilter, t])

  const searchFilteredTodos = useMemo(() => {
    if (!searchQuery) return dateFilteredTodos

    const lowerCaseQuery = searchQuery.toLowerCase()
    return dateFilteredTodos.filter(
      (todo) =>
        todo.title.toLowerCase().includes(lowerCaseQuery) ||
        (todo.description &&
          todo.description.toLowerCase().includes(lowerCaseQuery)),
    )
  }, [dateFilteredTodos, searchQuery])

  const filteredTodos = useMemo(() => {
    return [...searchFilteredTodos].sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1
      }

      return prioritySortDirection === 'desc'
        ? b.priority - a.priority
        : a.priority - b.priority
    })
  }, [searchFilteredTodos, prioritySortDirection])

  const totalPages = useMemo(() => {
    return Math.ceil(filteredTodos.length / todosPerPage)
  }, [filteredTodos.length, todosPerPage])

  const pageToShow = useMemo(() => {
    return Math.min(Math.max(1, currentPage), Math.max(1, totalPages))
  }, [currentPage, totalPages])

  const currentTodos = useMemo(() => {
    const indexOfLastTodo = pageToShow * todosPerPage
    const indexOfFirstTodo = indexOfLastTodo - todosPerPage
    return filteredTodos.slice(indexOfFirstTodo, indexOfLastTodo)
  }, [filteredTodos, pageToShow, todosPerPage])

  const paginate = useCallback(
    (pageNumber: number) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber)
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 0)
      }
    },
    [totalPages],
  )

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    prioritySortDirection,
    togglePrioritySort,
    currentPage,
    pageToShow,
    totalPages,
    filteredTodos,
    currentTodos,
    paginate,
    dueDateFilter,
    setDueDateFilter,
    clearDueDateFilter,
  }
}
