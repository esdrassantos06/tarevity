'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa'

interface EmailValidatorProps {
  email: string
  onValidation?: (isValid: boolean) => void
  className?: string
}

export default function EmailValidator({
  email,
  onValidation,
  className = '',
}: EmailValidatorProps) {
  const [isValid, setIsValid] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const patterns = useMemo(
    () => ({
      format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      noConsecutiveSpecials: /^(?!.*[._%+-]{2})[^\s@]+@[^\s@]+\.[^\s@]+$/,
      domainFormat: /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
      disposableDomains:
        /^[^\s@]+@(mailinator\.com|guerrillamail\.com|temp-mail\.org|10minutemail\.com|yopmail\.com)$/i,
      noNumericOnly: /^(?!\d+@)[^\s@]+@[^\s@]+\.[^\s@]+$/,
    }),
    [],
  )

  const commonTypos = useMemo(
    () => ({
      'gmial.com': 'gmail.com',
      'gmal.com': 'gmail.com',
      'gmail.co': 'gmail.com',
      'hotmial.com': 'hotmail.com',
      'hotmal.com': 'hotmail.com',
      'yaho.com': 'yahoo.com',
      'yahooo.com': 'yahoo.com',
      'outloo.com': 'outlook.com',
      'outlok.com': 'outlook.com',
    }),
    [],
  )

  const validateEmail = useCallback(() => {
    if (!email || email.length === 0) {
      setIsValid(false)
      setErrors([])
      if (onValidation) onValidation(false)
      return
    }

    const newErrors: string[] = []

    if (!patterns.format.test(email)) {
      newErrors.push('Invalid email format')
    }

    if (email.length > 0 && !patterns.noConsecutiveSpecials.test(email)) {
      newErrors.push('Email should not contain consecutive special characters')
    }

    if (email.length > 0 && !patterns.domainFormat.test(email)) {
      newErrors.push('Email domain should be valid (e.g., example.com)')
    }

    if (patterns.disposableDomains.test(email)) {
      newErrors.push('Disposable email addresses are not allowed')
    }

    if (!patterns.noNumericOnly.test(email)) {
      newErrors.push('Email username should not be numbers only')
    }

    if (email.length > 254) {
      newErrors.push('Email is too long (maximum 254 characters)')
    }

    const localPart = email.split('@')[0]
    if (localPart && localPart.length > 64) {
      newErrors.push(
        'Username part of email is too long (maximum 64 characters)',
      )
    }

    const domain = email.split('@')[1]?.toLowerCase()
    if (domain && commonTypos[domain as keyof typeof commonTypos]) {
      newErrors.push(
        `Did you mean ${commonTypos[domain as keyof typeof commonTypos]}?`,
      )
    }

    const isValidEmail = newErrors.length === 0

    setIsValid((prevIsValid) => {
      if (prevIsValid !== isValidEmail) {
        return isValidEmail
      }
      return prevIsValid
    })

    setErrors((prevErrors) => {
      if (JSON.stringify(prevErrors) !== JSON.stringify(newErrors)) {
        return newErrors
      }
      return prevErrors
    })

    if (onValidation) {
      onValidation(isValidEmail)
    }
  }, [email, onValidation, patterns, commonTypos])

  useEffect(() => {
    const timeoutId = setTimeout(validateEmail, 300)
    return () => clearTimeout(timeoutId)
  }, [validateEmail])

  if (!email) return null

  return (
    <div className={`mt-2 ${className}`}>
      {/* Validation indicator */}
      <div className="flex items-center">
        {isValid ? (
          <div className="flex items-center text-xs text-green-500">
            <FaCheck className="mr-1" />
            <span>Valid email format</span>
          </div>
        ) : email.length > 0 ? (
          <div className="flex items-center text-xs text-red-500">
            <FaTimes className="mr-1" />
            <span>Invalid email format</span>
          </div>
        ) : null}
      </div>

      {/* Errors display */}
      {errors.length > 0 && (
        <div className="mt-1 text-xs text-red-500">
          {errors.map((error, index) => (
            <div key={index} className="mt-0.5 flex items-start">
              <FaExclamationTriangle className="mt-0.5 mr-1 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
