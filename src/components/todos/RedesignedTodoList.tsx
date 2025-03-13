'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  FaEdit,
  FaTrash,
  FaClock,
  FaFlag,
  FaEllipsisH
} from 'react-icons/fa'
import { FiPlus } from 'react-icons/fi'
import { useTodosQuery, useUpdateTodoMutation } from '@/hooks/useTodosQuery'
import ExpandableSearch from '@/components/todos/ExpandableSearch'

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
  
  const RedesignedTodoList: React.FC = () => {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
  
    
  
    // React Query hooks
    const { data: todos = [], isLoading } = useTodosQuery()
    const updateTodoMutation = useUpdateTodoMutation()
  
    // Filter todos based on selected filter and search query
    const filteredTodos = useMemo(() => {
      let result = [...todos]
  
      // Filter by status tab
      if (activeTab === 'active') {
        result = result.filter((todo) => !todo.is_completed)
      } else if (activeTab === 'completed') {
        result = result.filter((todo) => todo.is_completed)
      } else if (activeTab === 'review') {
        // For example, let's consider "review" as medium priority tasks
        result = result.filter((todo) => todo.priority === 2)
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
  
      // Sort by priority and completion status
      return result.sort((a, b) => {
        // First sort by completion status
        if (a.is_completed !== b.is_completed) {
          return a.is_completed ? 1 : -1
        }
        // Then by priority (higher priority first)
        return b.priority - a.priority
      })
    }, [todos, activeTab, searchQuery])
  
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
      e.stopPropagation() // Prevent navigation
      const todoToUpdate = todos.find((todo) => todo.id === id)
      if (!todoToUpdate) return
  
      updateTodoMutation.mutate({
        id,
        data: { ...todoToUpdate, is_completed: !isCompleted },
      })
    }
  
    // Get priority color and label
    const getPriorityInfo = (priority: number) => {
      switch (priority) {
        case 3:
          return { color: 'bg-red-500', label: 'High' }
        case 2:
          return { color: 'bg-yellow-500', label: 'Medium' }
        case 1:
        default:
          return { color: 'bg-green-500', label: 'Low' }
      }
    }
  
    // Calculate stats
    const stats = useMemo(() => {
      const total = todos.length
      const active = todos.filter((todo) => !todo.is_completed).length
      const completed = todos.filter((todo) => todo.is_completed).length
      const review = todos.filter((todo) => todo.priority === 2).length
      const toDo = todos.filter((todo) => todo.priority === 3).length
  
      return { total, active, completed, review, toDo }
    }, [todos])
  
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
          <div className="flex sm:flex-row flex-col sm:items-center justify-between">
            <h1 className="mb-2 text-5xl font-bold text-gray-900 dark:text-white">
              Projects
            </h1>
            <div className='flex sm:flex-row max-xs:flex-col justify-around sm:mt-0 mt-4 sm:items-center items-start gap-4'>
              <button
                onClick={() => router.push('/todo/new')}
                className="flex cursor-pointer items-center justify-center w-40 gap-2 rounded-lg bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <FiPlus size={25} /> Create Project
              </button>
              <ExpandableSearch
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
  
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Stats section */}
            <div className="rounded-lg p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{stats.total} Projects</h2>
              </div>
  
              <div className="mb-4 flex items-center gap-10">
                <div className="relative h-16">
                  <svg viewBox="0 0 100 100" className="h-16 w-16">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="15"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="15"
                      strokeDasharray={`${stats.total ? (stats.active / stats.total) * 251.2 : 0} 251.2`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="15"
                      strokeDasharray={`${stats.total ? (stats.completed / stats.total) * 251.2 : 0} 251.2`}
                      strokeDashoffset={`${stats.total ? -1 * (stats.active / stats.total) * 251.2 : 0}`}
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="15"
                      strokeDasharray={`${stats.total ? (stats.review / stats.total) * 251.2 : 0} 251.2`}
                      strokeDashoffset={`${stats.total ? -1 * ((stats.active + stats.completed) / stats.total) * 251.2 : 0}`}
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="15"
                      strokeDasharray={`${stats.total ? (stats.toDo / stats.total) * 251.2 : 0} 251.2`}
                      strokeDashoffset={`${stats.total ? -1 * ((stats.active + stats.completed + stats.review) / stats.total) * 251.2 : 0}`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>
                <div className="flex">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-blue-600"></div>
                      <span className="text-sm">Active</span>
                      <span className="ml-2 text-sm font-medium">
                        {stats.active}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-purple-600"></div>
                      <span className="text-sm">Completed</span>
                      <span className="ml-2 text-sm font-medium">
                        {stats.completed}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Review</span>
                      <span className="ml-2 text-sm font-medium">
                        {stats.review}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">All</span>
                      <span className="ml-2 text-sm font-medium">
                        {stats.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          {/* Filtering tabs */}
          <div className="mb-4 flex space-x-4 overflow-x-auto pb-2">
            <button
              className={`flex items-center px-4 py-2 ${activeTab === 'all' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'} rounded-md font-medium`}
              onClick={() => setActiveTab('all')}
            >
              <span className="mr-2 h-3 w-3 rounded-full bg-blue-600"></span>
             All
            </button>
            <div className="border-r border-gray-300 dark:border-gray-600"></div>
            <button
              className={`px-4 py-2 ${activeTab === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'} rounded-md font-medium`}
              onClick={() => setActiveTab('active')}
            >
              <span className="mr-1">•</span> Active
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'completed' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'} rounded-md font-medium`}
              onClick={() => setActiveTab('completed')}
            >
              <span className="mr-1">•</span> Completed
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'review' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' : 'text-gray-700 dark:text-gray-300'} rounded-md font-medium`}
              onClick={() => setActiveTab('review')}
            >
              <span className="mr-1">•</span> Review
            </button>
          </div>
        </div>
  
        {/* Todo Items Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTodos.map((todo) => {
            const priority = getPriorityInfo(todo.priority)
            const dueDate = todo.due_date ? formatDate(todo.due_date) : null
  
            return (
              <div
                key={todo.id}
                className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
                onClick={() => handleTodoClick(todo.id)}
              >
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center">
                      <div
                        className={`h-5 w-5 rounded-full ${priority.color} mr-2 flex-shrink-0`}
                      ></div>
                      <h3
                        className={`text-lg font-medium ${todo.is_completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}
                      >
                        {todo.title}
                      </h3>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={todo.is_completed}
                        onChange={(e) =>
                          handleCheckboxChange(e, todo.id, todo.is_completed)
                        }
                        className="h-4 w-4 rounded text-blue-600"
                      />
                    </div>
                  </div>
  
                  {todo.description && (
                    <p
                      className={`mb-3 text-sm ${todo.is_completed ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      {todo.description.length > 100
                        ? `${todo.description.substring(0, 100)}...`
                        : todo.description}
                    </p>
                  )}
  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <FaFlag
                        className={`mr-1 ${priority.color === 'bg-red-500' ? 'text-red-500' : priority.color === 'bg-yellow-500' ? 'text-yellow-500' : 'text-green-500'}`}
                      />
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
  
                <div className="flex justify-end space-x-2 border-t border-gray-200 p-2 dark:border-gray-700">
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
                      // Add delete confirmation logic
                      if (
                        window.confirm(
                          'Are you sure you want to delete this task?',
                        )
                      ) {
                        // We would use deleteTodoMutation here
                      }
                    }}
                  >
                    <FaTrash />
                  </button>
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Add more options logic
                    }}
                  >
                    <FaEllipsisH />
                  </button>
                </div>
              </div>
            )
          })}
  
          {/* Add new todo button */}
          <div
            className="flex h-48 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-500"
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
      </div>
    )
  }
  
  export default RedesignedTodoList