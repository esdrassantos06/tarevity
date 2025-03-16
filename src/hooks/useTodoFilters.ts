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

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery, prioritySortDirection])

  const togglePrioritySort = useCallback(() => {
    setPrioritySortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))
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

  const paginate = useCallback((pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
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