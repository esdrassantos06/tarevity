import { useMemo, useState, useEffect, useCallback } from 'react'
import { Todo } from '@/lib/api'

export interface TodoFilters {
  activeTab: string
  searchQuery: string
  prioritySortDirection: 'asc' | 'desc'
}

/**
 * Custom hook for filtering and sorting todos with optimized performance using memoization
 */
export function useTodoFilters(todos: Todo[]) {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [prioritySortDirection, setPrioritySortDirection] = useState<
    'asc' | 'desc'
  >('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const todosPerPage = 9

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery, prioritySortDirection])

  // Memoize the toggle function
  const togglePrioritySort = useCallback(() => {
    setPrioritySortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))
  }, [])

  // Filter todos by tab (all, active, completed, review)
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

  // Filter by search query
  const searchFilteredTodos = useMemo(() => {
    if (!searchQuery) return tabFilteredTodos
    
    const lowerCaseQuery = searchQuery.toLowerCase()
    return tabFilteredTodos.filter(
      (todo) =>
        todo.title.toLowerCase().includes(lowerCaseQuery) ||
        (todo.description &&
          todo.description.toLowerCase().includes(lowerCaseQuery)),
    )
  }, [tabFilteredTodos, searchQuery])

  // Sort todos by priority and completed status
  const filteredTodos = useMemo(() => {
    return [...searchFilteredTodos].sort((a, b) => {
      // Always put completed todos at the bottom
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1
      }

      // Sort by priority
      return prioritySortDirection === 'desc'
        ? b.priority - a.priority
        : a.priority - b.priority
    })
  }, [searchFilteredTodos, prioritySortDirection])

  // Calculate pagination
  const totalPages = useMemo(() => {
    return Math.ceil(filteredTodos.length / todosPerPage)
  }, [filteredTodos.length, todosPerPage])

  // Make sure current page is valid
  const pageToShow = useMemo(() => {
    return Math.min(Math.max(1, currentPage), Math.max(1, totalPages))
  }, [currentPage, totalPages])

  // Get current todos for display
  const currentTodos = useMemo(() => {
    const indexOfLastTodo = pageToShow * todosPerPage
    const indexOfFirstTodo = indexOfLastTodo - todosPerPage
    return filteredTodos.slice(indexOfFirstTodo, indexOfLastTodo)
  }, [filteredTodos, pageToShow, todosPerPage])

  // Memoize pagination handler
  const paginate = useCallback((pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
      // Smooth scroll to top for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [totalPages])

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
  }
}