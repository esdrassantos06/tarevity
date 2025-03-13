// src/hooks/useTodosQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { todoAPI, Todo, TodoFormData } from '@/lib/api'

export function useTodosQuery() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const result = await todoAPI.getAllTodos()
      if (result.error) throw new Error(result.error.message)
      return result.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateTodoMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (todoData: TodoFormData) => todoAPI.createTodo(todoData),
    // Atualização otimista com onMutate
    onMutate: async (newTodoData) => {
      // Cancelar consultas em andamento
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      
      // Salvar o estado anterior
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']) || []
      
      // Criar um ID temporário para a tarefa otimista
      const tempId = `temp-${Date.now()}`
      
      // Construir a tarefa otimista
      const optimisticTodo: Todo = {
        id: tempId,
        title: newTodoData.title,
        description: newTodoData.description || null,
        is_completed: newTodoData.is_completed || false,
        priority: newTodoData.priority,
        due_date: newTodoData.due_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      // Atualizar o cache
      queryClient.setQueryData<Todo[]>(['todos'], old => [optimisticTodo, ...(old || [])])
      
      // Retornar o contexto com o estado anterior e o ID temporário
      return { previousTodos, tempId }
    },
    onError: (err, newTodo, context) => {
      // Em caso de erro, reverter para o estado anterior
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
      }
    },
    onSuccess: (result, variables, context) => {
      if (result.data && context?.tempId) {
        // Atualizar a entrada temporária com a entrada real do servidor
        queryClient.setQueryData<Todo[]>(['todos'], old => 
          old?.map(todo => 
            todo.id === context.tempId ? result.data! : todo
          )
        )
      }
    },
    onSettled: () => {
      // Independentemente do resultado, revalidar a consulta
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Todo> }) => 
      todoAPI.updateTodo(id, data),
    
    // Atualização otimista
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])
      
      queryClient.setQueryData<Todo[]>(['todos'], old => 
        old?.map(todo => 
          todo.id === id ? { ...todo, ...data } : todo
        )
      )
      
      return { previousTodos }
    },
    
    onError: (err, newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
      }
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => todoAPI.deleteTodo(id),
    
    // Atualização otimista
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])
      
      queryClient.setQueryData<Todo[]>(['todos'], old => 
        old?.filter(todo => todo.id !== id)
      )
      
      return { previousTodos }
    },
    
    onError: (err, id, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
      }
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}