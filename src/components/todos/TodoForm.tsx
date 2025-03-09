'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const todoSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional().nullable(),
  priority: z.number().min(1).max(3),
  due_date: z.string().optional().nullable(),
  is_completed: z.boolean().default(false),
})

type TodoFormValues = z.infer<typeof todoSchema>

interface TodoFormProps {
  initialData?: {
    title: string
    description: string | null
    priority: number
    due_date: string | null
    is_completed: boolean
  }
  onSubmit: (data: TodoFormValues) => void
  onCancel: () => void
}

export default function TodoForm({
  initialData,
  onSubmit,
  onCancel,
}: TodoFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      priority: 1,
      due_date: '',
      is_completed: false,
    },
  })

  const handleFormSubmit = async (data: TodoFormValues) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Título*
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          disabled={isLoading}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Descrição
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          disabled={isLoading}
        ></textarea>
      </div>

      <div>
        <label
          htmlFor="priority"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Prioridade
        </label>
        <select
          id="priority"
          {...register('priority', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          disabled={isLoading}
        >
          <option value={1}>Baixa</option>
          <option value={2}>Média</option>
          <option value={3}>Alta</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="due_date"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Data de Vencimento
        </label>
        <input
          id="due_date"
          type="date"
          {...register('due_date')}
          className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          disabled={isLoading}
        />
      </div>

      {initialData && (
        <div className="flex items-center">
          <input
            id="is_completed"
            type="checkbox"
            {...register('is_completed')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
            disabled={isLoading}
          />
          <label
            htmlFor="is_completed"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Marcar como concluída
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  )
}
