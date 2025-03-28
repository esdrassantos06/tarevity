'use client'

import React from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useTranslations } from 'next-intl'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (pageNumber: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const t = useTranslations('pagination')

  if (totalPages <= 1) return null

  const goToPreviousPage = () => onPageChange(currentPage - 1)
  const goToNextPage = () => onPageChange(currentPage + 1)

  return (
    <div className="dark:bg-BlackLight mx-auto mt-8 flex items-center justify-center gap-2 rounded-lg bg-white p-2">
      <button
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        className={`flex items-center gap-2 rounded-md p-2 ${
          currentPage === 1
            ? 'cursor-not-allowed text-gray-600/50 dark:text-gray-400/50'
            : 'group hover:text-primary dark:hover:bg-bgDark/80 hover:bg-gray-300'
        }`}
        aria-label={t('previousPage')}
      >
        <FaChevronLeft className="group-hover:text-primary size-4 text-gray-600 dark:text-gray-400" />{' '}
        {t('previous')}
      </button>

      {/* Pagination numbers */}
      <div className="flex items-center gap-2">
        {totalPages <= 7 ? (
          [...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`size-9 rounded-md ${
                currentPage === i + 1
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              aria-label={t('goToPage', { page: i + 1 })}
              aria-current={currentPage === i + 1 ? 'page' : undefined}
            >
              {i + 1}
            </button>
          ))
        ) : (
          <>
            {/* Always show first page */}
            <button
              onClick={() => onPageChange(1)}
              className={`size-9 rounded-md ${
                currentPage === 1
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              aria-label={t('goToPage', { page: 1 })}
              aria-current={currentPage === 1 ? 'page' : undefined}
            >
              1
            </button>

            {/* Show ellipsis if not on pages 1-3 */}
            {currentPage > 3 && (
              <span
                className="px-2 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
              >
                ...
              </span>
            )}

            {/* Show pages around current page */}
            {Array.from({ length: 3 }, (_, i) => {
              const pageNum =
                currentPage > 3
                  ? currentPage + i - 1 > totalPages - 3
                    ? totalPages - 4 + i
                    : currentPage + i - 1
                  : i + 2

              if (pageNum > 1 && pageNum < totalPages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`size-9 rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    aria-label={t('goToPage', { page: pageNum })}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                )
              }
              return null
            })}

            {/* Show ellipsis if not on last 3 pages */}
            {currentPage < totalPages - 2 && (
              <span
                className="px-2 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
              >
                ...
              </span>
            )}

            {/* Always show last page */}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`size-9 rounded-md ${
                currentPage === totalPages
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              aria-label={t('goToPage', { page: totalPages })}
              aria-current={currentPage === totalPages ? 'page' : undefined}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-2 rounded-md p-2 ${
          currentPage === totalPages
            ? 'cursor-not-allowed text-gray-600/50 dark:text-gray-400/50'
            : 'hover:text-primary group dark:hover:bg-bgDark/80 hover:bg-gray-300'
        }`}
        aria-label={t('nextPage')}
      >
        {t('next')}{' '}
        <FaChevronRight className="group-hover:text-primary size-4 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  )
}

export default Pagination
