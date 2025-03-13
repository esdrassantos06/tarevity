'use client';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaTimes, FaFlag, FaClock } from 'react-icons/fa';
import { useTodosQuery, useUpdateTodoMutation } from '@/hooks/useTodosQuery';

// Define interface for our Todo item
interface Todo {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  due_date: string | null;
  is_completed: boolean;
}

// Define form data interface
interface TodoFormData {
  title: string;
  description: string;
  priority: number;
  due_date: string;
  is_completed: boolean;
}

// Define props interface
interface TodoEditPageProps {
  todoId: string;
}

const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  // Convert date to yyyy-MM-dd format for date input
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const TodoEditPage: React.FC<TodoEditPageProps> = ({ todoId }) => {
  const router = useRouter();
  const { data: todos = [] as Todo[], isLoading } = useTodosQuery();
  const updateTodoMutation = useUpdateTodoMutation();
  
  const [formData, setFormData] = useState<TodoFormData>({
    title: '',
    description: '',
    priority: 1,
    due_date: '',
    is_completed: false
  });
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Find the todo when data is loaded
  useEffect(() => {
    if (todos.length > 0) {
      const todo = todos.find(t => t.id === todoId);
      if (todo) {
        setFormData({
          title: todo.title || '',
          description: todo.description || '',
          priority: todo.priority || 1,
          due_date: todo.due_date ? formatDateForInput(todo.due_date) : '',
          is_completed: todo.is_completed || false
        });
      } else {
        // Todo not found, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [todos, todoId, router]);
  
  // Check for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setHasUnsavedChanges(true);
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Format the data for submission
    const updateData = {
      ...formData,
      priority: Number(formData.priority),
      due_date: formData.due_date || null
    };
    
    updateTodoMutation.mutate(
      { id: todoId, data: updateData },
      {
        onSuccess: () => {
          setHasUnsavedChanges(false);
          router.push(`/todo/${todoId}`);
        }
      }
    );
  };
  
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push(`/todo/${todoId}`);
      }
    } else {
      router.push(`/todo/${todoId}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <button 
          onClick={handleCancel}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Details</span>
        </button>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          Edit Task
        </div>
      </div>
      
      {/* Edit Form */}
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
              placeholder="Task title"
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
              placeholder="Task description"
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
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FaTimes className="inline mr-1" /> Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={updateTodoMutation.isPending}
            >
              {updateTodoMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="inline mr-1" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoEditPage;