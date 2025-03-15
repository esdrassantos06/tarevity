import React, { memo } from 'react'

interface TodoStatsProps {
  stats: {
    total: number
    active: number
    completed: number
    review: number
    toDo: number
  }
  pieSegments: {
    circumference: number
    active: { dasharray: number; dashoffset: number }
    completed: { dasharray: number; dashoffset: number }
    review: { dasharray: number; dashoffset: number }
  }
}

const TodoStats = memo(function TodoStats({ stats, pieSegments }: TodoStatsProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-lg p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold" id="stats-heading">
            {stats.total} Tasks
          </h2>
        </div>

        <div className="mb-4 flex h-30 gap-10" aria-labelledby="stats-heading" role="figure">
          <div className="relative h-16">
            <svg 
              viewBox="0 0 100 100" 
              className="h-25 w-25"
              aria-hidden="true"
              role="presentation"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="15"
              />
              {/* Active tasks - Blue */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="15"
                strokeDasharray={`${pieSegments.active.dasharray} ${pieSegments.circumference}`}
                strokeDashoffset={pieSegments.active.dashoffset}
                transform="rotate(-90 50 50)"
              />
              {/* Completed tasks - Green */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="15"
                strokeDasharray={`${pieSegments.completed.dasharray} ${pieSegments.circumference}`}
                strokeDashoffset={pieSegments.completed.dashoffset}
                transform="rotate(-90 50 50)"
              />
              {/* Review tasks - Amber */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="15"
                strokeDasharray={`${pieSegments.review.dasharray} ${pieSegments.circumference}`}
                strokeDashoffset={pieSegments.review.dashoffset}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
          <div className="flex items-center">
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-blue-600" aria-hidden="true"></div>
                <span className="text-sm">Active</span>
                <span className="ml-2 text-sm font-medium">{stats.active}</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-green-500" aria-hidden="true"></div>
                <span className="text-sm">Completed</span>
                <span className="ml-2 text-sm font-medium">
                  {stats.completed}
                </span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-amber-500" aria-hidden="true"></div>
                <span className="text-sm">Review</span>
                <span className="ml-2 text-sm font-medium">{stats.review}</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-gray-400" aria-hidden="true"></div>
                <span className="text-sm">Total</span>
                <span className="ml-2 text-sm font-medium">{stats.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.stats.total === nextProps.stats.total &&
    prevProps.stats.active === nextProps.stats.active &&
    prevProps.stats.completed === nextProps.stats.completed &&
    prevProps.stats.review === nextProps.stats.review &&
    prevProps.pieSegments.active.dasharray === nextProps.pieSegments.active.dasharray &&
    prevProps.pieSegments.completed.dasharray === nextProps.pieSegments.completed.dasharray &&
    prevProps.pieSegments.review.dasharray === nextProps.pieSegments.review.dasharray
  )
})

export default TodoStats