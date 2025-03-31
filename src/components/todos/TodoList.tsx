'use client'

import React, { useMemo, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { FiPlus } from 'react-icons/fi'
import { FaTimes } from 'react-icons/fa'
import { Todo } from '@/lib/api'
import axios from 'axios'
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
import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'

const TodoList: React.FC = () => {
  const t = useTranslations('todoList')
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const { status: sessionStatus } = useSession()

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(window.location.pathname)
      router.push(`/auth/login?callbackUrl=${callbackUrl}`)
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('redirect_count')
    }
  }, [sessionStatus, router])

  const { dialogState, openConfirmDialog, closeConfirmDialog, setLoading } =
    useConfirmationDialog()

  const { data: todos = [], isLoading, isError, error } = useTodosQuery()

  useEffect(() => {
    if (isError && error instanceof Error) {
      console.error('Error in todos query:', error.message)

      if (
        error.message.includes('unauthorized') ||
        error.message.includes('Unauthorized') ||
        error.message.toLowerCase().includes('session') ||
        error.message.includes('401')
      ) {
        const callbackUrl = encodeURIComponent(window.location.pathname)
        router.push(`/auth/login?callbackUrl=${callbackUrl}`)
      }
    }
  }, [isError, error, router])

  const updateTodoMutation = useUpdateTodoMutation()
  const deleteTodoMutation = useDeleteTodoMutation()

  const dueDateParam = searchParams.get('dueDate')
  const formattedDueDate = dueDateParam
    ? isValid(parseISO(dueDateParam))
      ? format(parseISO(dueDateParam), 'MMM d, yyyy')
      : null
    : null

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
    dueDateFilter,
    clearDueDateFilter,
  } = useTodoFilters(todos, dueDateParam)

  const handleDeleteTodo = useCallback(
    (id: string, title: string) => {
      openConfirmDialog({
        title: t('deleteTask'),
        description: t('deleteTaskConfirmation', { title }),
        variant: 'danger',
        confirmText: t('delete'),
        cancelText: t('cancel'),
        onConfirm: () => {
          setLoading(true)
          axios
            .delete(`/api/notifications/delete-for-todo/${id}`)
            .then(() => {
              deleteTodoMutation.mutate(id, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['notifications'] })
                  queryClient.refetchQueries({ queryKey: ['notifications'] })
                  queryClient.invalidateQueries({ queryKey: ['todos'] })
                  queryClient.refetchQueries({ queryKey: ['todos'] })
                },
                onError: (error) => {
                  console.error('Error deleting task:', error)
                },
                onSettled: () => {
                  setLoading(false)
                  closeConfirmDialog()
                },
              })
            })
            .catch((error) => {
              console.error('Error deleting notifications:', error)

              deleteTodoMutation.mutate(id, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['todos'] })
                  queryClient.refetchQueries({ queryKey: ['todos'] })
                },
                onError: (error) => {
                  console.error('Error deleting task:', error)
                },
                onSettled: () => {
                  setLoading(false)
                  closeConfirmDialog()
                },
              })
            })
        },
      })
    },
    [
      deleteTodoMutation,
      queryClient,
      t,
      openConfirmDialog,
      setLoading,
      closeConfirmDialog,
    ],
  )

  const handleCheckboxChange = useCallback(
    (
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
              axios
                .post('/api/notifications/dismiss-for-todo', { todoId: id })
                .then(() => {
                  queryClient.invalidateQueries({ queryKey: ['notifications'] })
                  queryClient.refetchQueries({ queryKey: ['notifications'] })
                })
                .catch((error) => {
                  console.error('Error dismissing notifications:', error)
                })
            } else if (todoToUpdate.due_date) {
              axios
                .delete(`/api/notifications/delete-for-todo/${id}`)
                .then(() => {
                  const dueDate = new Date(todoToUpdate.due_date!)
                  const now = new Date()
                  const timeDiff = dueDate.getTime() - now.getTime()
                  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

                  let notification = null

                  if (daysDiff < 0) {
                    notification = {
                      todo_id: id,
                      notification_type: 'danger',
                      title: t('overdueTask'),
                      message: t('overdueTaskMessage', {
                        title: todoToUpdate.title,
                        dueDate: formatDistanceToNow(dueDate, {
                          addSuffix: true,
                        }),
                      }),
                      due_date: todoToUpdate.due_date,
                      origin_id: `danger-${id}`,
                    }
                  } else if (daysDiff <= 3) {
                    notification = {
                      todo_id: id,
                      notification_type: 'warning',
                      title: t('dueSoon'),
                      message: t('dueSoonMessage', {
                        title: todoToUpdate.title,
                        dueDate: formatDistanceToNow(dueDate, {
                          addSuffix: true,
                        }),
                      }),
                      due_date: todoToUpdate.due_date,
                      origin_id: `warning-${id}`,
                    }
                  } else {
                    notification = {
                      todo_id: id,
                      notification_type: 'info',
                      title: t('upcomingDeadline'),
                      message: t('upcomingDeadlineMessage', {
                        title: todoToUpdate.title,
                        dueDate: formatDistanceToNow(dueDate, {
                          addSuffix: true,
                        }),
                      }),
                      due_date: todoToUpdate.due_date,
                      origin_id: `info-${id}`,
                    }
                  }

                  if (notification) {
                    axios
                      .post('/api/notifications', {
                        notifications: [notification],
                      })
                      .then(() => {
                        queryClient.invalidateQueries({
                          queryKey: ['notifications'],
                        })
                        queryClient.refetchQueries({
                          queryKey: ['notifications'],
                        })
                      })
                      .catch((error) => {
                        console.error('Error creating notifications:', error)
                      })
                  }
                })
                .catch((error) => {
                  console.error('Error managing notifications:', error)
                })
            }
            queryClient.invalidateQueries({ queryKey: ['todos'] })
            queryClient.refetchQueries({ queryKey: ['todos'] })
          },
        },
      )
    },
    [todos, updateTodoMutation, queryClient, t],
  )

  const handleSetReview = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      console.log('🔄 handleSetReview - Starting update for todo:', id)

      const todoToUpdate = todos.find((todo) => todo.id === id)
      if (!todoToUpdate) return

      updateTodoMutation.mutate(
        {
          id,
          data: { status: 'review' },
        },
        {
          onSuccess: () => {
            console.log('✅ handleSetReview - Success, invalidating queries')
            queryClient.invalidateQueries({ queryKey: ['todos'] })
            queryClient.refetchQueries({ queryKey: ['todos'] })
          },
          onError: (error) => {
            console.error('❌ handleSetReview - Error:', error)
            queryClient.invalidateQueries({ queryKey: ['todos'] })
            queryClient.refetchQueries({ queryKey: ['todos'] })
          },
        },
      )
    },
    [queryClient, todos, updateTodoMutation],
  )

  const handleApproveReview = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      console.log('🔄 handleApproveReview - Starting update for todo:', id)

      const todoToUpdate = todos.find((todo) => todo.id === id)
      if (!todoToUpdate) return

      updateTodoMutation.mutate(
        {
          id,
          data: { status: 'active' as const },
        },
        {
          onSuccess: () => {
            console.log('✅ handleApproveReview - Updating local state')
            queryClient.setQueryData<Todo[]>(['todos'], (old) => {
              if (!old) return []

              const updated = old.map((todo) => {
                if (todo.id === id) {
                  const updatedTodo = { ...todo, status: 'active' as const }
                  console.log(
                    '✅ handleApproveReview - Updated todo:',
                    updatedTodo,
                  )
                  return updatedTodo
                }
                return todo
              })
              return updated
            })
          },
          onError: (error) => {
            console.error('❌ handleApproveReview - Error:', error)
          },
        },
      )
    },
    [todos, updateTodoMutation, queryClient],
  )

  useEffect(() => {
    let isMutating = false

    // Update all todos every 30 seconds
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isMutating) {
        console.log('🔄 Auto-refresh - Checking for updates')
        queryClient.invalidateQueries({ queryKey: ['todos'] })
      }
    }, 60000) // Aumentado para 1 minuto

    // Listener para mutações
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === 'added') {
        const mutation = event.mutation
        const mutationKey = mutation.options?.mutationKey
        if (Array.isArray(mutationKey) && mutationKey.includes('todos')) {
          isMutating = true
          console.log('🔄 Mutation in progress - Pausing auto-refresh')
        }
      } else if (event.type === 'removed') {
        const mutation = event.mutation
        const mutationKey = mutation.options?.mutationKey
        if (Array.isArray(mutationKey) && mutationKey.includes('todos')) {
          isMutating = false
          console.log('✅ Mutation completed - Resuming auto-refresh')
        }
      }
    })

    return () => {
      clearInterval(refreshInterval)
      unsubscribe()
    }
  }, [queryClient])

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

  const calculatePieSegments = useCallback(() => {
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
  }, [stats])

  const pieSegments = useMemo(
    () => calculatePieSegments(),
    [calculatePieSegments],
  )

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    [setSearchQuery],
  )

  const createNewTodo = useCallback(() => {
    router.push('/todo/new')
  }, [router])

  if (isLoading) {
    return (
      <div
        className="flex h-64 items-center justify-center"
        aria-label={t('loadingTasks')}
      >
        <div
          className="size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
          role="status"
        >
          <span className="sr-only">{t('loading')}</span>
        </div>
      </div>
    )
  }

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div
        className="flex h-64 items-center justify-center"
        aria-label={t('loadingTasks')}
      >
        <div
          className="size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
          role="status"
        >
          <span className="sr-only">{t('loading')}</span>
        </div>
      </div>
    )
  }

  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-lg">{t('redirectingToLogin')}</p>
        </div>
      </div>
    )
  }

  if (
    isError &&
    error instanceof Error &&
    !error.message.includes('session') &&
    !error.message.includes('unauthorized') &&
    !error.message.includes('Unauthorized')
  ) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg">{t('errorLoadingTasks')}</p>
          <p className="text-sm">{error.message}</p>
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['todos'] })
              queryClient.refetchQueries({ queryKey: ['todos'] })
            }}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            {t('tryAgain')}
          </button>
        </div>
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

        {/* Date filter indicator */}
        {formattedDueDate && (
          <div className="text-primary dark:bg-BlackLight mt-4 mb-4 flex items-center rounded-lg bg-white px-4 py-2 dark:text-blue-200">
            <span className="mr-4">
              {t('showingTasksDueOn', { date: formattedDueDate })}
            </span>
            <button
              aria-label={t('clearDateFilter')}
              onClick={() => {
                clearDueDateFilter()
                router.push('/dashboard')
              }}
              className="ml-auto flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700"
            >
              <FaTimes className="mr-1" /> {t('clearFilter')}
            </button>
          </div>
        )}

        <TodoStats stats={stats} pieSegments={pieSegments} />
      </div>

      {/* Pagination - Task Count */}
      {filteredTodos.length > 0 && (
        <div
          className="mb-4 flex items-center text-sm text-gray-600 dark:text-gray-400"
          aria-live="polite"
        >
          {t('showingTasksCount', {
            start: Math.min(filteredTodos.length, (pageToShow - 1) * 9 + 1),
            end: Math.min(pageToShow * 9, filteredTodos.length),
            total: filteredTodos.length,
          })}
        </div>
      )}

      {/* Empty state message */}
      {filteredTodos.length === 0 && (
        <div
          className="my-10 flex flex-col items-center justify-center text-center"
          role="status"
          aria-live="polite"
        >
          <div className="mb-2 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <svg
              className="size-8 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
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
            {t('noTasksFound')}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || dueDateFilter
              ? t('noTasksMatchFilters')
              : t('getStartedCreateTask')}
          </p>
          <button
            onClick={createNewTodo}
            className="mt-4 flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            aria-label={t('createNewTask')}
          >
            <FiPlus className="mr-1" aria-hidden="true" /> {t('createNewTask')}
          </button>
        </div>
      )}

      {/* Todo Items Grid with Review functionality */}
      {filteredTodos.length > 0 && (
        <div
          className="grid w-full auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label={t('taskList')}
        >
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
            className="dark:border-BorderDark dark:bg-BlackLight flex h-64 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:hover:border-blue-500"
            onClick={createNewTodo}
            tabIndex={0}
            role="button"
            aria-label={t('createNewTask')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                createNewTodo()
              }
            }}
          >
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <FiPlus
                  className="text-xl text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {t('addNewTask')}
              </p>
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
        data-testid="confirmation-dialog"
      />
    </div>
  )
}

export default React.memo(TodoList)
