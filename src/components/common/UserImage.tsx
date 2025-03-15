'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaUser } from 'react-icons/fa'
import { useProfileQuery } from '@/hooks/useProfileQuery'

interface UserImageProps {
  className?: string
  size?: number
  onClick?: () => void
}

const UserImage: React.FC<UserImageProps> = ({
  className = 'h-10 w-10 cursor-pointer rounded-full object-cover',
  size = 40,
  onClick,
}) => {
  const [imageKey] = useState(Date.now())
  const [imageError, setImageError] = useState(false)

  const { data: profileData } = useProfileQuery()

  useEffect(() => {
    if (profileData) {
      setImageError(false)
    }
  }, [profileData])

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

  const profileImageUrl = profileData?.image
    ? ensureAbsoluteUrl(profileData.image)
    : null

  const getImageWithCacheBusting = (url: string | null) => {
    if (!url) return null
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}v=${imageKey}`
  }

  const finalImageUrl = getImageWithCacheBusting(profileImageUrl)

  const handleImageError = () => {
    console.error('Image failed to load')
    setImageError(true)
  }

  if (!finalImageUrl || imageError) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 ${className}`}
        onClick={onClick}
      >
        <FaUser className="h-5 w-5 text-blue-500 dark:text-blue-300" />
      </div>
    )
  }

  return (
    <Image
      title={profileData?.name}
      src={finalImageUrl}
      alt={profileData?.name || 'Profile Picture'}
      width={size}
      height={size}
      className={className}
      unoptimized
      priority
      onClick={onClick}
      key={`user-img-${imageKey}`}
      onError={handleImageError}
    />
  )
}

export default UserImage
