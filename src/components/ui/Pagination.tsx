'use client'

import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const goToPreviousPage = () => onPageChange(currentPage - 1);
  const goToNextPage = () => onPageChange(currentPage + 1);

  return (
    <div className="mt-8 flex bg-white dark:bg-BlackLight p-2 mx-auto rounded-lg items-center justify-center gap-2">
      <button
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        className={`rounded-md flex items-center gap-2 p-2 ${
          currentPage === 1
            ? 'cursor-not-allowed text-gray-600/50 dark:text-gray-400/50'
            : 'hover:bg-gray-300 group hover:text-primary dark:hover:bg-bgDark/80'
        }`}
        aria-label="Previous page"
      >
        <FaChevronLeft className="h-4 w-4 group-hover:text-primary text-gray-600 dark:text-gray-400" /> Prev
      </button>
      
      {/* Pagination numbers */}
      <div className="flex gap-2 items-center">
        {totalPages <= 7 ? (
          // If we have 7 or fewer pages, show all of them
          [...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`h-9 w-9 rounded-md ${
                currentPage === i + 1
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))
        ) : (
          // If we have more than 7 pages, show a subset with ellipsis
          <>
            {/* Always show first page */}
            <button
              onClick={() => onPageChange(1)}
              className={`h-9 w-9 rounded-md ${
                currentPage === 1
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              1
            </button>
            
            {/* Show ellipsis if not on pages 1-3 */}
            {currentPage > 3 && <span className="px-2 text-gray-500 dark:text-gray-400">...</span>}
            
            {/* Show pages around current page */}
            {Array.from({ length: 3 }, (_, i) => {
              // Calculate which pages to show around current page
              const pageNum = currentPage > 3 
                ? (currentPage + i - 1 > totalPages - 3 
                  ? totalPages - 4 + i 
                  : currentPage + i - 1) 
                : i + 2;
                
              // Only show if the page is between 2 and totalPages-1
              if (pageNum > 1 && pageNum < totalPages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`h-9 w-9 rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            
            {/* Show ellipsis if not on last 3 pages */}
            {currentPage < totalPages - 2 && (
              <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
            )}
            
            {/* Always show last page */}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`h-9 w-9 rounded-md ${
                currentPage === totalPages
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      
      <button
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        className={`rounded-md flex items-center gap-2 p-2 ${
          currentPage === totalPages
            ? 'cursor-not-allowed text-gray-600/50 dark:text-gray-400/50'
            : 'hover:bg-gray-300 hover:text-primary group dark:hover:bg-bgDark/80'
        }`}
        aria-label="Next page"
      >
        Next <FaChevronRight className="h-4 w-4 group-hover:text-primary text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
};

export default Pagination;