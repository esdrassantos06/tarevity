'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { FaCheck, FaTimes, FaExclamationTriangle, FaLock } from 'react-icons/fa'
import { authAPI } from '@/lib/api'

interface PasswordStrengthMeterProps {
  password: string
  onValidation?: (isValid: boolean, isStrong: boolean) => void
  className?: string
}

export default function PasswordStrengthMeter({
  password,
  onValidation,
  className = '',
}: PasswordStrengthMeterProps) {
  const passwordRef = useRef(password)
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const onValidationRef = useRef(onValidation)

  const [state, setState] = useState({
    isChecking: false,
    strength: 0,
    isCompromised: false,
    errors: [] as string[],
  })

  const MIN_LENGTH = 8
  const STRONG_LENGTH = 12

  const criteria = useMemo(() => {
    return {
      hasLength: password.length >= MIN_LENGTH,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasDigit: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      hasNoRepeatingChars: !/(.)\\1{2,}/.test(password),
      hasNoSequentialChars:
        !/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
          password,
        ),
    }
  }, [password])

  const calculateLocalStrength = useCallback(() => {
    if (!password) return 0

    let localScore = 0
    if (password.length >= MIN_LENGTH) localScore += 10
    if (password.length >= STRONG_LENGTH) localScore += 10
    if (criteria.hasUppercase) localScore += 10
    if (criteria.hasLowercase) localScore += 10
    if (criteria.hasDigit) localScore += 10
    if (criteria.hasSpecial) localScore += 20
    if (criteria.hasNoRepeatingChars) localScore += 10
    if (criteria.hasNoSequentialChars) localScore += 10

    const uniqueChars = new Set(password).size
    localScore += Math.min(20, uniqueChars * 2)

    return Math.min(100, localScore)
  }, [password, criteria])

  const checkPassword = useMemo(() => {
    return async () => {
      const currentPassword = passwordRef.current
      const currentOnValidation = onValidationRef.current

      if (!currentPassword || currentPassword.length < MIN_LENGTH) {
        if (currentOnValidation) currentOnValidation(false, false)
        return
      }

      setState((prev) => ({ ...prev, isChecking: true, errors: [] }))

      try {
        const result = await authAPI.checkPassword(currentPassword)
        const localStrength = calculateLocalStrength()

        if (result.error) {
          setState((prev) => ({
            ...prev,
            isChecking: false,
            strength: localStrength,
            errors: [
              result.error?.message || 'Error checking password security.',
            ],
          }))
          if (currentOnValidation)
            currentOnValidation(localStrength >= 40, localStrength >= 70)
          return
        }

        if (result.data) {
          const dataStrength = result.data.strength ?? 0
          const responseErrors = result.data.errors ?? []

          setState((prev) => ({
            ...prev,
            isChecking: false,
            strength: dataStrength,
            isCompromised: !!result.data?.isCompromised,
            errors: responseErrors,
          }))

          if (currentOnValidation) {
            const isValid =
              Boolean(result.data.isValid) && !result.data.isCompromised
            const isStrong =
              Boolean(result.data.isStrong) && !result.data.isCompromised
            currentOnValidation(isValid, isStrong)
          }
        } else {
          setState((prev) => ({
            ...prev,
            isChecking: false,
            strength: localStrength,
          }))
          if (currentOnValidation)
            currentOnValidation(localStrength >= 40, localStrength >= 70)
        }
      } catch (error) {
        console.error('Exception checking password:', error)
        const localStrength = calculateLocalStrength()
        setState((prev) => ({
          ...prev,
          isChecking: false,
          strength: localStrength,
          errors: ['An unexpected error occurred'],
        }))
        if (currentOnValidation)
          currentOnValidation(localStrength >= 40, localStrength >= 70)
      }
    }
  }, [calculateLocalStrength])

  useEffect(() => {
    passwordRef.current = password
    onValidationRef.current = onValidation
  }, [password, onValidation])

  useEffect(() => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current)
    }

    const localStrength = calculateLocalStrength()

    if (!password || password.length < MIN_LENGTH) {
      setState((prev) => ({
        ...prev,
        strength: localStrength,
        isChecking: false,
        isCompromised: false,
        errors: [],
      }))

      onValidationRef.current?.(false, false)
      return
    }

    checkTimeoutRef.current = setTimeout(() => {
      if (passwordRef.current) {
        checkPassword()
      }
    }, 500)

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
      }
    }
  }, [password, calculateLocalStrength, checkPassword])

  if (!password) return null

  return (
    <div className={`mt-2 ${className}`}>
      {/* Strength bar */}
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            state.isCompromised
              ? 'bg-red-500'
              : state.strength < 40
                ? 'bg-red-500'
                : state.strength < 70
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
          }`}
          style={{ width: `${state.strength}%` }}
        ></div>
      </div>

      {/* Strength label and checking indicator */}
      <div className="mt-1 flex items-center justify-between">
        <span
          className={`text-xs font-medium ${
            state.isCompromised
              ? 'text-red-500 dark:text-red-400'
              : state.strength < 40
                ? 'text-red-500 dark:text-red-400'
                : state.strength < 70
                  ? 'text-yellow-500 dark:text-yellow-400'
                  : 'text-green-500 dark:text-green-400'
          }`}
        >
          {state.isCompromised
            ? 'Compromised Password'
            : state.strength < 40
              ? 'Weak Password'
              : state.strength < 70
                ? 'Moderate Password'
                : 'Strong Password'}
        </span>

        {state.isChecking && (
          <div className="flex items-center text-xs text-gray-500">
            <div className="mr-1 size-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            <span>Checking security...</span>
          </div>
        )}

        {/* Compromised warning */}
        {state.isCompromised && (
          <div className="flex items-center text-xs text-red-500">
            <FaLock className="mr-1" />
            <span>Password found in data breaches</span>
          </div>
        )}
      </div>

      {/* Password requirements */}
      {password.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
          {[
            {
              check: criteria.hasLength,
              label: 'At least 8 characters',
              icon: criteria.hasLength ? FaCheck : FaTimes,
            },
            {
              check: criteria.hasUppercase,
              label: 'One uppercase letter',
              icon: criteria.hasUppercase ? FaCheck : FaTimes,
            },
            {
              check: criteria.hasLowercase,
              label: 'One lowercase letter',
              icon: criteria.hasLowercase ? FaCheck : FaTimes,
            },
            {
              check: criteria.hasDigit,
              label: 'One number',
              icon: criteria.hasDigit ? FaCheck : FaTimes,
            },
            {
              check: criteria.hasSpecial,
              label: 'One special character',
              icon: criteria.hasSpecial ? FaCheck : FaTimes,
            },
          ].map(({ check, label, icon: Icon }, index) => (
            <div
              key={index}
              className={`flex items-center ${
                check ? 'text-green-500' : 'text-gray-500'
              }`}
            >
              <Icon className="mr-1" />
              <span>{label}</span>
            </div>
          ))}

          {password.length >= MIN_LENGTH && (
            <div
              className={`flex items-center ${
                criteria.hasNoSequentialChars
                  ? 'text-green-500'
                  : 'text-gray-500'
              }`}
            >
              {criteria.hasNoSequentialChars ? (
                <FaCheck className="mr-1" />
              ) : (
                <FaExclamationTriangle className="mr-1" />
              )}
              <span>No sequential patterns</span>
            </div>
          )}
        </div>
      )}

      {/* Errors display */}
      {state.errors.length > 0 && (
        <div className="mt-2 text-xs text-red-500">
          {state.errors.map((error, index) => (
            <div key={index} className="mt-1 flex items-start">
              <FaExclamationTriangle className="mt-0.5 mr-1 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
