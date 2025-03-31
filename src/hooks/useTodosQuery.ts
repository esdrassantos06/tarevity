import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { todoAPI, Todo, TodoFormData } from '@/lib/api'
import { showSuccess, showError } from '@/lib/toast'
import { useTranslations } from 'next-intl'

export function useTodosQuery() {
  const t = useTranslations('useTodosQuery')

  return useQuery({
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
    staleTime: 0,
    gcTime: 1 * 60 * 1000,
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
    mutationFn: ({ id, data }: { id: string; data: Partial<Todo> }) => {
      console.log('🔄 Mutation Function - Sending request:', { id, data })
      return todoAPI.updateTodo(id, data)
    },

    onMutate: async ({ id, data }) => {
      console.log('🔄 onMutate - Starting optimistic update:', { id, data })
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])

      queryClient.setQueryData<Todo[]>(['todos'], (old) => {
        if (!old) return []

        return old.map((todo) => {
          if (todo.id === id) {
            const updatedTodo = { ...todo, ...data }
            updatedTodo.updated_at = new Date().toISOString()

            if ('is_completed' in data && data.is_completed === true) {
              updatedTodo.status = 'completed' as const
            } else if (
              'is_completed' in data &&
              data.is_completed === false &&
              updatedTodo.status === 'completed'
            ) {
              updatedTodo.status = 'active' as const
            }

            console.log('🔄 onMutate - Updated todo:', updatedTodo)
            return updatedTodo
          }
          return todo
        })
      })

      return { previousTodos }
    },

    onError: (err, variables, context) => {
      console.error('❌ onError - Error updating todo:', err)

      if (context?.previousTodos) {
        console.log('🔄 onError - Reverting to previous state')
        queryClient.setQueryData(['todos'], context.previousTodos)
      }

      showError(err instanceof Error ? err.message : t('Error Updating Task'))
    },

    onSuccess: (result, variables) => {
      console.log('✅ onSuccess - Server response:', result)

      if (result.data) {
        const todoData = result.data
        console.log('✅ onSuccess - Updating cache with server data:', todoData)

        queryClient.setQueryData<Todo[]>(['todos'], (old = []) => {
          if (!old) return []

          const updatedTodos = old.map((todo) => {
            if (todo.id === variables.id) {
              if (!todoData.id) {
                console.error(
                  '❌ onSuccess - Invalid server response:',
                  todoData,
                )
                return todo
              }
              const updatedTodo = { ...todo, ...todoData }
              console.log('✅ onSuccess - Final todo state:', updatedTodo)
              return updatedTodo
            }
            return todo
          })

          return updatedTodos
        })

        queryClient.setQueryData(['todos'], (old) => old)

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
      } else {
        console.error('❌ onSuccess - Invalid response from server:', result)
        queryClient.invalidateQueries({ queryKey: ['todos'] })
      }
    },

    onSettled: () => {
      console.log('🔄 onSettled - Mutation completed')
    },
  })
}

export function useDeleteTodoMutation() {
  const t = useTranslations('useTodosQuery')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => todoAPI.deleteTodo(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])

      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.filter((todo) => todo.id !== id),
      )

      return { previousTodos }
    },

    onError: (err, id, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
      }

      showError(err instanceof Error ? err.message : t('Error Deleting Task'))
    },

    onSuccess: () => {
      showSuccess(t('taskDeletedSuccessfully'))

      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.refetchQueries({ queryKey: ['notifications'] })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      queryClient.refetchQueries({ queryKey: ['todos'] })
    },
  })
}
