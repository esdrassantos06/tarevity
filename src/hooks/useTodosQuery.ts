import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { todoAPI, Todo, TodoFormData } from '@/lib/api'
import { showSuccess, showError } from '@/lib/toast'
import { useTranslations } from 'next-intl'
import { createQueryConfig } from '@/lib/cache'

export function useTodosQuery() {
  const t = useTranslations('useTodosQuery')
  const config = createQueryConfig('todos')

  return useQuery<Todo[], Error>({
    queryKey: ['todos'],
    queryFn: async () => {
      try {
        const result = await todoAPI.getAllTodos()
        if (result.error) throw new Error(result.error.message)
        return result.data || []
      } catch (error) {
        showError(
          error instanceof Error ? error.message : t('Failed to load tasks'),
        )
        throw error
      }
    },
    staleTime: config.staleTime,
    gcTime: config.gcTime,
    refetchInterval: config.refetchInterval,
    refetchOnMount: config.refetchOnMount,
    refetchOnReconnect: config.refetchOnReconnect,
    refetchOnWindowFocus: config.refetchOnWindowFocus,
    retry: config.retry,
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
      return todoAPI.updateTodo(id, data)
    },

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])

      if (previousTodos) {
        const updatedTodos = previousTodos.map((todo) => {
          if (todo.id === id) {
            const updatedTodo = { ...todo, ...data }
            updatedTodo.updated_at = new Date().toISOString()

            if (
              'is_completed' in data &&
              typeof data.is_completed === 'boolean'
            ) {
              updatedTodo.is_completed = data.is_completed
              updatedTodo.status = data.is_completed ? 'completed' : 'active'
            }

            return updatedTodo
          }
          return todo
        })

        queryClient.setQueryData(['todos'], updatedTodos)
      }

      return { previousTodos }
    },

    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
      }
      showError(err instanceof Error ? err.message : t('Error updating task'))
    },

    onSuccess: (result, variables) => {
      if (result?.data) {
        queryClient.setQueryData<Todo[]>(['todos'], (old = []) => {
          return old.map((todo) => {
            if (todo.id === variables.id && result.data) {
              const updatedTodo = {
                ...todo,
                ...result.data,
                status: result.data.status || todo.status,
              }

              if (
                'is_completed' in result.data &&
                typeof result.data.is_completed === 'boolean'
              ) {
                updatedTodo.is_completed = result.data.is_completed
              }

              return updatedTodo
            }
            return todo
          })
        })

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
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['todos'] })
      }, 1000)
    },
  })
}

export function useDeleteTodoMutation() {
  const t = useTranslations('useTodosQuery')
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteTodo'],
    mutationFn: async (id: string) => {
      const result = await todoAPI.deleteTodo(id)
      return result
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])

      queryClient.setQueryData<Todo[]>(['todos'], (old) => {
        if (!old) return []
        return old.filter((todo) => todo.id !== id)
      })

      return { previousTodos }
    },

    onError: (err, id, context) => {
      console.error('❌ Delete Mutation - Error:', err)

      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
      }

      showError(err instanceof Error ? err.message : t('Error Deleting Task'))
    },

    onSuccess: (result, id) => {
      queryClient.setQueryData<Todo[]>(['todos'], (old) => {
        if (!old) return []
        return old.filter((todo) => todo.id !== id)
      })

      queryClient.setDefaultOptions({
        queries: {
          staleTime: 10000,
        },
      })

      showSuccess(t('taskDeletedSuccessfully'))
    },

    onSettled: () => {},
  })
}
