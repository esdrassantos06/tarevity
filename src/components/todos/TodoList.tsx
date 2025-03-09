'use client'

import { useState, useEffect } from 'react'
import TodoItem from './TodoItem'
import TodoForm from './TodoForm'
import TodoFilters from './TodoFilters'
import { toast } from 'react-toastify'

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

  // Carregar tarefas
  const fetchTodos = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Fetching todos from API...')

      const response = await fetch('/api/todos', {
        // Include credentials to send session cookies
        credentials: 'include',
      })

      console.log('API response status:', response.status)

      if (!response.ok) {
        // Try to get detailed error message
        let errorMessage = 'Falha ao carregar tarefas'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e: unknown) {
          let errorMessage: string

          if (e instanceof Error) {
            // Caso o erro seja do tipo Error, usa a mensagem de erro
            errorMessage = e.message
          } else {
            // Se não for um erro, usa o status e statusText da resposta
            errorMessage = `${response.status}: ${response.statusText}`
          }

          console.error(errorMessage)
        }

        console.error('Error response:', errorMessage)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Todos fetched successfully:', data.length)

      setTodos(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error in fetchTodos:', err)
        setError(err.message || 'Ocorreu um erro ao carregar as tarefas')
      } else {
        console.error('Error in fetchTodos:', err)
        setError('Ocorreu um erro ao carregar as tarefas')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Efeito para carregar tarefas ao montar o componente
  useEffect(() => {
    fetchTodos()
  }, [])

  // Efeito para aplicar filtros
  useEffect(() => {
    let result = [...todos]

    // Filtrar por status
    if (filters.status === 'active') {
      result = result.filter((todo) => !todo.is_completed)
    } else if (filters.status === 'completed') {
      result = result.filter((todo) => todo.is_completed)
    }

    // Filtrar por prioridade
    if (filters.priority !== 'all') {
      const priorityValue = parseInt(filters.priority)
      result = result.filter((todo) => todo.priority === priorityValue)
    }

    // Filtrar por texto de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchLower) ||
          (todo.description &&
            todo.description.toLowerCase().includes(searchLower)),
      )
    }

    setFilteredTodos(result)
  }, [todos, filters])

  // Alternar o status de conclusão de uma tarefa
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
        throw new Error('Falha ao atualizar tarefa')
      }

      const data = await response.json()

      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? data : todo)),
      )

      toast.success(isCompleted ? 'Tarefa concluída!' : 'Tarefa reaberta!')
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Ocorreu um erro ao atualizar a tarefa')
        console.error('Erro ao atualizar tarefa:', err)
      } else {
        toast.error('Ocorreu um erro ao atualizar a tarefa')
        console.error('Erro ao atualizar tarefa:', err)
      }
    }
  }

  // Adicionar nova tarefa
  const handleAddTodo = async (todoData: TodoFormData) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
        credentials: 'include',
      })

      console.log('API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch((e: unknown) => {
          if (e instanceof Error) {
            return { message: e.message || 'Could not parse error response' }
          } else {
            return { message: 'Could not parse error response' }
          }
        })
        throw new Error(errorData.message || 'Falha ao criar tarefa')
      }

      const newTodo = await response.json()
      setTodos((prevTodos) => [newTodo, ...prevTodos])
      setShowForm(false)

      toast.success('Tarefa criada com sucesso!')
    } catch (err: unknown) {
      let errorMessage = 'Erro desconhecido ao criar tarefa'
      if (err instanceof Error) {
        errorMessage = err.message
      }
      toast.error(errorMessage)
      console.error('Error in handleAddTodo:', err)
    }
  }

  // Editar tarefa existente
  const handleEditTodo = async (id: string, todoData: Partial<Todo>) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      })

      if (!response.ok) {
        throw new Error('Falha ao atualizar tarefa')
      }

      const updatedTodo = await response.json()

      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo)),
      )

      setEditingTodoId(null)
      toast.success('Tarefa atualizada com sucesso!')
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Ocorreu um erro ao atualizar a tarefa')
        console.error('Erro ao atualizar tarefa:', err)
      } else {
        toast.error('Ocorreu um erro ao atualizar a tarefa')
        console.error('Erro ao atualizar tarefa:', err)
      }
    }
  }

  // Excluir tarefa
  const handleDeleteTodo = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Falha ao excluir tarefa')
      }

      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id))
      toast.success('Tarefa excluída com sucesso!')
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Ocorreu um erro ao excluir a tarefa')
        console.error('Erro ao excluir tarefa:', err)
      } else {
        toast.error('Ocorreu um erro ao excluir a tarefa')
        console.error('Erro ao excluir tarefa:', err)
      }
    }
  }

  // Iniciar edição de uma tarefa
  const handleStartEdit = (id: string) => {
    setEditingTodoId(id)
  }

  // Cancelar edição de uma tarefa
  const handleCancelEdit = () => {
    setEditingTodoId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Minhas Tarefas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primaryHover rounded-md px-4 py-2 text-white transition-colors"
        >
          {showForm ? 'Cancelar' : 'Nova Tarefa'}
        </button>
      </div>

      {showForm && (
        <div className="bg-cardLightMode dark:bg-cardDarkMode rounded-lg p-4 shadow">
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
            Carregando tarefas...
          </p>
        </div>
      ) : error ? (
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>{error}</p>
          <button onClick={fetchTodos} className="mt-2 text-sm underline">
            Tentar novamente
          </button>
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="py-8 text-center text-gray-600 dark:text-gray-400">
          {todos.length === 0 ? (
            <p>Você ainda não tem tarefas. Crie sua primeira tarefa agora!</p>
          ) : (
            <p>Nenhuma tarefa corresponde aos filtros selecionados.</p>
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
                  onDelete={handleDeleteTodo}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}