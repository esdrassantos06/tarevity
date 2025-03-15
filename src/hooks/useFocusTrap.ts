import { useRef, useEffect } from 'react'

/**
 * A hook that traps focus within a specified element when active.
 * This is particularly useful for modals, dialogs, and other overlay elements.
 * 
 * @param isActive Whether the focus trap should be active
 * @returns A ref to be attached to the container element
 */

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isActive: boolean = true
) {
  const containerRef = useRef<T | null>(null)
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return
    
    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    // Focus the first element when the trap is activated
    firstElement.focus()
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      // Shift + Tab => backwards navigation
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      }
      // Tab => forwards navigation
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    // Save the previously focused element
    const previousFocus = document.activeElement as HTMLElement
    
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus when the trap is deactivated
      if (previousFocus) {
        previousFocus.focus()
      }
    }
  }, [isActive])
  
  return containerRef
}