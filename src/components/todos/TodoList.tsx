'use client'

import { useState, useEffect, useCallback } from 'react'
import TodoItem from './TodoItem'
import TodoForm from './TodoForm'
import TodoFilters from './TodoFilters'
import { toast } from 'react-toastify'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/common/Dialog'

interface Todo {
  id: string
  title: string
  description: string | null
  is_completed: boolean
  priority: number
  due_date: string | null
  created_at: string
  updated_at: string
}

interface TodoFormData {
  title: string
  description?: string | null
  priority: number
  due_date?: string | null
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
  })
  
  // Custom direct dialog state (without the hook)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogLoading, setDialogLoading] = useState(false)
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null)

  // Load tasks
  const fetchTodos = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/todos', {
        // Include credentials to send session cookies
        credentials: 'include',
      })

      if (!response.ok) {
        // Try to get detailed error message
        let errorMessage = 'Failed to load tasks'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e: unknown) {
          let errorMessage: string

          if (e instanceof Error) {
            // If the error is of Error type, use the error message
            errorMessage = e.message
          } else {
            // If it's not an error, use the response status and statusText
            errorMessage = `${response.status}: ${response.statusText}`
          }

          console.error(errorMessage)
        }

        console.error('Error response:', errorMessage)
        throw new Error(errorMessage)
      }

      const data = await response.json()

      setTodos(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error in fetchTodos:', err)
        setError(err.message || 'An error occurred while loading tasks')
      } else {
        console.error('Error in fetchTodos:', err)
        setError('An error occurred while loading tasks')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Effect to load tasks when the component mounts
  useEffect(() => {
    fetchTodos()
  }, [])

  // Effect to apply filters
  useEffect(() => {
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

    result.sort((a , b) =>{
      if(a.is_completed !== b.is_completed){
        return a.is_completed ? 1 : -1;
      }

      return b.priority - a.priority;
    })

    setFilteredTodos(result)
  }, [todos, filters])

  // Toggle the completion status of a task
  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      const todoToUpdate = todos.find((todo) => todo.id === id)
      if (!todoToUpdate) return

      const updatedTodo = { ...todoToUpdate, is_completed: isCompleted }

      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const data = await response.json()

      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? data : todo)),
      )

      toast.success(isCompleted ? 'Task completed!' : 'Task reopened!')
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'An error occurred while updating the task')
        console.error('Error updating task:', err)
      } else {
        toast.error('An error occurred while updating the task')
        console.error('Error updating task:', err)
      }
    }
  }

  // Add new task
  const handleAddTodo = async (todoData: TodoFormData) => {
    try {
      console.log("Sending data to API:", JSON.stringify(todoData));
      
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
        credentials: 'include',
      });

      // Log the raw response for debugging
      console.log("Response status:", response.status);
      console.log("Response OK:", response.ok);
      
      // Try to get the response body as text first for debugging
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      // If the response is not ok, try to parse it as JSON or use the text
      if (!response.ok) {
        let errorMessage = 'Failed to create task';
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
          console.error("Error details:", errorData);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (parseError) {
          // If parsing fails, use the response text
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Parse the successful response
      const newTodo = JSON.parse(responseText);
      setTodos((prevTodos) => [newTodo, ...prevTodos]);
      setShowForm(false);

      toast.success('Task created successfully!');
    } catch (err: unknown) {
      let errorMessage = 'Unknown error when creating task';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
      console.error('Error in handleAddTodo:', err);
    }
  }

  // Edit existing task
  const handleEditTodo = async (id: string, todoData: Partial<Todo>) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const updatedTodo = await response.json()

      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo)),
      )

      setEditingTodoId(null)
      toast.success('Task updated successfully!')
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'An error occurred while updating the task')
        console.error('Error updating task:', err)
      } else {
        toast.error('An error occurred while updating the task')
        console.error('Error updating task:', err)
      }
    }
  }

  // Show delete confirmation dialog
  const confirmDelete = useCallback((id: string) => {
    setTodoToDelete(id);
    setDialogOpen(true);
  }, []);

  // Handle actual deletion
  const handleDeleteConfirmed = useCallback(async () => {
    if (!todoToDelete) return;
    
    setDialogLoading(true);
    try {
      const response = await fetch(`/api/todos/${todoToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== todoToDelete));
      toast.success('Task deleted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the task';
      toast.error(errorMessage);
      console.error('Error deleting task:', err);
    } finally {
      setDialogLoading(false);
      setDialogOpen(false);
      setTodoToDelete(null);
    }
  }, [todoToDelete]);

  // Close dialog without deleting
  const handleCancelDelete = useCallback(() => {
    setDialogOpen(false);
    setTodoToDelete(null);
  }, []);

  // Start editing a task
  const handleStartEdit = (id: string) => {
    setEditingTodoId(id)
  }

  // Cancel editing a task
  const handleCancelEdit = () => {
    setEditingTodoId(null)
  }

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
        <div className="bg-white dark:bg-BlackLight rounded-lg p-4 shadow">
          <TodoForm
            onSubmit={handleAddTodo}
            onCancel={() => setShowForm(false)}
          />
        </div>
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
          <p>{error}</p>
          <button onClick={fetchTodos} className="mt-2 text-sm underline">
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
                <div className="bg-cardLightMode dark:bg-cardDarkMode rounded-lg p-4 shadow">
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
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={handleCancelDelete}
              disabled={dialogLoading}
              className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirmed}
              disabled={dialogLoading}
              className="py-2 px-4 rounded-md font-medium text-white bg-red-600 hover:bg-red-700"
            >
              {dialogLoading ? 'Deleting...' : 'Delete'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}