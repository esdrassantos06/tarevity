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

      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Todo> }) => 
      todoAPI.updateTodo(id, data),
    

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