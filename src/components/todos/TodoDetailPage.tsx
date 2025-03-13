'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaPencilAlt, FaTrash, FaClock, FaFlag, FaCheck, FaShare, FaUser } from 'react-icons/fa';
import { useTodosQuery, useUpdateTodoMutation, useDeleteTodoMutation } from '@/hooks/useTodosQuery';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/common/Dialog';

interface TodoDetailPageProps {
  todoId: string;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const TodoDetailPage: React.FC<TodoDetailPageProps> = ({ todoId }) => {
  const router = useRouter();
  const { data: todos = [], isLoading, error } = useTodosQuery();
  const updateTodoMutation = useUpdateTodoMutation();
  const deleteTodoMutation = useDeleteTodoMutation();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Error loading task details: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  const todo = todos.find(t => t.id === todoId);
  
  if (!todo) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-700 dark:text-gray-300">Task not found</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3:
        return { color: 'bg-red-500', label: 'High', textColor: 'text-red-500' };
      case 2:
        return { color: 'bg-yellow-500', label: 'Medium', textColor: 'text-yellow-500' };
      case 1:
      default:
        return { color: 'bg-green-500', label: 'Low', textColor: 'text-green-500' };
    }
  };
  
  const priority = getPriorityColor(todo.priority);
  const dueDate = todo.due_date ? formatDate(todo.due_date) : 'No due date';
  const createdDate = formatDate(todo.created_at);
  
  const handleToggleComplete = () => {
    updateTodoMutation.mutate({
      id: todo.id,
      data: { ...todo, is_completed: !todo.is_completed }
    });
  };
  
  const handleDelete = () => {
    deleteTodoMutation.mutate(todo.id, {
      onSuccess: () => {
        router.push('/dashboard');
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex space-x-3">
          <button 
            className="bg-primary hover:bg-blue-900 text-white p-2 rounded-md"
            onClick={() => router.push(`/todo/${todo.id}/edit`)}
          >
            <FaPencilAlt />
          </button>
          <button 
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <FaTrash />
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Company header - resembling job detail layout */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-4">
              <div className={`${priority.color} h-12 w-12 rounded-md flex items-center justify-center text-white`}>
                <FaFlag />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                  {todo.title}
                </h1>
                <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <FaClock className="mr-1" /> 
                    Created: {createdDate}
                  </span>
                  <span className="flex items-center">
                    <FaFlag className={`mr-1 ${priority.textColor}`} /> 
                    {priority.label} Priority
                  </span>
                </div>
              </div>
            </div>
            <div>
              <button
                onClick={handleToggleComplete}
                className={`flex items-center px-3 py-1 rounded-md ${
                  todo.is_completed 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                <FaCheck className="mr-1" />
                {todo.is_completed ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Description section */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Description</h2>
          <div className="prose prose-blue dark:prose-invert">
            {todo.description ? (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{todo.description}</p>
            ) : (
              <p className="text-gray-500 italic">No description provided</p>
            )}
          </div>
        </div>
        
        {/* Details section */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Status</h3>
              <p className="text-gray-900 dark:text-white font-medium">
                {todo.is_completed ? 'Completed' : 'In Progress'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Due Date</h3>
              <p className="text-gray-900 dark:text-white font-medium">{dueDate}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Last Updated</h3>
              <p className="text-gray-900 dark:text-white font-medium">
                {formatDate(todo.updated_at)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Assigned To</h3>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                  <FaUser />
                </div>
                <p className="text-gray-900 dark:text-white font-medium">You</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions section */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800">
              <FaShare className="mr-2" />
              Share
            </button>
          </div>
        </div>
      </div>
      
      {/* Delete confirmation dialog using the Dialog component */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TodoDetailPage;