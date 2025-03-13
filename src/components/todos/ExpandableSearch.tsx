'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

interface ExpandableSearchProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ExpandableSearch: React.FC<ExpandableSearchProps> = ({ value, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const toggleSearch = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div 
        className={`
          flex items-center rounded-md border-2 border-BorderLight dark:border-BorderDark
          bg-white dark:bg-BlackLight overflow-hidden
          transition-all duration-300 ease-in-out
          ${isMobile ? 'w-40' : isExpanded ? 'w-60' : 'w-10'}
        `}
      >
        <button
          onClick={toggleSearch}
          className="flex items-center justify-center h-10 w-10 flex-shrink-0 cursor-pointer"
          aria-label={isExpanded ? "Collapse search" : "Expand search"}
          type="button"
        >
          <FaSearch className="text-gray-400  transition-transform duration-300" />
        </button>
        
        <div className="flex-grow transition-all duration-300 ease-in-out">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent outline-none dark:text-white"
            value={value}
            onChange={onChange}
            tabIndex={isExpanded || isMobile ? 0 : -1}
            autoFocus={isExpanded || isMobile}
          />
        </div>
        
        {!isMobile && (
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
        )}
      </div>
    </div>
  );
};

export default ExpandableSearch;