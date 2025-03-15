import { useMemo, useState, useEffect } from 'react';
import { Todo } from '@/lib/api';

export interface TodoFilters {
  activeTab: string;
  searchQuery: string;
  prioritySortDirection: 'asc' | 'desc';
}

export function useTodoFilters(todos: Todo[]) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [prioritySortDirection, setPrioritySortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const todosPerPage = 9; // Number of todos to show per page (3x3 grid)

  // Reset to first page when filter, search, or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, prioritySortDirection]);

  const togglePrioritySort = () => {
    setPrioritySortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const filteredTodos = useMemo(() => {
    let result = [...todos];

    if (activeTab === 'active') {
      result = result.filter(
        (todo) => !todo.is_completed && todo.status !== 'review',
      );
    } else if (activeTab === 'completed') {
      result = result.filter((todo) => todo.is_completed);
    } else if (activeTab === 'review') {
      result = result.filter((todo) => todo.status === 'review');
    } else if (activeTab === 'todo') {
      result = result.filter((todo) => todo.priority === 3);
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        (todo) =>
          todo.title.toLowerCase().includes(lowerCaseQuery) ||
          (todo.description &&
            todo.description.toLowerCase().includes(lowerCaseQuery)),
      );
    }

    // Sort by completion status first
    result.sort((a, b) => {
      // First sort by completion status
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }

      return prioritySortDirection === 'desc'
        ? b.priority - a.priority
        : a.priority - b.priority;
    });

    return result;
  }, [todos, activeTab, searchQuery, prioritySortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTodos.length / todosPerPage);
  
  // Make sure current page is valid
  const pageToShow = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  
  // Get current todos
  const currentTodos = useMemo(() => {
    const indexOfLastTodo = pageToShow * todosPerPage;
    const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
    return filteredTodos.slice(indexOfFirstTodo, indexOfLastTodo);
  }, [filteredTodos, pageToShow, todosPerPage]);

  // Change page
  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Scroll to top of the grid for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    prioritySortDirection,
    togglePrioritySort,
    currentPage,
    pageToShow,
    totalPages,
    filteredTodos,
    currentTodos,
    paginate,
  };
}