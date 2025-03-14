'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
  FaEdit,
  FaTrash,
  FaClock,
  FaFlag,
  FaExclamationCircle,
  FaCheck,
  FaSortAmountDown,
  FaSortAmountUp,
} from 'react-icons/fa'
import { FiPlus } from 'react-icons/fi'
import { Todo } from '@/lib/api'
import {
  useTodosQuery,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} from '@/hooks/useTodosQuery'
import ExpandableSearch from '@/components/todos/ExpandableSearch'
import ConfirmationDialog, {
  useConfirmationDialog,
} from '@/components/common/ConfirmationDialog'

// Simple date formatter function
const formatDate = (dateString: string | null) => {
  if (!dateString) return null
  const date = new Date(dateString)
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

// Interface para os segmentos do gráfico
interface PieSegment {
  dasharray: number
  dashoffset: number
}

interface PieSegments {
  circumference: number
  active: PieSegment
  completed: PieSegment
  review: PieSegment
}

const RedesignedTodoList: React.FC = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  // Add a new state for priority sorting direction
  const [prioritySortDirection, setPrioritySortDirection] = useState<
    'asc' | 'desc'
  >('desc')

  // Dialog state management
  const { dialogState, openConfirmDialog, closeConfirmDialog, setLoading } =
    useConfirmationDialog()

  // React Query hooks
  const { data: todos = [], isLoading } = useTodosQuery()
  const updateTodoMutation = useUpdateTodoMutation()
  const deleteTodoMutation = useDeleteTodoMutation()

  // Handle delete todo
  const handleDeleteTodo = (id: string, title: string) => {
    openConfirmDialog({
      title: 'Delete Task',
      description: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        setLoading(true)
        deleteTodoMutation.mutate(id, {
          onSuccess: () => {
            closeConfirmDialog()
            // Force a refetch to ensure client state is in sync
            queryClient.invalidateQueries({ queryKey: ['todos'] })
          },
          onError: (error) => {
            console.error('Error deleting task:', error)
            closeConfirmDialog()
          },
          onSettled: () => {
            setLoading(false)
          },
        })
      },
    })
  }

  // Toggle priority sort direction
  const togglePrioritySort = () => {
    setPrioritySortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))
  }

  // Filter todos based on selected filter and search query
  const filteredTodos = useMemo(() => {
    let result = [...todos]

    // Filter by status tab
    if (activeTab === 'active') {
      result = result.filter(
        (todo) => !todo.is_completed && todo.status !== 'review',
      )
    } else if (activeTab === 'completed') {
      result = result.filter((todo) => todo.is_completed)
    } else if (activeTab === 'review') {
      result = result.filter((todo) => todo.status === 'review')
    } else if (activeTab === 'todo') {
      // Let's consider "todo" as high priority tasks
      result = result.filter((todo) => todo.priority === 3)
    }

    // Filter by search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase()
      result = result.filter(
        (todo) =>
          todo.title.toLowerCase().includes(lowerCaseQuery) ||
          (todo.description &&
            todo.description.toLowerCase().includes(lowerCaseQuery)),
      )
    }

    // Sort by completion status first
    result.sort((a, b) => {
      // First sort by completion status
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1
      }

      // Then by priority based on sort direction
      return prioritySortDirection === 'desc'
        ? b.priority - a.priority
        : a.priority - b.priority
    })

    return result
  }, [todos, activeTab, searchQuery, prioritySortDirection])

  // Handle todo item click to navigate to detail page
  const handleTodoClick = (id: string) => {
    router.push(`/todo/${id}`)
  }

  // Handle checkbox change event
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
    isCompleted: boolean,
  ) => {
    e.stopPropagation()
    const todoToUpdate = todos.find((todo) => todo.id === id)
    if (!todoToUpdate) return

    updateTodoMutation.mutate(
      {
        id,
        data: {
          is_completed: !isCompleted,
          status: !isCompleted ? 'completed' : 'active',
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['todos'] })
        },
      },
    )
  }

  const handleSetReview = (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent navigation

    const todoToUpdate = todos.find((todo) => todo.id === id)
    if (!todoToUpdate) return

    // Only update the status field to minimize conflicts
    updateTodoMutation.mutate(
      {
        id,
        data: { status: 'review' },
      },
      {
        onError: (error) => {
          console.error('Error setting review status:', error)
        },
      },
    )
  }

  // Handle approving a reviewed todo
  const handleApproveReview = (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent navigation

    const todoToUpdate = todos.find((todo) => todo.id === id)
    if (!todoToUpdate) return

    // Only update the status field to minimize conflicts
    updateTodoMutation.mutate(
      {
        id,
        data: { status: 'active' },
      },
      {
        onSuccess: () => {
          // Force a local update to ensure UI consistency
          queryClient.setQueryData<Todo[]>(['todos'], (old) => {
            if (!old) return []

            return old.map((todo) => {
              if (todo.id === id) {
                return { ...todo, status: 'active' }
              }
              return todo
            })
          })
        },
        onError: (error) => {
          console.error('Error approving todo:', error)
        },
      },
    )
  }

  // Get priority color and label
  const getPriorityInfo = (priority: number) => {
    switch (priority) {
      case 3:
        return { color: 'bg-red-500', label: 'High', textColor: 'text-red-500' }
      case 2:
        return {
          color: 'bg-yellow-500',
          label: 'Medium',
          textColor: 'text-yellow-500',
        }
      case 1:
      default:
        return {
          color: 'bg-green-500',
          label: 'Low',
          textColor: 'text-green-500',
        }
    }
  }

  // Calculate stats with improved review handling
  const stats = useMemo(() => {
    const total = todos.length
    const active = todos.filter(
      (todo) => !todo.is_completed && todo.status !== 'review',
    ).length
    const completed = todos.filter((todo) => todo.is_completed).length
    const review = todos.filter((todo) => todo.status === 'review').length
    const toDo = todos.filter((todo) => todo.priority === 3).length

    return { total, active, completed, review, toDo }
  }, [todos])

  // Calculate pie chart values with correct circumference
  const calculatePieSegments = (): PieSegments => {
    const totalTodos = stats.total
    if (totalTodos === 0)
      return {
        circumference: 251.2,
        active: { dasharray: 0, dashoffset: 0 },
        completed: { dasharray: 0, dashoffset: 0 },
        review: { dasharray: 0, dashoffset: 0 },
      }

    const circumference = 251.2 // 2πr where r=40

    const activeDasharray = (stats.active / totalTodos) * circumference
    const completedDasharray = (stats.completed / totalTodos) * circumference
    const reviewDasharray = (stats.review / totalTodos) * circumference

    const completedDashoffset = -1 * activeDasharray
    const reviewDashoffset = -1 * (activeDasharray + completedDasharray)

    return {
      circumference,
      active: { dasharray: activeDasharray, dashoffset: 0 },
      completed: {
        dasharray: completedDasharray,
        dashoffset: completedDashoffset,
      },
      review: { dasharray: reviewDasharray, dashoffset: reviewDashoffset },
    }
  }

  const pieSegments = calculatePieSegments()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-full px-4">
      <div className="mb-8">
        <div className="flex flex-col justify-between sm:flex-row sm:items-center">
          <h1 className="mb-2 text-5xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <div className="max-xs:flex-col mt-4 flex items-start justify-around gap-4 sm:mt-0 sm:flex-row sm:items-center">
            <button
              onClick={() => router.push('/todo/new')}
              className="flex w-40 cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-white transition-colors hover:bg-blue-700"
            >
              <FiPlus className="h-5 w-5" /> Create Task
            </button>
            <ExpandableSearch
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Stats section with improved colors */}
          <div className="rounded-lg p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{stats.total} Tasks</h2>
            </div>

            <div className="mb-4 flex h-30 gap-10">
              <div className="relative h-16">
                <svg viewBox="0 0 100 100" className="h-25 w-25">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="15"
                  />
                  {/* Active tasks - Blue */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="15"
                    strokeDasharray={`${pieSegments.active.dasharray} ${pieSegments.circumference}`}
                    strokeDashoffset={pieSegments.active.dashoffset}
                    transform="rotate(-90 50 50)"
                  />
                  {/* Completed tasks - Green */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="15"
                    strokeDasharray={`${pieSegments.completed.dasharray} ${pieSegments.circumference}`}
                    strokeDashoffset={pieSegments.completed.dashoffset}
                    transform="rotate(-90 50 50)"
                  />
                  {/* Review tasks - Amber */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="15"
                    strokeDasharray={`${pieSegments.review.dasharray} ${pieSegments.circumference}`}
                    strokeDashoffset={pieSegments.review.dashoffset}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <div className="flex items-center">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-blue-600"></div>
                    <span className="text-sm">Active</span>
                    <span className="ml-2 text-sm font-medium">
                      {stats.active}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Completed</span>
                    <span className="ml-2 text-sm font-medium">
                      {stats.completed}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm">Review</span>
                    <span className="ml-2 text-sm font-medium">
                      {stats.review}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-gray-400"></div>
                    <span className="text-sm">Total</span>
                    <span className="ml-2 text-sm font-medium">
                      {stats.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtering tabs and sorting controls */}
        <div className="mb-4 flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center gap-4 overflow-x-auto sm:gap-2">
            <button
              className={`flex items-center rounded-md px-4 py-2 font-medium ${
                activeTab === 'all'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('all')}
            >
              <span className="mr-2 h-3 w-3 rounded-full bg-blue-600"></span>
              All
            </button>

            <div className="mx-2 hidden h-8 items-center border-r border-gray-300 sm:flex dark:border-gray-600"></div>

            <button
              className={`flex items-center rounded-md px-4 py-2 font-medium ${
                activeTab === 'active'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('active')}
            >
              <span className="mr-1 text-blue-600 dark:text-blue-400">•</span>{' '}
              Active
            </button>

            <button
              className={`flex items-center rounded-md px-4 py-2 font-medium ${
                activeTab === 'completed'
                  ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('completed')}
            >
              <span className="mr-1 text-green-600 dark:text-green-400">•</span>{' '}
              Completed
            </button>

            <button
              className={`flex items-center rounded-md px-4 py-2 font-medium ${
                activeTab === 'review'
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('review')}
            >
              <span className="mr-1 text-amber-600 dark:text-amber-400">•</span>{' '}
              Review
            </button>
          </div>

          {/* Priority Sort Button */}
          <button
            onClick={togglePrioritySort}
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
      </div>

      {/* Todo Items Grid with Review functionality */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTodos.map((todo) => {
          const priority = getPriorityInfo(todo.priority)
          const dueDate = todo.due_date ? formatDate(todo.due_date) : null
          const isReview = todo.status === 'review'

          return (
            <div
              key={todo.id}
              className={`dark:bg-BlackLight flex h-64 cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg ${isReview ? 'border-l-4 border-amber-500' : ''} `}
              onClick={() => handleTodoClick(todo.id)}
            >
              <div className="flex flex-grow flex-col overflow-hidden p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="mr-2 flex items-center overflow-hidden">
                    <div
                      className={`h-5 w-5 flex-shrink-0 rounded-full ${priority.color} mr-2`}
                    ></div>
                    <h3
                      title={todo.title}
                      className={`truncate text-lg font-medium ${
                        todo.is_completed
                          ? 'text-gray-500 line-through'
                          : isReview
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {todo.title}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={todo.is_completed}
                      onChange={(e) =>
                        handleCheckboxChange(e, todo.id, todo.is_completed)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded text-blue-600"
                    />
                  </div>
                </div>

                {isReview && (
                  <div className="mb-2 flex items-center text-sm text-amber-600 dark:text-amber-400">
                    <FaExclamationCircle className="mr-1 flex-shrink-0" />
                    <span>In Review</span>
                  </div>
                )}

                <div className="flex-grow overflow-hidden">
                  {todo.description && (
                    <p
                      className={`line-clamp-3 text-sm ${todo.is_completed ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      {todo.description}
                    </p>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <FaFlag className={`mr-1 ${priority.textColor}`} />
                    <span>Priority: {priority.label}</span>
                  </div>

                  {dueDate && (
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      <span>{dueDate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto flex justify-end space-x-2 border-t border-gray-200 p-2 dark:border-gray-700">
                {!isReview && !todo.is_completed && (
                  <button
                    className="p-1 text-amber-500 hover:text-amber-700 dark:text-amber-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSetReview(e, todo.id)
                    }}
                    title="Set to Review"
                  >
                    <FaExclamationCircle />
                  </button>
                )}
                {isReview && (
                  <button
                    className="p-1 text-green-500 hover:text-green-700 dark:text-green-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleApproveReview(e, todo.id)
                    }}
                    title="Approve"
                  >
                    <FaCheck />
                  </button>
                )}
                <button
                  className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/todo/${todo.id}/edit`)
                  }}
                >
                  <FaEdit />
                </button>
                <button
                  className="p-1 text-red-500 hover:text-red-700 dark:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteTodo(todo.id, todo.title)
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          )
        })}

        {/* Add new todo button */}
        <div
          className="dark:border-BorderDark dark:bg-BlackLight flex h-64 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-blue-500 dark:hover:border-blue-500"
          onClick={() => router.push('/todo/new')}
        >
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <FiPlus className="text-xl text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Add New Task</p>
          </div>
        </div>
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

export default RedesignedTodoList
