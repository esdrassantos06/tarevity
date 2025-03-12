'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import dynamic from 'next/dynamic'
import TodoItem from './TodoItem'
import TodoFilters from './TodoFilters'
import { toast } from 'react-toastify'
import { todoAPI, Todo, TodoFormData } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/common/Dialog'


const TodoForm = dynamic(() => import('./TodoForm'), {
  loading: () => <div className="bg-white dark:bg-BlackLight rounded-lg p-4 shadow"><div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded"></div></div>,
  ssr: false // If this component is only client-side, disable SSR for it
})

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
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
  const fetchTodos = useCallback(async () => {
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
  }, [])

  // Effect to load tasks when the component mounts
  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  // Use memoization to derive filtered todos instead of using a separate state
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
      if(a.is_completed !== b.is_completed){
        return a.is_completed ? 1 : -1;
      }
      return b.priority - a.priority;
    });
    
  }, [todos, filters.status, filters.priority, filters.search]);

  // Toggle the completion status of a task with optimistic updates
  const handleToggleComplete = useCallback(async (id: string, isCompleted: boolean) => {
    try {
      const todoToUpdate = todos.find((todo) => todo.id === id)
      if (!todoToUpdate) return

      // Optimistically update the UI
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === id ? {...todo, is_completed: isCompleted} : todo
        )
      );

      const result = await todoAPI.updateTodo(id, {...todoToUpdate, is_completed: isCompleted})

      if (result.error) {
        // Revert the optimistic update if there's an error
        setTodos(prevTodos => 
          prevTodos.map(todo => 
            todo.id === id ? {...todo, is_completed: !isCompleted} : todo
          )
        );
        throw new Error(result.error.message || 'Failed to update task')
      }

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
  }, [todos]);

  // Add new task with optimistic update
  const handleAddTodo = useCallback(async (todoData: TodoFormData) => {
    try {
      
      // Create optimistic temporary ID
      const tempId = `temp-${Date.now()}`
      
      // Add optimistic todo to the list
      const optimisticTodo: Todo = {
        id: tempId,
        title: todoData.title,
        description: todoData.description || null,
        is_completed: todoData.is_completed || false,
        priority: todoData.priority,
        due_date: todoData.due_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setTodos(prevTodos => [optimisticTodo, ...prevTodos])
      setShowForm(false)
      
      const result = await todoAPI.createTodo(todoData)
      
      if (result.error) {
        // Remove the optimistic todo if there's an error
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== tempId))
        throw new Error(result.error.message || 'Failed to create task')
      }
      
      if (result.data) {
        // Replace the optimistic todo with the real one
        setTodos(prevTodos => 
          prevTodos.map(todo => todo.id === tempId ? result.data! : todo)
        )
        toast.success('Task created successfully!')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create task')
      console.error('Error creating task:', error)
    }
  }, []);

  // Other handlers converted to useCallback to prevent unnecessary re-renders

  const handleEditTodo = useCallback(async (id: string, todoData: Partial<Todo>) => {
    try {
      // Find the current todo
      const currentTodo = todos.find(todo => todo.id === id)
      if (!currentTodo) return
      
      // Optimistically update the UI
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === id ? {...todo, ...todoData} : todo
        )
      )
      
      const result = await todoAPI.updateTodo(id, todoData)
      
      if (result.error) {
        // Revert to the original todo if there's an error
        setTodos(prevTodos => 
          prevTodos.map(todo => 
            todo.id === id ? currentTodo : todo
          )
        )
        throw new Error(result.error.message || 'Failed to update task')
      }
      
      setEditingTodoId(null)
      toast.success('Task updated successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update task')
      console.error('Error updating task:', error)
    }
  }, [todos]);

  const confirmDelete = useCallback((id: string) => {
    setTodoToDelete(id);
    setDialogOpen(true);
  }, []);

  const handleDeleteConfirmed = useCallback(async () => {
    if (!todoToDelete) return;
    
    try {
      setDialogLoading(true);
      
      // Optimistically remove the todo
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoToDelete))
      
      const result = await todoAPI.deleteTodo(todoToDelete)
      
      if (result.error) {
        // This would require fetching the todo again since we've already removed it
        // For simplicity, we'll just show an error and refresh the list
        throw new Error(result.error.message || 'Failed to delete task')
      }
      
      toast.success('Task deleted successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete task')
      console.error('Error deleting task:', error)
      // Refresh todos to get the current state
      fetchTodos()
    } finally {
      setDialogLoading(false)
      setDialogOpen(false)
      setTodoToDelete(null)
    }
  }, [todoToDelete, fetchTodos]);

  const handleCancelDelete = useCallback(() => {
    setDialogOpen(false);
    setTodoToDelete(null);
  }, []);

  const handleStartEdit = useCallback((id: string) => {
    setEditingTodoId(id)
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingTodoId(null)
  }, []);

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
        <Suspense fallback={<div className="bg-white dark:bg-BlackLight rounded-lg p-4 shadow"><div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded"></div></div>}>
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