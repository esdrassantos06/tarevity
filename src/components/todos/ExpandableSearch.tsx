'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

interface ExpandableSearchProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ExpandableSearch: React.FC<ExpandableSearchProps> = ({ value, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
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

  // Use grid for perfect icon centralization
  return (
    <div className="relative" ref={searchRef}>
      <div 
        className={`
          grid grid-cols-[40px_1fr_auto] items-center
          rounded-md border-2 border-BorderLight dark:border-BorderDark
          bg-white dark:bg-BlackLight overflow-hidden
          transition-all duration-300 ease-in-out
          ${isMobile ? 'w-40' : isExpanded ? 'w-60' : 'w-10'}
        `}
      >
        <div className="grid relative place-items-center h-9 w-9">
          <button
            onClick={toggleSearch}
            aria-label={isExpanded ? "Close search" : "Expand search"}
            type="button"
          >
            <FaSearch className="text-gray-400" />
          </button>
        </div>
        
        <div className="overflow-hidden transition-all duration-300">
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-10 bg-transparent outline-none py-2 dark:text-white"
            value={value}
            onChange={onChange}
            tabIndex={isExpanded || isMobile ? 0 : -1}
            autoFocus={isExpanded || isMobile}
          />
        </div>
        
        {!isMobile && (
          <div className={`
            transition-all duration-300
            ${isExpanded ? 'opacity-100 w-8' : 'opacity-0 w-0'}
          `}>
            <button 
              onClick={toggleSearch}
              className="h-10 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
              aria-label="Close search"
              type="button"
              tabIndex={isExpanded ? 0 : -1}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandableSearch;