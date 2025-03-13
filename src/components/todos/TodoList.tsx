import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FaEdit, FaTrash, FaClock, FaFlag, FaPlus, FaEllipsisH, FaSearch } from 'react-icons/fa';
import { useTodosQuery, useUpdateTodoMutation } from '@/hooks/useTodosQuery';

// Define interfaces for our data
interface Todo {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  priority: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

// Simple date formatter function
const formatDate = (dateString: string | null) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const TodoList: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // React Query hooks
  const { data: todos = [] as Todo[], isLoading } = useTodosQuery();
  const updateTodoMutation = useUpdateTodoMutation();

  // Filter todos based on selected filter and search query
  const filteredTodos = useMemo(() => {
    let result = [...todos];

    // Filter by status tab
    if (activeTab === 'active') {
      result = result.filter(todo => !todo.is_completed);
    } else if (activeTab === 'completed') {
      result = result.filter(todo => todo.is_completed);
    } else if (activeTab === 'review') {
      // For example, let's consider "review" as medium priority tasks
      result = result.filter(todo => todo.priority === 2);
    } else if (activeTab === 'todo') {
      // Let's consider "todo" as high priority tasks
      result = result.filter(todo => todo.priority === 3);
    }

    // Filter by search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        todo => 
          todo.title.toLowerCase().includes(lowerCaseQuery) ||
          (todo.description && todo.description.toLowerCase().includes(lowerCaseQuery))
      );
    }

