'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

// Define props interface for the component
interface ExpandableSearchProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ExpandableSearch: React.FC<ExpandableSearchProps> = ({ value, onChange }) => {
  // Track whether the search input is expanded
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Create a ref for the search container element
  // Using proper typing for the ref
  const searchRef = useRef<HTMLDivElement | null>(null);
  
  // Handle clicks outside to collapse the search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [value]);
  
  // Toggle function for the search expansion
  const toggleSearch = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Animated container that transitions between collapsed and expanded states */}
      <div 
        className={`
          flex items-center rounded-md border border-gray-300 dark:border-gray-600 
          bg-white dark:bg-gray-700 overflow-hidden
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-60' : 'w-10'}
        `}
      >
        {/* Search icon - always visible */}
        <button
          onClick={toggleSearch}
          className="flex items-center justify-center h-10 w-10 flex-shrink-0 cursor-pointer"
          aria-label={isExpanded ? "Collapse search" : "Expand search"}
          type="button"
        >
          <FaSearch className={`
            text-gray-400 transition-transform duration-300
            ${isExpanded ? 'scale-90' : 'scale-100'}
          `} />
        </button>
        
        {/* Input field - animated to fade in/out */}
        <div className={`
          flex-grow transition-all duration-300 ease-in-out
          ${isExpanded ? 'opacity-100 w-full' : 'opacity-0 w-0'}
        `}>
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent outline-none dark:text-white"
            value={value}
            onChange={onChange}
            tabIndex={isExpanded ? 0 : -1}
            autoFocus={isExpanded}
          />
        </div>
        
        {/* Close button - only visible when expanded */}
        <button 
          onClick={toggleSearch}
          className={`
            px-2 text-gray-400 hover:text-gray-600 transition-all duration-300
            ${isExpanded ? 'opacity-100 w-8' : 'opacity-0 w-0 pointer-events-none'}
          `}
          aria-label="Collapse search"
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ExpandableSearch;