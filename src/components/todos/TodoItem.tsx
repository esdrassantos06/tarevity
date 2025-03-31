'use client'

import React, { memo } from 'react'
import { useRouter } from 'next/navigation'
import { Todo } from '@/lib/api'
import {
  FaEdit,
  FaTrash,
  FaClock,
  FaFlag,
  FaExclamationCircle,
  FaCheck,
} from 'react-icons/fa'
import { useTranslations } from 'next-intl'

interface TodoItemProps {
  todo: Todo
  onToggleComplete: (
    id: string,
    isCompleted: boolean,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void
  onSetReview: (e: React.MouseEvent, id: string) => void
  onApproveReview: (e: React.MouseEvent, id: string) => void
  onDelete: (id: string, title: string) => void
  className?: string
}

const TodoItem = memo(
  function TodoItem({
    todo,
    onToggleComplete,
    onSetReview,
    onApproveReview,
    onDelete,
    className,
  }: TodoItemProps) {
    const t = useTranslations('todoItem')
    const router = useRouter()
    const isReview = todo.status === 'review'

    const formatDate = (dateString: string | null) => {
      if (!dateString) return null
      const date = new Date(dateString)
      const months = [
        t('months.jan'),
        t('months.feb'),
        t('months.mar'),
        t('months.apr'),
        t('months.may'),
        t('months.jun'),
        t('months.jul'),
        t('months.aug'),
        t('months.sep'),
        t('months.oct'),
        t('months.nov'),
        t('months.dec'),
      ]
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    }

    const handleItemClick = () => {
      router.push(`/todo/${todo.id}`)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleItemClick()
      }
    }

    const getPriorityInfo = (priority: number) => {
      switch (priority) {
        case 3:
          return {
            color: 'bg-red-500',
            label: t('priority.high'),
            textColor: 'text-red-500',
          }
        case 2:
          return {
            color: 'bg-yellow-500',
            label: t('priority.medium'),
            textColor: 'text-yellow-500',
          }
        case 1:
        default:
          return {
            color: 'bg-green-500',
            label: t('priority.low'),
            textColor: 'text-green-500',
          }
      }
    }

    const priority = getPriorityInfo(todo.priority)
    const dueDate = todo.due_date ? formatDate(todo.due_date) : null
    const completedText = todo.is_completed ? t('completed') : t('notCompleted')
    const reviewText = isReview ? t('inReview') : ''

    return (
      <div
        className={`dark:bg-BlackLight flex h-64 flex-grow cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none hover:shadow-lg ${isReview ? 'border-l-4 border-amber-500' : ''} ${className}`}
        onClick={handleItemClick}
        onKeyDown={handleKeyPress}
        tabIndex={0}
        role="button"
        aria-label={t('taskAriaLabel', {
          title: todo.title,
          status: completedText,
          review: reviewText ? `. ${reviewText}` : '',
          priority: priority.label,
          due: dueDate ? t('dueDate', { date: dueDate }) : '',
        })}
      >
        <div className="flex flex-grow flex-col overflow-hidden p-4">
          <div className="mb-2 flex items-start justify-between">
            <div className="mr-2 flex items-center overflow-hidden">
              <div
                className={`size-5 flex-shrink-0 rounded-full ${priority.color} mr-2`}
                aria-hidden="true"
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
                id={`complete-${todo.id}`}
                checked={todo.is_completed}
                onChange={(e) =>
                  onToggleComplete(todo.id, todo.is_completed, e)
                }
                onClick={(e) => e.stopPropagation()}
                className="size-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={t('markTaskAs', {
                  title: todo.title,
                  status: todo.is_completed
                    ? t('notCompleted')
                    : t('completed'),
                })}
              />
            </div>
          </div>

          {isReview && (
            <div className="mb-2 flex items-center text-sm text-amber-600 dark:text-amber-400">
              <FaExclamationCircle
                className="mr-1 flex-shrink-0"
                aria-hidden="true"
              />
              <span>{t('inReview')}</span>
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
              <FaFlag
                className={`mr-1 ${priority.textColor}`}
                aria-hidden="true"
              />
              <span>
                {t('priorityLabel')}: {priority.label}
              </span>
            </div>

            {dueDate && (
              <div className="flex items-center">
                <FaClock className="mr-1" aria-hidden="true" />
                <span>
                  {t('due')}: {dueDate}
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className="mt-auto flex justify-end space-x-2 border-t border-gray-200 p-2 dark:border-gray-700"
          aria-label={t('taskActions')}
        >
          {!isReview && !todo.is_completed && (
            <button
              className="rounded p-1 text-amber-500 hover:text-amber-700 focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-amber-400"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onSetReview(e, todo.id)
              }}
              onMouseDown={(e) => e.preventDefault()}
              aria-label={t('setToReview', { title: todo.title })}
              title={t('setToReviewTitle')}
            >
              <FaExclamationCircle aria-hidden="true" />
            </button>
          )}
          {isReview && (
            <button
              className="rounded p-1 text-green-500 hover:text-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none dark:text-green-400"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onApproveReview(e, todo.id)
              }}
              onMouseDown={(e) => e.preventDefault()}
              aria-label={t('approve', { title: todo.title })}
              title={t('approveTitle')}
            >
              <FaCheck aria-hidden="true" />
            </button>
          )}
          <button
            className="rounded p-1 text-blue-500 hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-blue-400"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/todo/${todo.id}/edit`)
            }}
            aria-label={t('edit', { title: todo.title })}
            title={t('editTask')}
          >
            <FaEdit aria-hidden="true" />
          </button>
          <button
            className="rounded p-1 text-red-500 hover:text-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-red-400"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(todo.id, todo.title)
            }}
            aria-label={t('delete', { title: todo.title })}
            title={t('deleteTask')}
          >
            <FaTrash aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.todo) === JSON.stringify(nextProps.todo) &&
      prevProps.className === nextProps.className
    )
  },
)

export default TodoItem