    // Sort by priority and completion status
    return result.sort((a, b) => {
      // First sort by completion status
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }
      // Then by priority (higher priority first)
      return b.priority - a.priority;
    });
  }, [todos, activeTab, searchQuery]);

  // Handle todo item click to navigate to detail page
  const handleTodoClick = (id: string) => {
    router.push(`/todo/${id}`);
  };

  // Toggle completion status
  const handleToggleComplete = (e: React.SyntheticEvent, id: string, isCompleted: boolean) => {
    e.stopPropagation(); // Prevent navigation
    const todoToUpdate = todos.find(todo => todo.id === id);
    if (!todoToUpdate) return;
  
    updateTodoMutation.mutate({ 
      id, 
      data: { ...todoToUpdate, is_completed: !isCompleted } 
    });
  };
  // Get priority color and label
  interface PriorityInfo {
    color: string;
    label: string;
  }

  const getPriorityInfo = (priority: number): PriorityInfo => {
    switch (priority) {
      case 3:
        return { color: 'bg-red-500', label: 'High' };
      case 2:
        return { color: 'bg-yellow-500', label: 'Medium' };
      case 1:
      default:
        return { color: 'bg-green-500', label: 'Low' };
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = todos.length;
    const active = todos.filter(todo => !todo.is_completed).length;
    const completed = todos.filter(todo => todo.is_completed).length;
    const review = todos.filter(todo => todo.priority === 2).length;
    const toDo = todos.filter(todo => todo.priority === 3).length;
    
    return { total, active, completed, review, toDo };
  }, [todos]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Projects</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Stats section */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{stats.total} Projects</h2>
              <button className="bg-blue-600 text-white rounded-full p-2">
                <FaPlus />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="w-full h-16 relative">
                <svg viewBox="0 0 100 100" className="w-16 h-16">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="15" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#4f46e5" 
                    strokeWidth="15" 
                    strokeDasharray={`${stats.total ? (stats.active/stats.total) * 251.2 : 0} 251.2`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#8b5cf6" 
                    strokeWidth="15" 
                    strokeDasharray={`${stats.total ? (stats.completed/stats.total) * 251.2 : 0} 251.2`}
                    strokeDashoffset={`${stats.total ? -1 * (stats.active/stats.total) * 251.2 : 0}`}
                    transform="rotate(-90 50 50)"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="15" 
                    strokeDasharray={`${stats.total ? (stats.review/stats.total) * 251.2 : 0} 251.2`}
                    strokeDashoffset={`${stats.total ? -1 * ((stats.active + stats.completed)/stats.total) * 251.2 : 0}`}
                    transform="rotate(-90 50 50)"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="15" 
                    strokeDasharray={`${stats.total ? (stats.toDo/stats.total) * 251.2 : 0} 251.2`}
                    strokeDashoffset={`${stats.total ? -1 * ((stats.active + stats.completed + stats.review)/stats.total) * 251.2 : 0}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute right-0 top-0">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
                      <span className="text-sm">Active</span>
                      <span className="ml-2 text-sm font-medium">{stats.active}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div>
                      <span className="text-sm">Completed</span>
                      <span className="ml-2 text-sm font-medium">{stats.completed}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-sm">Review</span>
                      <span className="ml-2 text-sm font-medium">{stats.review}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">To Do</span>
                      <span className="ml-2 text-sm font-medium">{stats.toDo}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Teams section */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">7 Teams</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="w-8 h-8 rounded-md bg-green-500 flex items-center justify-center text-white">
                <span>G</span>
              </div>
              <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center text-white">
                <span>B</span>
              </div>
              <div className="w-8 h-8 rounded-md bg-orange-500 flex items-center justify-center text-white">
                <span>O</span>
              </div>
              <div className="w-8 h-8 rounded-md bg-pink-500 flex items-center justify-center text-white">
                <span>P</span>
              </div>
              <div className="w-8 h-8 rounded-md bg-gray-700 flex items-center justify-center text-white">
                <span>G</span>
              </div>
              <div className="w-8 h-8 rounded-md bg-violet-600 flex items-center justify-center text-white">
                <span>V</span>
              </div>
              <div className="w-8 h-8 rounded-md bg-red-500 flex items-center justify-center text-white">
                <span>R</span>
              </div>
              <div className="w-8 h-8 rounded-md border border-dashed border-gray-400 flex items-center justify-center text-gray-400">
                <span>+</span>
              </div>
            </div>
          </div>
          
          {/* Members section */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">23 Members</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <span>J</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white">
                <span>A</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                <span>S</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                <span>R</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-800">
                <span>GH</span>
              </div>
              <div className="bg-gray-200 rounded-full text-xs px-2 py-1 flex items-center justify-center">
                <span>+17</span>
              </div>
              <div className="w-8 h-8 rounded-full border border-dashed border-gray-400 flex items-center justify-center text-gray-400">
                <span>+</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filtering tabs */}
        <div className="flex mb-4 space-x-4 overflow-x-auto pb-2">
          <button 
            className={`flex items-center px-4 py-2 ${activeTab === 'todo' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'} rounded-md font-medium`}
            onClick={() => setActiveTab('todo')}
          >
            <span className="w-3 h-3 rounded-full bg-blue-600 mr-2"></span>
            To Do
          </button>
          <div className="text-gray-300 dark:text-gray-600">|</div>
          <button 
            className={`px-4 py-2 ${activeTab === 'all' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'} rounded-md font-medium`}
            onClick={() => setActiveTab('all')}
          >
            <span className="mr-1">•</span> Active
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'completed' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'} rounded-md font-medium`}
            onClick={() => setActiveTab('completed')}
          >
            <span className="mr-1">•</span> Completed
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'review' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300' : 'text-gray-700 dark:text-gray-300'} rounded-md font-medium`}
            onClick={() => setActiveTab('review')}
          >
            <span className="mr-1">•</span> Review
          </button>
          <div className="text-gray-300 dark:text-gray-600">|</div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Todo Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTodos.map((todo) => {
          const priority = getPriorityInfo(todo.priority);
          const dueDate = todo.due_date ? formatDate(todo.due_date) : null;
          
          return (
            <div
              key={todo.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTodoClick(todo.id)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full ${priority.color} mr-2 flex-shrink-0`}></div>
                    <h3 className={`font-medium text-lg ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      {todo.title}
                    </h3>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={todo.is_completed}
                      onChange={(e) => handleToggleComplete(e, todo.id, todo.is_completed)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>
                </div>
                
                {todo.description && (
                  <p className={`text-sm mb-3 ${todo.is_completed ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {todo.description.length > 100 
                      ? `${todo.description.substring(0, 100)}...` 
                      : todo.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <FaFlag className={`mr-1 ${priority.color === 'bg-red-500' ? 'text-red-500' : priority.color === 'bg-yellow-500' ? 'text-yellow-500' : 'text-green-500'}`} />
                    <span>Priority: {priority.label}</span>
                  </div>
                  
                  {dueDate && (
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      <span>{dueDate}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 p-2 flex justify-end space-x-2">
                <button 
                  className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    router.push(`/todo/${todo.id}/edit`);
                  }}
                >
                  <FaEdit />
                </button>
                <button 
                  className="p-1 text-red-500 hover:text-red-700 dark:text-red-400"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    // Add delete confirmation logic
                  }}
                >
                  <FaTrash />
                </button>
                <button 
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    // Add more options logic
                  }}
                >
                  <FaEllipsisH />
                </button>
              </div>
            </div>
          );
        })}
        
        {/* Add new todo button */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center h-48 cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          onClick={() => router.push('/todo/new')}
        >
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <FaPlus className="text-gray-400 dark:text-gray-500 text-xl" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Add New Task</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoList;