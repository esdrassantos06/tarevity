'use client'

import { useState, useEffect, useCallback } from 'react'
import TodoItem from './TodoItem'
import TodoForm from './TodoForm'
import TodoFilters from './TodoFilters'
import { toast } from 'react-toastify'
import { todoAPI, Todo, TodoFormData } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/common/Dialog'


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

  // Load tasks using the API library
  const fetchTodos = async () => {
    setIsLoading(true)
    setError(null)
    
    const result = await todoAPI.getAllTodos()
    
    if (result.error) {
      console.error('Error fetching todos:', result.error)
      setError(result.error.message || 'An error occurred while loading tasks')
    } else if (result.data) {
      setTodos(result.data)
    }
    
    setIsLoading(false)
  }

  // Effect to load tasks when the component mounts
  useEffect(() => {
    fetchTodos()
  }, [])

  // Effect to apply filters (this remains unchanged as it's local logic)
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

    result.sort((a, b) =>{
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

      const result = await todoAPI.updateTodo(id, updatedTodo)

      if (result.error) {
        throw new Error(result.error.message || 'Failed to update task')
      }

      if (result.data) {
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo.id === id ? result.data! : todo)),
        )

        toast.success(isCompleted ? 'Task completed!' : 'Task reopened!')
      }
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
    console.log("Sending data to API:", JSON.stringify(todoData))
    
    const result = await todoAPI.createTodo(todoData)
    
    if (result.error) {
      toast.error(result.error.message || 'Failed to create task')
      console.error('Error creating task:', result.error)
      return
    }
    
    if (result.data) {
      setTodos((prevTodos) => [result.data!, ...prevTodos])
      setShowForm(false)
      toast.success('Task created successfully!')
    }
  }

  // Edit existing task
  const handleEditTodo = async (id: string, todoData: Partial<Todo>) => {
    const result = await todoAPI.updateTodo(id, todoData)
    
    if (result.error) {
      toast.error(result.error.message || 'Failed to update task')
      console.error('Error updating task:', result.error)
      return
    }
    
    if (result.data) {
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? result.data! : todo)),
      )
      
      setEditingTodoId(null)
      toast.success('Task updated successfully!')
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
    
    const result = await todoAPI.deleteTodo(todoToDelete)
    
    if (result.error) {
      toast.error(result.error.message || 'Failed to delete task')
      console.error('Error deleting task:', result.error)
    } else {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== todoToDelete))
      toast.success('Task deleted successfully!')
    }
    
    setDialogLoading(false)
    setDialogOpen(false)
    setTodoToDelete(null)
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

  // Rest of component remains the same
  // ...

  return (
    <div className="space-y-6">
      {/* Component rendering remains the same */}
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
                <div className="bg-white dark:bg-BlackLight rounded-lg p-4 shadow">
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