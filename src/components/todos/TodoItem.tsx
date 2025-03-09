"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FaEdit, FaTrash, FaClock, FaFlag } from "react-icons/fa";

interface TodoItemProps {
  todo: {
    id: string;
    title: string;
    description: string | null;
    is_completed: boolean;
    priority: number;
    due_date: string | null;
  };
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
}: TodoItemProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleComplete = async () => {
    setIsLoading(true);
    try {
      await onToggleComplete(todo.id, !todo.is_completed);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3:
        return "text-red-500";
      case 2:
        return "text-yellow-500";
      case 1:
      default:
        return "text-green-500";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3:
        return "Alta";
      case 2:
        return "Média";
      case 1:
      default:
        return "Baixa";
    }
  };

  const formattedDueDate = todo.due_date
    ? format(new Date(todo.due_date), "d 'de' MMMM", { locale: ptBR })
    : null;

  return (
    <div
      className={`border border-borderLight dark:border-borderDark shadow-lg rounded-lg p-4 mb-4 transition-colors ${
        todo.is_completed
          ? "bg-gray-100 dark:bg-zinc-800"
          : "bg-cardLightMode dark:bg-cardDarkMode"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.is_completed}
          onChange={handleToggleComplete}
          disabled={isLoading}
          className="h-5 w-5 mt-1 rounded text-blue-600"
        />

        <div className="flex-grow">
          <div className="flex justify-between">
            <h3
              className={`font-medium text-lg ${
                todo.is_completed
                  ? "line-through text-gray-500 dark:text-gray-400"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {todo.title}
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(todo.id)}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400"
                aria-label="Editar tarefa"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                className="text-red-500 hover:text-red-700 dark:text-red-400"
                aria-label="Excluir tarefa"
              >
                <FaTrash />
              </button>
            </div>
          </div>

          {todo.description && (
            <p
              className={`mt-1 text-sm ${
                todo.is_completed
                  ? "text-gray-500 dark:text-gray-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {todo.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <div
              className={`flex items-center ${getPriorityColor(todo.priority)}`}
            >
              <FaFlag className="mr-1" />
              <span>Prioridade: {getPriorityLabel(todo.priority)}</span>
            </div>

            {formattedDueDate && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <FaClock className="mr-1" />
                <span>Prazo: {formattedDueDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
