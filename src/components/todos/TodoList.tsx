'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { FiPlus } from 'react-icons/fi'
import { Todo } from '@/lib/api'
import {
  useTodosQuery,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} from '@/hooks/useTodosQuery'
import { useTodoFilters } from '@/hooks/useTodoFilters'
import ConfirmationDialog, {
  useConfirmationDialog,
} from '@/components/common/ConfirmationDialog'
import TodoItem from './TodoItem'
import Pagination from '../ui/Pagination'
import TodoFilters from './TodoFilters'
import TodoStats from './TodoStats'

const RedesignedTodoList: React.FC = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Dialog state management
  const { dialogState, openConfirmDialog, closeConfirmDialog, setLoading } =
    useConfirmationDialog()

  const { data: todos = [], isLoading } = useTodosQuery()
  const updateTodoMutation = useUpdateTodoMutation()
  const deleteTodoMutation = useDeleteTodoMutation()

  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    prioritySortDirection,
    togglePrioritySort,
    pageToShow,
    totalPages,
    filteredTodos,
    currentTodos,
    paginate,
  } = useTodoFilters(todos)

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

  const handleCheckboxChange = (
    id: string,
    isCompleted: boolean,
    e: React.ChangeEvent<HTMLInputElement>,
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
          if (!isCompleted) {
            fetch('/api/notifications/dismiss-for-todo', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ todoId: id }),
            })
              .then((response) => {
                if (!response.ok) {
                  console.error(
                    'Failed to dismiss notifications for completed todo',
                  )
                }
                return response.json()
              })
              .catch((error) => {
                console.error('Error dismissing notifications:', error)
              })
              .finally(() => {
                // Invalidate notifications query to update UI
                queryClient.invalidateQueries({ queryKey: ['notifications'] })
              })
          }

          queryClient.invalidateQueries({ queryKey: ['todos'] })
        },
      },
    )
  }

  const handleSetReview = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()

    const todoToUpdate = todos.find((todo) => todo.id === id)
    if (!todoToUpdate) return

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

  const handleApproveReview = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()

    const todoToUpdate = todos.find((todo) => todo.id === id)
    if (!todoToUpdate) return

    updateTodoMutation.mutate(
      {
        id,
        data: { status: 'active' },
      },
      {
        onSuccess: () => {
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

  const calculatePieSegments = () => {
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const createNewTodo = () => {
    router.push('/todo/new')
  }

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
        <TodoFilters
          activeTab={activeTab}
          searchQuery={searchQuery}
          prioritySortDirection={prioritySortDirection}
          onTabChange={setActiveTab}
          onSearchChange={handleSearchChange}
          onTogglePrioritySort={togglePrioritySort}
          createNewTodo={createNewTodo}
        />

        <TodoStats stats={stats} pieSegments={pieSegments} />
      </div>

      {/* Pagination - Task Count */}
      {filteredTodos.length > 0 && (
        <div className="mb-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
          Showing {Math.min(filteredTodos.length, (pageToShow - 1) * 9 + 1)}-
          {Math.min(pageToShow * 9, filteredTodos.length)} of{' '}
          {filteredTodos.length} tasks
        </div>
      )}

        {/* Empty state message */}
        {filteredTodos.length === 0 && (
          <div className="my-10 flex flex-col items-center justify-center text-center">
            <div className="mb-2 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
              <svg
                className="h-8 w-8 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No tasks found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'No tasks match your search. Try adjusting your filters.'
                : 'Get started by creating your first task.'}
            </p>
            <button
              onClick={createNewTodo}
              className="mt-4 flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <FiPlus className="mr-1" /> Create New Task
            </button>
          </div>
        )}

        {/* Todo Items Grid with Review functionality */}
        {filteredTodos.length > 0 && (
          <div className="grid w-full auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={handleCheckboxChange}
                onSetReview={handleSetReview}
                onApproveReview={handleApproveReview}
                onDelete={handleDeleteTodo}
              />
            ))}

            {/* Add new todo button */}
            <div
              className="dark:border-BorderDark dark:bg-BlackLight flex h-64 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-blue-500 dark:hover:border-blue-500"
              onClick={createNewTodo}
            >
              <div className="text-center">
                <div className="mb-2 flex justify-center">
                  <FiPlus className="text-xl text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">Add New Task</p>
              </div>
            </div>
          </div>
        )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination
          currentPage={pageToShow}
          totalPages={totalPages}
          onPageChange={paginate}
        />
      )}

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
