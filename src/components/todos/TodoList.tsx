'use client'

import { useState, useCallback, useMemo, Suspense } from 'react'
import dynamic from 'next/dynamic'
import TodoItem from './TodoItem'
import TodoFilters from './TodoFilters'
import { toast } from 'react-toastify'
import { TodoFormData, Todo } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/common/Dialog'
import { 
  useTodosQuery, 
  useCreateTodoMutation, 
  useUpdateTodoMutation, 
  useDeleteTodoMutation 
} from '@/hooks/useTodosQuery'

const TodoForm = dynamic(() => import('./TodoForm'), {
  loading: () => (
    <div className="dark:bg-BlackLight rounded-lg bg-white p-4 shadow">
      <div className="h-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  ),
  ssr: false,
})

export default function TodoList() {
  // UI state
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
  })

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null)

  // React Query hooks
  const { 
    data: todos = [], 
    isLoading, 
    error,
    refetch 
  } = useTodosQuery()
  
  const createTodoMutation = useCreateTodoMutation()
  const updateTodoMutation = useUpdateTodoMutation()
  const deleteTodoMutation = useDeleteTodoMutation()

  // Filter todos based on selected filters
  const filteredTodos = useMemo(() => {
    let result = [...todos]

    // Filter by status
    if (filters.status === 'active') {
      result = result.filter((todo) => !todo.is_completed)
    } else if (filters.status === 'completed') {
      result = result.filter((todo) => todo.is_completed)
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      const priorityValue = parseInt(filters.priority)
      result = result.filter((todo) => todo.priority === priorityValue)
    }

    // Filter by search text
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchLower) ||
          (todo.description &&
            todo.description.toLowerCase().includes(searchLower)),
      )
    }

    // Sort with completed tasks at the bottom and by priority
    return result.sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1
      }
      return b.priority - a.priority
    })
  }, [todos, filters.status, filters.priority, filters.search])

  // Toggle the completion status of a task
  const handleToggleComplete = useCallback(
    (id: string, isCompleted: boolean) => {
      const todoToUpdate = todos.find((todo) => todo.id === id)
      if (!todoToUpdate) return

      updateTodoMutation.mutate(
        { 
          id, 
          data: { ...todoToUpdate, is_completed: isCompleted } 
        },
        {
          onSuccess: () => {
            toast.success(isCompleted ? 'Task completed!' : 'Task reopened!')
          },
          onError: (error: unknown) => {
            toast.error(
              error instanceof Error 
                ? error.message 
                : 'An error occurred while updating the task'
            )
          }
        }
      )
    },
    [todos, updateTodoMutation]
  )

  // Add new task
  const handleAddTodo = useCallback((todoData: TodoFormData) => {
    createTodoMutation.mutate(todoData, {
      onSuccess: () => {
        setShowForm(false)
        toast.success('Task created successfully!')
      },
      onError: (error: unknown) => {
        toast.error(
          error instanceof Error 
            ? error.message 
            : 'Failed to create task'
        )
      }
    })
  }, [createTodoMutation])

  // Edit an existing task
  const handleEditTodo = useCallback(
    (id: string, todoData: Partial<Todo>) => {
      updateTodoMutation.mutate(
        { id, data: todoData },
        {
          onSuccess: () => {
            setEditingTodoId(null)
            toast.success('Task updated successfully!')
          },
          onError: (error: unknown) => {
            toast.error(
              error instanceof Error 
                ? error.message 
                : 'Failed to update task'
            )
          }
        }
      )
    },
    [updateTodoMutation]
  )

  // Handle deletion confirmation
  const confirmDelete = useCallback((id: string) => {
    setTodoToDelete(id)
    setDialogOpen(true)
  }, [])

  // Perform the actual deletion
  const handleDeleteConfirmed = useCallback(() => {
    if (!todoToDelete) return

    deleteTodoMutation.mutate(todoToDelete, {
      onSuccess: () => {
        toast.success('Task deleted successfully!')
        setDialogOpen(false)
        setTodoToDelete(null)
      },
      onError: (error: unknown) => {
        toast.error(
          error instanceof Error 
            ? error.message 
            : 'Failed to delete task'
        )
      },
      onSettled: () => {
        setDialogOpen(false)
        setTodoToDelete(null)
      }
    })
  }, [todoToDelete, deleteTodoMutation])

  const handleCancelDelete = useCallback(() => {
    setDialogOpen(false)
    setTodoToDelete(null)
  }, [])

  const handleStartEdit = useCallback((id: string) => {
    setEditingTodoId(id)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingTodoId(null)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">My Tasks</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/80 rounded-md px-4 py-2 text-white transition-colors"
        >
          {showForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {showForm && (
        <Suspense
          fallback={
            <div className="dark:bg-BlackLight rounded-lg bg-white p-4 shadow">
              <div className="h-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          }
        >
          <TodoForm
            onSubmit={handleAddTodo}
            onCancel={() => setShowForm(false)}
          />
        </Suspense>
      )}

      <TodoFilters filters={filters} setFilters={setFilters} />

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading tasks...
          </p>
        </div>
      ) : error ? (
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>{error instanceof Error ? error.message : 'Error loading tasks'}</p>
          <button onClick={() => refetch()} className="mt-2 text-sm underline">
            Try again
          </button>
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="py-8 text-center text-gray-600 dark:text-gray-400">
          {todos.length === 0 ? (
            <p>
              You don&apos;t have any tasks yet. Create your first task now!
            </p>
          ) : (
            <p>No tasks match the selected filters.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTodos.map((todo) => (
            <div key={todo.id}>
              {editingTodoId === todo.id ? (
                <div className="dark:bg-BlackLight rounded-lg bg-white p-4 shadow">
                  <TodoForm
                    initialData={todo}
                    onSubmit={(data) => handleEditTodo(todo.id, data)}
                    onCancel={handleCancelEdit}
                  />
                </div>
              ) : (
                <TodoItem
                  todo={todo}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleStartEdit}
                  onDelete={confirmDelete}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Custom Delete Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCancelDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={handleCancelDelete}
              disabled={deleteTodoMutation.isPending}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirmed}
              disabled={deleteTodoMutation.isPending}
              className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
            >
              {deleteTodoMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}