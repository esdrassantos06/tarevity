'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaTimes, FaFlag, FaClock } from 'react-icons/fa';
import { useCreateTodoMutation } from '@/hooks/useTodosQuery';

// Define interface for our form data
interface TodoFormData {
  title: string;
  description: string;
  priority: number;
  due_date: string;
  is_completed: boolean;
}

// Define the Todo interface that matches your API
interface Todo {
  id: string;
  title: string;
  description: string | null; // Allow null for description
  priority: number;
  due_date: string | null;
  is_completed: boolean;
  // Include any other fields your Todo entity has
}

// Define interface for API response with generic type parameter
interface ApiResult<T = Todo> {
  data: T | null;
  error?: unknown; // Using unknown instead of any for type safety
}

const NewTodoPage: React.FC = () => {
  const router = useRouter();
  const createTodoMutation = useCreateTodoMutation();
  
  const [formData, setFormData] = useState<TodoFormData>({
    title: '',
    description: '',
    priority: 2, // Default to medium priority
    due_date: '',
    is_completed: false
  });
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Format the data for submission
    const todoData = {
      ...formData,
      priority: Number(formData.priority),
      due_date: formData.due_date || null
    };
    
    createTodoMutation.mutate(todoData, {
      onSuccess: (data: ApiResult<Todo>) => {
        if (data.data && data.data.id) {
          // Navigate to the new todo detail page
          router.push(`/todo/${data.data.id}`);
        } else {
          // Fallback to dashboard
          router.push('/dashboard');
        }
      }
    });
  };
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Dashboard</span>
        </button>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          Create New Task
        </div>
      </div>
      
      {/* Create Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Title field */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter task title"
            />
          </div>
          
          {/* Description field */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter task description (optional)"
            ></textarea>
          </div>
          
          {/* Priority and due date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaFlag className="inline mr-1 text-blue-500" /> 
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="1">Low Priority</option>
                <option value="2">Medium Priority</option>
                <option value="3">High Priority</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaClock className="inline mr-1 text-blue-500" /> 
                Due Date
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          {/* Status checkbox */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_completed"
                name="is_completed"
                checked={formData.is_completed}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_completed" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Mark as completed
              </label>
            </div>
          </div>
          
          {/* Form buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FaTimes className="inline mr-1" /> Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={createTodoMutation.isPending}
            >
              {createTodoMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <FaSave className="inline mr-1" /> Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTodoPage;