'use client'

import React, { useState, ReactNode } from 'react'
import { UseFormRegisterReturn } from 'react-hook-form'
import {
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
  FaInfoCircle,
  FaCheck,
} from 'react-icons/fa'

interface ValidatedInputProps {
  id: string
  type: string
  label: string
  registration: UseFormRegisterReturn
  error?: string | null
  placeholder?: string
  disabled?: boolean
  helperText?: string
  required?: boolean
  validator?: ReactNode
  className?: string
  maxLength?: number
  autoComplete?: string
  icon?: ReactNode
}

export default function ValidatedInput({
  id,
  type,
  label,
  registration,
  error,
  placeholder,
  disabled = false,
  helperText,
  required = false,
  validator,
  className = '',
  maxLength,
  autoComplete,
  icon,
}: ValidatedInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isTouched, setIsTouched] = useState(false)
  const [inputValue, setInputValue] = useState('')

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true)
  }

  // Fix TypeScript errors by properly handling event registration
  // First, destructure only the ref from registration to avoid conflicts
  const { ref, ...restRegistration } = registration

  // Handle our own events, but make sure to call the original handlers too
  const handleBlur = () => {
    setIsFocused(false)
    setIsTouched(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Determine input type (for password visibility)
  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between">
        <label
          htmlFor={id}
          className={`block text-sm font-medium ${
            error
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        {maxLength && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {inputValue.length}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative mt-1">
        <input
          id={id}
          type={inputType}
          className={`block w-full rounded-md p-2 shadow-sm transition-all duration-200 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500'
              : isFocused
                ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
          } ${
            disabled
              ? 'cursor-not-allowed bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              : 'dark:bg-gray-700 dark:text-white'
          } ${icon ? 'pl-10' : ''} ${type === 'password' ? 'pr-10' : ''} `}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          ref={ref}
          // These handlers run BEFORE the react-hook-form handlers
          onFocus={handleFocus}
          onBlur={(e) => {
            handleBlur()
            if (restRegistration.onBlur) restRegistration.onBlur(e)
          }}
          onChange={(e) => {
            handleChange(e)
            if (restRegistration.onChange) restRegistration.onChange(e)
          }}
          // Spread the remaining registration props
          name={restRegistration.name}
        />

        {/* Left icon if provided */}
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {icon}
          </div>
        )}

        {/* Password toggle icon */}
        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}

        {/* Valid input indicator */}
        {!error && isTouched && inputValue && type !== 'password' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
            <FaCheck />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div
          id={`${id}-error`}
          className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400"
        >
          <FaExclamationCircle className="mr-1 h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper text */}
      {!error && helperText && (
        <div
          id={`${id}-helper`}
          className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400"
        >
          <FaInfoCircle className="mr-1 h-3 w-3 flex-shrink-0" />
          <span>{helperText}</span>
        </div>
      )}

      {/* Validator component (e.g., password strength meter) */}
      {validator}
    </div>
  )
}
