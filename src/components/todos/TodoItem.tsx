'use client'

import React from 'react'
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

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onSetReview,
  onApproveReview,
  onDelete,
  className,
}) => {
  const router = useRouter()
  const isReview = todo.status === 'review'

  const handleItemClick = () => {
    router.push(`/todo/${todo.id}`)
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

  return (
    <div
      className={`dark:bg-BlackLight flex h-64 flex-grow cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg ${isReview ? 'border-l-4 border-amber-500' : ''} ${className}`}
      onClick={handleItemClick}
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
              onChange={(e) => onToggleComplete(todo.id, todo.is_completed, e)}
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
            onClick={(e) => onSetReview(e, todo.id)}
            title="Set to Review"
          >
            <FaExclamationCircle />
          </button>
        )}
        {isReview && (
          <button
            className="p-1 text-green-500 hover:text-green-700 dark:text-green-400"
            onClick={(e) => onApproveReview(e, todo.id)}
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
            onDelete(todo.id, todo.title)
          }}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  )
}

export default TodoItem
