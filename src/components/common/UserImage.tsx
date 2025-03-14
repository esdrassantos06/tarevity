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
  className = "h-10 w-10 rounded-full object-cover", 
  size = 40,
  onClick
}) => {
  const [imageKey] = useState(Date.now())
  const [imageError, setImageError] = useState(false)
  
  // Usar o hook do ProfileComponent para buscar a imagem do banco de dados
  const { data: profileData } = useProfileQuery()
  
  // Resetar o estado de erro quando os dados do perfil são carregados
  useEffect(() => {
    if (profileData) {
      setImageError(false)
    }
  }, [profileData])
  
  // Helper para garantir que a URL da imagem tenha um protocolo adequado
  const ensureAbsoluteUrl = (url: string | null | undefined): string | null => {
    if (!url) return null

    // Se a URL não tiver protocolo, tente adicioná-lo
    if (!url.startsWith('http')) {
      // Verifica se é uma URL de armazenamento do Supabase
      if (url.includes('/storage/v1/object/')) {
        const baseUrl =
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          'https://your-supabase-project.supabase.co'
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
      }
      // Retorna a URL com protocolo https como fallback
      return `https:${url.startsWith('//') ? '' : '//'}${url}`
    }

    return url
  }
  
  // Obter a URL da imagem do perfil do banco de dados, não da sessão
  const profileImageUrl = profileData?.image ? ensureAbsoluteUrl(profileData.image) : null
  
  // Adicionar parâmetro de cache busting
  const getImageWithCacheBusting = (url: string | null) => {
    if (!url) return null
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}v=${imageKey}`
  }
  
  // Imagem final com cache busting
  const finalImageUrl = getImageWithCacheBusting(profileImageUrl)
  
  // Lidar com erro de carregamento de imagem
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