import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { todoAPI, Todo, TodoFormData } from '@/lib/api'
import { showSuccess, showError } from '@/lib/toast'
import { useTranslations } from 'next-intl'

export function useTodosQuery() {
  const t = useTranslations('useTodosQuery')

  return useQuery<Todo[], Error>({
    queryKey: ['todos'],
    queryFn: async () => {
      console.log('🔄 TodosQuery - Fetching todos from server')
      try {
        const result = await todoAPI.getAllTodos()
        if (result.error) throw new Error(result.error.message)
        console.log('✅ TodosQuery - Server response:', result.data)
        return result.data || []
      } catch (error) {
        console.error('❌ TodosQuery - Error fetching todos:', error)
        showError(
          error instanceof Error ? error.message : t('Failed to load tasks'),
        )
        throw error
      }
    },
    staleTime: 10000, // Aumentado para 10 segundos
    gcTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  })
}

export function useCreateTodoMutation() {
  const t = useTranslations('useTodosQuery')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (todoData: TodoFormData) => todoAPI.createTodo(todoData),

    onMutate: async (newTodoData) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']) || []

      const tempId = `temp-${Date.now()}`

      const optimisticTodo: Todo = {
        id: tempId,
        title: newTodoData.title,
        description: newTodoData.description || null,
        is_completed: newTodoData.is_completed || false,
        priority: newTodoData.priority,
        due_date: newTodoData.due_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: newTodoData.status || 'active',
        user_id: 'temp',
      }

      queryClient.setQueryData<Todo[]>(['todos'], (old) => [
        optimisticTodo,
        ...(old || []),
      ])

      return { previousTodos, tempId }
    },

    onError: (err, newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
      }
      showError(err instanceof Error ? err.message : t('Error creating task'))
    },

    onSuccess: (result, variables, context) => {
      if (result.data && context?.tempId) {
        const todoData = result.data

        queryClient.setQueryData<Todo[]>(['todos'], (old) => {
          if (!old) return [todoData]

          if (!todoData.id) {
            console.error(t('Unexpected Api Response Format'), todoData)
            return old.filter((todo) => todo.id !== context.tempId)
          }

          return old.map((todo) =>
            todo.id === context.tempId ? todoData : todo,
          )
        })
      } else if (!result.data) {
        console.error(t('Missing Data In Api Response'), result)
        queryClient.invalidateQueries({ queryKey: ['todos'] })
        queryClient.refetchQueries({ queryKey: ['todos'] })
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      queryClient.refetchQueries({ queryKey: ['todos'] })
    },
  })
}

export function useUpdateTodoMutation() {
  const t = useTranslations('useTodosQuery')
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateTodo'],
    mutationFn: ({ id, data }: { id: string; data: Partial<Todo> }) => {
      console.log('🔄 Mutation Function - Sending request:', { id, data })
      return todoAPI.updateTodo(id, data)
    },

    onMutate: async ({ id, data }) => {
      console.log('🔄 onMutate - Starting optimistic update:', { id, data })

      // Cancela a query de todos durante a atualização
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      // Snapshot do estado anterior
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])
      console.log('📸 onMutate - Previous todos snapshot:', previousTodos)

      // Atualização otimista com tipagem correta
      if (previousTodos) {
        const updatedTodos = previousTodos.map((todo) => {
          if (todo.id === id) {
            const updatedTodo = { ...todo, ...data }
            updatedTodo.updated_at = new Date().toISOString()

            // Garante consistência entre is_completed e status
            if ('is_completed' in data) {
              if (data.is_completed) {
                updatedTodo.status = 'completed'
              } else if (updatedTodo.status === 'completed') {
                updatedTodo.status = 'active'
              }
            }

            console.log('🔄 onMutate - Updated todo:', updatedTodo)
            return updatedTodo
          }
          return todo
        })

        console.log('💾 onMutate - Setting new cache state')
        queryClient.setQueryData(['todos'], updatedTodos)
      }

      return { previousTodos }
    },

    onError: (err, variables, context) => {
      console.error('❌ onError - Rolling back optimistic update:', err)
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
      }
      showError(err instanceof Error ? err.message : t('Error updating task'))
    },

    onSuccess: (result, variables) => {
      console.log('✅ onSuccess - Server response:', result)

      if (result?.data) {
        // Atualiza o cache com os dados do servidor
        queryClient.setQueryData<Todo[]>(['todos'], (old = []) => {
          const updatedTodos = old.map((todo) => {
            if (todo.id === variables.id && result.data) {
              return {
                ...result.data,
                status: result.data.status || 'active',
              }
            }
            return todo
          })
          return updatedTodos
        })

        // Notifica sucesso baseado no tipo de atualização
        if ('is_completed' in variables.data) {
          const isCompleted = variables.data.is_completed
          showSuccess(
            isCompleted ? t('taskMarkedAsCompleted') : t('taskMarkedAsActive'),
          )
        } else if ('status' in variables.data) {
          const status = variables.data.status
          if (status === 'review') {
            showSuccess(t('taskMovedToReview'))
          } else if (status === 'active') {
            showSuccess(t('taskApprovedAndActive'))
          }
        } else {
          showSuccess(t('taskUpdatedSuccessfully'))
        }
      }
    },

    onSettled: () => {
      console.log('🔄 onSettled - Mutation completed')
      // Agenda um refetch após um pequeno delay para garantir que o servidor processou a atualização
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['todos'] })
      }, 300)
    },
  })
}

export function useDeleteTodoMutation() {
  const t = useTranslations('useTodosQuery')
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteTodo'],
    mutationFn: async (id: string) => {
      console.log('🔄 Delete Mutation - Sending request:', id)
      const result = await todoAPI.deleteTodo(id)
      return result
    },

    onMutate: async (id) => {
      console.log('🔄 Delete Mutation - Starting optimistic update:', id)

      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])

      // Optimistically update to the new value
      queryClient.setQueryData<Todo[]>(['todos'], (old) => {
        if (!old) return []
        return old.filter((todo) => todo.id !== id)
      })

      return { previousTodos }
    },

    onError: (err, id, context) => {
      console.error('❌ Delete Mutation - Error:', err)

      if (context?.previousTodos) {
        console.log('🔄 Delete Mutation - Reverting to previous state')
        queryClient.setQueryData(['todos'], context.previousTodos)
      }

      showError(err instanceof Error ? err.message : t('Error Deleting Task'))
    },

    onSuccess: (result, id) => {
      console.log('✅ Delete Mutation - Success:', { result, id })

      // Força a atualização do cache após sucesso
      queryClient.setQueryData<Todo[]>(['todos'], (old) => {
        if (!old) return []
        return old.filter((todo) => todo.id !== id)
      })

      // Desativa temporariamente o refetch automático
      queryClient.setDefaultOptions({
        queries: {
          staleTime: 10000, // 10 segundos
        },
      })

      showSuccess(t('taskDeletedSuccessfully'))
    },

    onSettled: () => {
      console.log('🔄 Delete Mutation - Settled')
    },
  })
}
