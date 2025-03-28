'use client'

import React, { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { FaUser, FaCamera, FaTrash } from 'react-icons/fa'
import { useDeleteProfileImageMutation } from '@/hooks/useProfileQuery'
import { Session } from 'next-auth'
import { toast } from 'react-toastify'
import DeleteImageDialog from '../dialog/DeleteImageDialog'
import { ensureAbsoluteUrl, validateImageFile } from '@/lib/image-utils'

interface ProfileData {
  id?: string
  name?: string
  email?: string
  image?: string | null
  provider?: string | null
}

interface SessionUpdateData {
  user: {
    image: string | null
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface ExtendedSession extends Session {
  update?: (data: SessionUpdateData) => Promise<Session>
}

interface ProfileImageManagerProps {
  profileData: ProfileData
  isEditing: boolean
  selectedImage: File | null
  setSelectedImage: (file: File | null) => void
  previewUrl: string | null
  setPreviewUrl: (url: string | null) => void
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (isOpen: boolean) => void
  session: ExtendedSession
  refetchProfile: () => void
}

export default function ProfileImageManager({
  profileData,
  isEditing,
  selectedImage,
  setSelectedImage,
  previewUrl,
  setPreviewUrl,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  session,
  refetchProfile,
}: ProfileImageManagerProps) {
  void !!selectedImage

  const t = useTranslations('profile.imageManager')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageError, setImageError] = useState(false)
  const deleteProfileImageMutation = useDeleteProfileImageMutation()

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!(await validation).valid) {
      toast.error((await validation).error)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setSelectedImage(file)
    setImageError(false)
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const openDeleteDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteImage = () => {
    setSelectedImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    deleteProfileImageMutation.mutate(undefined, {
      onSuccess: async () => {
        if (session && session.update) {
          await session.update({
            ...session,
            user: {
              ...session.user,
              image: null,
            },
          })
        }
        setImageError(false)
        refetchProfile()
        toast.success(t('removeImageSuccessToast'))
      },
    })

    setIsDeleteDialogOpen(false)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const profileImageUrl = ensureAbsoluteUrl(profileData.image)

  return (
    <div className="relative -mt-16 mb-4 md:mr-6 md:mb-0">
      {/* Delete button positioned outside of the avatar container */}
      {isEditing && profileImageUrl && !imageError && (
        <button
          aria-label={t('removeImageAriaLabel')}
          className="absolute right-3 bottom-3 z-50 flex translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-red-500 p-1.5 text-white shadow-md hover:bg-red-600 dark:border-gray-800"
          onClick={(e) => {
            e.stopPropagation()
            openDeleteDialog(e)
          }}
          title={t('removeImageTitle')}
          type="button"
        >
          <FaTrash className="size-4" />
        </button>
      )}

      <div className="bg-bgLight border-BorderLight dark:border-BorderDark relative size-24 overflow-hidden rounded-full border-4">
        {isEditing ? (
          <div className="relative size-full">
            {/* Preview image or current image */}
            {previewUrl ? (
              <div
                className="size-full cursor-pointer"
                onClick={handleImageClick}
              >
                <Image
                  src={previewUrl}
                  alt={t('previewAlt')}
                  width={96}
                  height={96}
                  className="size-full object-cover"
                  onError={handleImageError}
                />
              </div>
            ) : profileImageUrl && !imageError ? (
              <div
                className="size-full cursor-pointer"
                onClick={handleImageClick}
              >
                <Image
                  src={profileImageUrl}
                  alt={profileData.name || t('profilePictureAlt')}
                  width={96}
                  height={96}
                  className="size-full object-cover"
                  onError={handleImageError}
                />
              </div>
            ) : (
              <div
                className="flex size-full cursor-pointer items-center justify-center bg-blue-100 dark:bg-blue-900"
                onClick={handleImageClick}
              >
                <FaUser className="size-12 text-blue-500 dark:text-blue-300" />
              </div>
            )}

            {/* Camera overlay */}
            <div
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50"
              onClick={handleImageClick}
            >
              <FaCamera className="size-8 text-white" />
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
            />
          </div>
        ) : profileImageUrl && !imageError ? (
          <Image
            src={profileImageUrl}
            alt={profileData.name || t('profilePictureAlt')}
            width={96}
            height={96}
            className="size-full object-cover"
            priority
            unoptimized={true}
            onError={handleImageError}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-blue-100 dark:bg-blue-900">
            <FaUser className="size-12 text-blue-500 dark:text-blue-300" />
          </div>
        )}
      </div>

      <DeleteImageDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteImage}
      />
    </div>
  )
}
