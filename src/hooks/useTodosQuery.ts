import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { todoAPI, Todo, TodoFormData } from '@/lib/api'

export function useTodosQuery() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const result = await todoAPI.getAllTodos()
      if (result.error) throw new Error(result.error.message)
      
      // Log the data to see what's being returned
      console.log('Fetched todos data:', result.data)
      
      return result.data || []
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  })
}

export function useCreateTodoMutation() {
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
        status: newTodoData.status || 'active'
      }
      
      queryClient.setQueryData<Todo[]>(['todos'], old => [optimisticTodo, ...(old || [])])
      
      return { previousTodos, tempId }
    },
    
    onError: (err, newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
      }
    },
    
    onSuccess: (result, variables, context) => {
      if (result.data && context?.tempId) {
        queryClient.setQueryData<Todo[]>(['todos'], old => 
          old?.map(todo => 
            todo.id === context.tempId ? result.data! : todo
          )
        )
      }
    },
    
    onSettled: () => {
      // Don't automatically refetch as it may override our optimistic update
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['todos'] })
      }, 300) // Small delay to avoid race conditions
    },
  })
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Todo> }) => {
      console.log('Updating todo with data:', data)
      return todoAPI.updateTodo(id, data)
    },
    
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      
      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])
      
      // Log what we're trying to update
      console.log(`Optimistically updating todo ${id} with:`, data)
      
      // Optimistically update to the new value
      queryClient.setQueryData<Todo[]>(['todos'], old => {
        if (!old) return []
        
        return old.map(todo => {
          if (todo.id === id) {
            const updatedTodo = { ...todo, ...data }
            console.log('Updated todo in cache:', updatedTodo)
            return updatedTodo
          }
          return todo
        })
      })
      
      return { previousTodos }
    },
    
    onError: (err, variables, context) => {
      console.error('Error updating todo:', err)
      
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
      }
    },
    
    onSuccess: (result, variables) => {
      console.log('Update successful, server returned:', result.data)
      
      if (result.data) {
        // Ensure the server response is applied to the cache
        queryClient.setQueryData<Todo[]>(['todos'], (old = []) => {
          return old.map(todo => {
            if (todo.id === variables.id) {
              return { ...todo, ...result.data }
            }
            return todo
          })
        })
      }
    },
    
    onSettled: () => {
      // Delay the refetch to avoid race conditions
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['todos'] })
      }, 300)
    },
  })
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => todoAPI.deleteTodo(id),
    
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
      // Delay the refetch to avoid race conditions
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['todos'] })
      }, 300)
    },
  })
}