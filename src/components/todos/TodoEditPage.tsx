'use client'
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaFlag,
  FaClock,
  FaExclamationCircle,
  FaCalendarTimes,
} from 'react-icons/fa'
import { useTodosQuery, useUpdateTodoMutation } from '@/hooks/useTodosQuery'
import ConfirmationDialog, {
  useConfirmationDialog,
} from '@/components/common/ConfirmationDialog'
import axios from 'axios'
import { showError } from '@/lib/toast'
import { refreshNotifications } from '@/hooks/useNotificationsQuery'
import { useTranslations } from 'next-intl'

interface Todo {
  id: string
  title: string
  description: string | null
  priority: number
  due_date: string | null
  is_completed: boolean
  status: 'active' | 'review' | 'completed'
  created_at: string
  updated_at: string
  user_id: string
}

interface TodoFormData {
  title: string
  description: string
  priority: number
  due_date: string
  is_completed: boolean
  status: 'active' | 'review' | 'completed'
}

interface TodoEditPageProps {
  todoId: string
}

const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

const TodoEditPage: React.FC<TodoEditPageProps> = ({ todoId }) => {
  const t = useTranslations('todoEdit')
  const router = useRouter()
  const { data: todos = [] as Todo[], isLoading } = useTodosQuery()
  const updateTodoMutation = useUpdateTodoMutation()

  const [formData, setFormData] = useState<TodoFormData>({
    title: '',
    description: '',
    priority: 1,
    due_date: '',
    is_completed: false,
    status: 'active',
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalDueDate, setOriginalDueDate] = useState<string | null>(null)

  useEffect(() => {
    if (todos.length > 0) {
      const todo = todos.find((t) => t.id === todoId)
      if (todo) {
        setFormData({
          title: todo.title || '',
          description: todo.description || '',
          priority: todo.priority || 1,
          due_date: todo.due_date ? formatDateForInput(todo.due_date) : '',
          is_completed: todo.is_completed || false,
          status: todo.status || 'active',
        })

        setOriginalDueDate(todo.due_date)
      } else {
        router.push('/dashboard')
      }
    }
  }, [todos, todoId, router])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        return t('unsavedChangesWarning')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges, t])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (name === 'is_completed' && type === 'checkbox') {
      setFormData((prev) => {
        const newStatus = checked
          ? ('completed' as const)
          : prev.status === 'completed'
            ? ('active' as const)
            : prev.status
        return {
          ...prev,
          is_completed: checked,
          status: newStatus,
        }
      })
    } else if (name === 'status') {
      setFormData((prev) => {
        const newStatus = value as 'active' | 'review' | 'completed'
        return {
          ...prev,
          status: newStatus,
          is_completed: newStatus === 'completed' ? true : prev.is_completed,
        }
      })
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }))
    }

    setHasUnsavedChanges(true)
  }

  const handleClearDueDate = () => {
    setFormData({
      ...formData,
      due_date: '',
    })
    setHasUnsavedChanges(true)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const updateData = {
      ...formData,
      priority: Number(formData.priority),
      due_date: formData.due_date || null,
      status: formData.is_completed ? 'completed' : formData.status,
    }

    console.log('🔄 TodoEditPage - Starting update with data:', updateData)

    updateTodoMutation.mutate(
      { id: todoId, data: updateData },
      {
        onSuccess: async (response) => {
          console.log('✅ TodoEditPage - Update successful:', response)
          setHasUnsavedChanges(false)

          try {
            if (updateData.is_completed) {
              console.log(
                '🔔 TodoEditPage - Handling completed todo notifications',
              )
              await axios.post('/api/notifications/dismiss-for-todo', {
                todoId,
              })
            } else if (originalDueDate && !updateData.due_date) {
              console.log('🔔 TodoEditPage - Removing due date notifications')
              await axios.delete(`/api/notifications/delete-for-todo/${todoId}`)
            } else {
              console.log('🔔 TodoEditPage - Refreshing notifications')
              await refreshNotifications()
            }
          } catch (error) {
            console.error(
              '❌ TodoEditPage - Error managing notifications:',
              error,
            )
          }

          // Aguarda um pequeno delay para garantir que o cache foi atualizado
          await new Promise((resolve) => setTimeout(resolve, 200))

          // Redireciona para a página de detalhes
          console.log('🔄 TodoEditPage - Redirecting to todo details')
          router.push(`/todo/${todoId}`)
        },
        onError: (error) => {
          console.error('❌ TodoEditPage - Error updating todo:', error)
          showError(
            error instanceof Error ? error.message : t('errorUpdatingTask'),
          )
        },
      },
    )
  }

  const { dialogState, openConfirmDialog, closeConfirmDialog } =
    useConfirmationDialog()

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      openConfirmDialog({
        title: t('discardChanges'),
        description: t('discardChangesDescription'),
        variant: 'warning',
        confirmText: t('discard'),
        cancelText: t('stay'),
        onConfirm: () => {
          router.push(`/todo/${todoId}`)
          closeConfirmDialog()
        },
      })
    } else {
      router.push(`/todo/${todoId}`)
    }
  }

  const handleConfirmClearDueDate = () => {
    if (formData.due_date) {
      openConfirmDialog({
        title: t('clearDueDate'),
        description: t('clearDueDateDescription'),
        variant: 'warning',
        confirmText: t('clear'),
        cancelText: t('cancel'),
        onConfirm: () => {
          handleClearDueDate()
          closeConfirmDialog()
        },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          aria-label={t('goBack')}
          onClick={handleCancel}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <FaArrowLeft className="mr-2" />
          <span>{t('backToDetails')}</span>
        </button>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          {t('editTask')}
        </div>
      </div>

      {/* Edit Form */}
      <div className="dark:bg-BlackLight overflow-hidden rounded-lg bg-white shadow-lg">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Title field */}
          <div className="mb-4">
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('titleWithAsterisk')}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder={t('taskTitle')}
            />
          </div>

          {/* Description field */}
          <div className="mb-4">
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('description')}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder={t('taskDescription')}
            ></textarea>
          </div>

          {/* Priority, Status and Due date */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="priority"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <FaFlag className="mr-1 inline text-blue-500" />
                {t('priority')}
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="1">{t('lowPriority')}</option>
                <option value="2">{t('mediumPriority')}</option>
                <option value="3">{t('highPriority')}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <FaExclamationCircle className="mr-1 inline text-blue-500" />
                {t('status')}
              </label>
              <select
                id="status"
                name="status"
                value={
                  formData.status === 'completed' ? 'active' : formData.status
                }
                onChange={handleChange}
                disabled={formData.is_completed}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="active">{t('statusActive')}</option>
                <option value="review">{t('statusInReview')}</option>
              </select>
              {formData.is_completed && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('statusCompletedInfo')}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="due_date"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <FaClock className="mr-1 inline text-blue-500" />
                {t('dueDate')}
              </label>
              <div className="flex">
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full rounded-l-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {formData.due_date && (
                  <button
                    aria-label={t('clearDueDate')}
                    type="button"
                    onClick={handleConfirmClearDueDate}
                    className="rounded-r-md border border-l-0 border-gray-300 bg-red-100 px-3 hover:bg-red-200 dark:border-gray-600 dark:bg-red-900 dark:text-white dark:hover:bg-red-800"
                    title={t('clearDueDate')}
                  >
                    <FaCalendarTimes className="text-red-500 dark:text-red-300" />
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.due_date ? t('clearDueDateHelp') : t('noDueDateHelp')}
              </p>
            </div>
          </div>

          {/* Status checkbox */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_completed"
                name="is_completed"
                checked={formData.is_completed}
                onChange={handleChange}
                className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="is_completed"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                {t('markAsCompleted')}
              </label>
            </div>
          </div>

          {/* Form buttons */}
          <div className="flex justify-end space-x-3">
            <button
              aria-label={t('cancelEdit')}
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FaTimes className="mr-1 inline" /> {t('cancel')}
            </button>
            <button
              aria-label={t('saveEdit')}
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              disabled={updateTodoMutation.isPending}
            >
              {updateTodoMutation.isPending ? (
                <>
                  <svg
                    className="mr-2 -ml-1 inline size-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t('saving')}
                </>
              ) : (
                <>
                  <FaSave className="mr-1 inline" /> {t('saveChanges')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
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

export default TodoEditPage
