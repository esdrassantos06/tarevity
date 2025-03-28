'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { FaSave, FaTimes } from 'react-icons/fa'
import {
  useUpdateProfileMutation,
  useUploadImageMutation,
} from '@/hooks/useProfileQuery'
import { toast } from 'react-toastify'
import { Session } from 'next-auth'
import { ensureAbsoluteUrl } from '@/lib/image-utils'

interface ProfileData {
  id?: string
  name?: string
  email?: string
  image?: string | null
  provider?: string | null
}

interface SessionUpdateData {
  user?: {
    name?: string
    image?: string | null
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface ExtendedSession extends Session {
  update?: (data: SessionUpdateData) => Promise<Session>
}

interface ProfileFormProps {
  formData: {
    name: string
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string
    }>
  >
  profileData: ProfileData
  onCancel: () => void
  session: ExtendedSession
  refetchProfile: () => void
  selectedImage: File | null
  previewUrl: string | null
  setSelectedImage: (file: File | null) => void
  setPreviewUrl: (url: string | null) => void
  setIsEditing: (editing: boolean) => void
}

export default function ProfileForm({
  formData,
  setFormData,
  profileData,
  onCancel,
  session,
  refetchProfile,
  selectedImage,
  previewUrl,
  setSelectedImage,
  setPreviewUrl,
  setIsEditing,
}: ProfileFormProps) {
  const t = useTranslations('profile.form')
  const updateProfileMutation = useUpdateProfileMutation()
  const uploadImageMutation = useUploadImageMutation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      if (selectedImage) {
        const loadingToastId = toast.loading(t('uploadingImageToast'))

        uploadImageMutation.mutate(selectedImage, {
          onSuccess: (response) => {
            if (response.data?.url) {
              const imageUrl = ensureAbsoluteUrl(response.data.url)
              toast.update(loadingToastId, {
                render: t('updatingProfileToast'),
                isLoading: true,
              })

              updateProfileMutation.mutate(
                {
                  name: formData.name,
                  image: imageUrl,
                },
                {
                  onSuccess: async (response) => {
                    toast.dismiss(loadingToastId)

                    if (session.update && response?.data) {
                      await session.update({
                        user: {
                          ...session.user,
                          name: response.data.name,
                          image: response.data.image,
                        },
                      })

                      refetchProfile()
                    }

                    toast.success(t('successToast'))
                    setIsEditing(false)
                    setSelectedImage(null)
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl)
                      setPreviewUrl(null)
                    }
                  },
                  onError: (error) => {
                    toast.dismiss(loadingToastId)
                    toast.error(t('errorToast'))
                    console.error('Error updating profile:', error)
                  },
                },
              )
            } else {
              toast.dismiss(loadingToastId)
              toast.error(t('missingUrlErrorToast'))
              console.error('Upload response missing URL:', response)
            }
          },
          onError: (error: unknown) => {
            toast.loading('', { isLoading: false })
            toast.error(t('imageUploadErrorToast'))
            console.error('Error uploading image:', error)
          },
        })
      } else {
        updateProfileMutation.mutate(
          {
            name: formData.name,
            image: profileData?.image,
          },
          {
            onSuccess: async (response) => {
              if (session.update && response?.data) {
                await session.update({
                  user: {
                    ...session.user,
                    name: response.data.name,
                    image: response.data.image,
                  },
                })

                refetchProfile()
              }
              toast.success(t('successToast'))
              setIsEditing(false)
            },
            onError: (error) => {
              toast.error(t('errorToast'))
              console.error('Error updating profile:', error)
            },
          },
        )
      }
    } catch (error) {
      toast.error(t('genericErrorToast'))
      console.error('Error in form submission:', error)
    }
  }

  const isSubmitting =
    updateProfileMutation.isPending || uploadImageMutation.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('nameLabel')}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md p-2 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="flex space-x-3">
        <button
          aria-label={t('uploadImageAriaLabel')}
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primaryHover inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm outline-none"
        >
          <FaSave className="mr-2 -ml-1 size-4" />
          {isSubmitting ? t('savingButton') : t('saveButton')}
        </button>
        <button
          aria-label={t('cancelAriaLabel')}
          type="button"
          onClick={onCancel}
          className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm outline-none hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <FaTimes className="mr-2 -ml-1 size-4" />
          {t('cancelButton')}
        </button>
      </div>
    </form>
  )
}
