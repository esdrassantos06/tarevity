'use client'
import React, { useState, useRef, useEffect } from 'react'
import { FaSearch } from 'react-icons/fa'
import { FaXmark } from 'react-icons/fa6'

interface ExpandableSearchProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const ExpandableSearch: React.FC<ExpandableSearchProps> = ({
  value,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [value])

  const toggleSearch = () => {
    setIsExpanded(!isExpanded)
  }

  const clearSearch = () => {
    const emptyEvent = {
      target: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>


    onChange(emptyEvent)
    setIsExpanded(false)
  }

  return (
    <div className="relative" ref={searchRef}>
      <div
        className={`border-BorderLight dark:border-BorderDark dark:bg-BlackLight grid grid-cols-[40px_1fr_auto] items-center overflow-hidden rounded-md border-2 bg-white transition-all duration-300 ease-in-out ${isMobile ? 'w-40' : isExpanded ? 'w-60' : 'w-10'} `}
      >
        <div className="relative grid h-9 w-9 place-items-center">
          <button
            onClick={toggleSearch}
            aria-label={isExpanded ? 'Close search' : 'Expand search'}
            type="button"
          >
            <FaSearch className="text-gray-400" />
          </button>
        </div>

        <div className="overflow-hidden transition-all duration-300">
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-full bg-transparent py-2 outline-none dark:text-white"
            value={value}
            onChange={onChange}
            tabIndex={isExpanded || isMobile ? 0 : -1}
            autoFocus={isExpanded || isMobile}
          />
        </div>

        {!isMobile && (
          <div
            className={`transition-all duration-300 ${isExpanded ? 'w-8 opacity-100' : 'w-0 opacity-0'} `}
          >
            <button
              onClick={clearSearch}
              className="flex h-10 w-8 items-center justify-center text-gray-400 hover:text-gray-600"
              aria-label="Close search"
              type="button"
              tabIndex={isExpanded ? 0 : -1}
            >
              <FaXmark className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExpandableSearch
