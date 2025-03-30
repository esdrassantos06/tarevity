'use client'
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { FaUser } from 'react-icons/fa'
import { useProfileQuery } from '@/hooks/useProfileQuery'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'

interface UserData {
  name?: string
  image?: string
}
interface UserImageProps {
  className?: string
  size?: number
  onClick?: () => void
}

const UserImage: React.FC<UserImageProps> = ({
  className = 'size-10 cursor-pointer rounded-full object-cover',
  size = 40,
  onClick,
}) => {
  const t = useTranslations('Common.profileImage')
  const { status, data: sessionData } = useSession()
  const queryClient = useQueryClient()
  const userId = sessionData?.user?.id

  const imageLoadedRef = useRef(false)
  
  const [imageError, setImageError] = useState(false)
  
  const lastValidUrlRef = useRef<string | null>(null)

  const cachedData = queryClient.getQueryData(['profile', userId])
  
  const { data: profileData, isLoading } = useProfileQuery({
    enabled: status === 'authenticated' && !cachedData && !imageLoadedRef.current,
  })


  
  const userData: UserData = (profileData || cachedData) as UserData

  useEffect(() => {
    if (userData?.image && !imageError) {
      imageLoadedRef.current = true
      
      const url = ensureAbsoluteUrl(userData.image)
      if (url) {
        lastValidUrlRef.current = url
      }
    }
  }, [userData, imageError])

  const ensureAbsoluteUrl = (url: string | null | undefined): string | null => {
    if (!url) return null
    if (!url.startsWith('http')) {
      if (url.includes('/storage/v1/object/')) {
        const baseUrl =
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          'https://your-supabase-project.supabase.co'
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
      }
      return `https:${url.startsWith('//') ? '' : '//'}${url}`
    }
    return url
  }

  const profileImageUrl = userData?.image
    ? ensureAbsoluteUrl(userData.image)
    : lastValidUrlRef.current

  const handleImageError = () => {
    console.error('Image failed to load')
    setImageError(true)
  }

  if (isLoading || !profileImageUrl || imageError) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 ${className}`}
        onClick={onClick}
      >
        <FaUser className="size-5 text-blue-500 dark:text-blue-300" />
      </div>
    )
  }

  return (
    <Image
      title={userData?.name}
      src={profileImageUrl}
      alt={userData?.name || t('defaultAlt')}
      width={size}
      height={size}
      className={className}
      unoptimized
      priority
      onClick={onClick}
      onError={handleImageError}
    />
  )
}

export default UserImage