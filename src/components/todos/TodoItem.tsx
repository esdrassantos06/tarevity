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

const TodoItem = memo(function TodoItem({
  todo,
  onToggleComplete,
  onSetReview,
  onApproveReview,
  onDelete,
  className,
}: TodoItemProps) {
  const router = useRouter()
  const isReview = todo.status === 'review'

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

  const priority = getPriorityInfo(todo.priority)
  const dueDate = todo.due_date ? formatDate(todo.due_date) : null
  const completedText = todo.is_completed ? 'Completed' : 'Not completed'
  const reviewText = isReview ? 'In review' : ''

  return (
    <div
      className={`dark:bg-BlackLight flex h-64 flex-grow cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none ${isReview ? 'border-l-4 border-amber-500' : ''} ${className}`}
      onClick={handleItemClick}
      onKeyDown={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`Task: ${todo.title}. Status: ${completedText}${reviewText ? `. ${reviewText}` : ''}. Priority: ${priority.label}${dueDate ? `. Due: ${dueDate}` : ''}`}
    >
      <div className="flex flex-grow flex-col overflow-hidden p-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="mr-2 flex items-center overflow-hidden">
            <div
              className={`h-5 w-5 flex-shrink-0 rounded-full ${priority.color} mr-2`}
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
              onChange={(e) => onToggleComplete(todo.id, todo.is_completed, e)}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Mark ${todo.title} as ${todo.is_completed ? 'not completed' : 'completed'}`}
            />
          </div>
        </div>

        {isReview && (
          <div className="mb-2 flex items-center text-sm text-amber-600 dark:text-amber-400">
            <FaExclamationCircle className="mr-1 flex-shrink-0" aria-hidden="true" />
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
            <FaFlag className={`mr-1 ${priority.textColor}`} aria-hidden="true" />
            <span>Priority: {priority.label}</span>
          </div>

          {dueDate && (
            <div className="flex items-center">
              <FaClock className="mr-1" aria-hidden="true" />
              <span>Due: {dueDate}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto flex justify-end space-x-2 border-t border-gray-200 p-2 dark:border-gray-700" aria-label="Task actions">
        {!isReview && !todo.is_completed && (
          <button
            className="p-1 text-amber-500 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded dark:text-amber-400"
            onClick={(e) => onSetReview(e, todo.id)}
            aria-label={`Set ${todo.title} to review`}
            title="Set to Review"
          >
            <FaExclamationCircle aria-hidden="true" />
          </button>
        )}
        {isReview && (
          <button
            className="p-1 text-green-500 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 rounded dark:text-green-400"
            onClick={(e) => onApproveReview(e, todo.id)}
            aria-label={`Approve ${todo.title}`}
            title="Approve"
          >
            <FaCheck aria-hidden="true" />
          </button>
        )}
        <button
          className="p-1 text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded dark:text-blue-400"
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/todo/${todo.id}/edit`)
          }}
          aria-label={`Edit ${todo.title}`}
          title="Edit task"
        >
          <FaEdit aria-hidden="true" />
        </button>
        <button
          className="p-1 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded dark:text-red-400"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(todo.id, todo.title)
          }}
          aria-label={`Delete ${todo.title}`}
          title="Delete task"
        >
          <FaTrash aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.title === nextProps.todo.title &&
    prevProps.todo.description === nextProps.todo.description &&
    prevProps.todo.is_completed === nextProps.todo.is_completed &&
    prevProps.todo.priority === nextProps.todo.priority &&
    prevProps.todo.due_date === nextProps.todo.due_date &&
    prevProps.todo.status === nextProps.todo.status &&
    prevProps.className === nextProps.className
  )
})

export default TodoItem