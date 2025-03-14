'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import Image from 'next/image'
import {
  FaUser,
  FaEnvelope,
  FaPencilAlt,
  FaSave,
  FaTimes,
  FaClipboardList,
  FaClipboardCheck,
  FaClock,
  FaCamera,
  FaTrash,
} from 'react-icons/fa'
import {
  useProfileQuery,
  useStatsQuery,
  useUpdateProfileMutation,
  useUploadImageMutation,
  useDeleteProfileImageMutation,
} from '@/hooks/useProfileQuery'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/common/Dialog'

export default function ProfileComponent() {
  const { data: session, update } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Add state to track image loading errors
  const [imageError, setImageError] = useState(false)

  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)

  // React Query hooks
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useProfileQuery()

  const { data: userStats, error: statsError } = useStatsQuery()

  const updateProfileMutation = useUpdateProfileMutation()
  const uploadImageMutation = useUploadImageMutation()
  const deleteProfileImageMutation = useDeleteProfileImageMutation()

  // Update the form when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
      })
      // Reset image error state when profile data is refreshed
      setImageError(false)
    }
  }, [profileData])

  // Display query errors if they occur
  useEffect(() => {
    if (profileError) {
      console.error('Error fetching profile:', profileError)
      toast.error('Could not load your profile')
    }
  }, [profileError])

  // Display stats errors if they occur
  useEffect(() => {
    if (statsError) {
      console.error('Error fetching stats:', statsError)
      toast.error('Could not load your statistics')
    }
  }, [statsError])

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('Image is too large. Maximum size is 5MB.')
      return
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        'Invalid file type. Please select a JPG, PNG, GIF, or WebP image.',
      )
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setSelectedImage(file)
    // Reset image error state when a new image is selected
    setImageError(false)
  }

  // Handle clicking the image placeholder to open file selector
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  // Handle opening the delete dialog
  const openDeleteDialog = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the file upload click
    setIsDeleteDialogOpen(true)
  }

  // Handle delete image confirmation
  const confirmDeleteImage = () => {
    setSelectedImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    deleteProfileImageMutation.mutate(undefined, {
      onSuccess: async () => {
        if (update && session) {
          await update({
            ...session,
            user: {
              ...session.user,
              image: null, // Remover a imagem da sessão
            },
          })
        }
        setImageError(false)
        refetchProfile() // Atualizar os dados do perfil
        toast.success('Profile image removed successfully')
      },
    })

    // Fechar o diálogo
    setIsDeleteDialogOpen(false)
  }

  // Handle opening the discard changes dialog
  const openDiscardDialog = () => {
    if (formData.name !== profileData?.name || selectedImage) {
      setIsDiscardDialogOpen(true)
    } else {
      setIsEditing(false)
    }
  }

  // Handle cancel edit confirmation
  const confirmDiscardChanges = () => {
    setFormData({
      name: profileData?.name || '',
    })
    setIsEditing(false)
    setSelectedImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setIsDiscardDialogOpen(false)
  }

  // Helper to ensure image URL has proper protocol
  const ensureAbsoluteUrl = (url: string | null | undefined): string | null => {
    if (!url) return null

    // If URL doesn't have protocol, try to add it
    if (!url.startsWith('http')) {
      // Check if it's a Supabase storage URL
      if (url.includes('/storage/v1/object/')) {
        const baseUrl =
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          'https://your-supabase-project.supabase.co'
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
      }
      // Return the URL with https protocol as a fallback
      return `https:${url.startsWith('//') ? '' : '//'}${url}`
    }

    return url
  }

  // Handle image load error
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    console.error('Image failed to load:', e.currentTarget.src)
    setImageError(true)
    // We could set a default avatar here if needed
    // e.currentTarget.src = '/default-avatar.png'
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // First check if we have an image to upload
      if (selectedImage) {
        // Start loading state
        const loadingToastId = toast.loading('Uploading image...')

        // Upload the image first
        uploadImageMutation.mutate(selectedImage, {
          onSuccess: (response) => {
            // Only proceed if we got a valid URL
            if (response.data?.url) {
              const imageUrl = ensureAbsoluteUrl(response.data.url)
              // Update toast to show progress
              toast.update(loadingToastId, {
                render: 'Updating profile...',
                isLoading: true,
              })

              // Now update the profile with the new image URL
              updateProfileMutation.mutate(
                {
                  name: formData.name,
                  image: imageUrl, // Use the processed URL
                },
                {
                  onSuccess: async (response) => {
                    // Clear loading toast
                    toast.dismiss(loadingToastId)

                    if (update && response?.data) {
                      // Update the session with the new user data
                      await update({
                        ...session,
                        user: {
                          ...session?.user,
                          name: response.data.name,
                          image: response.data.image,
                        },
                      })

                      // Refetch profile data to ensure we have the latest
                      refetchProfile()
                    }

                    toast.success('Profile updated successfully!')
                    setIsEditing(false)
                    setSelectedImage(null)
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl)
                      setPreviewUrl(null)
                    }
                  },
                  onError: (error) => {
                    toast.dismiss(loadingToastId)
                    toast.error('Error updating profile')
                    console.error('Error updating profile:', error)
                  },
                },
              )
            } else {
              toast.dismiss(loadingToastId)
              toast.error('Failed to upload image: No URL returned')
              console.error('Upload response missing URL:', response)
            }
          },
          onError: (error: unknown) => {
            toast.dismiss(loadingToastId)
            toast.error('Error uploading image')
            console.error('Error uploading image:', error)
          },
        })
      } else {
        // No image to upload, just update the profile with existing image
        updateProfileMutation.mutate(
          {
            name: formData.name,
            image: profileData?.image,
          },
          {
            onSuccess: async (response) => {
              if (update && response?.data) {
                await update({
                  ...session,
                  user: {
                    ...session?.user,
                    name: response.data.name,
                    image: response.data.image,
                  },
                })

                // Refetch profile data
                refetchProfile()
              }
              toast.success('Profile updated successfully!')
              setIsEditing(false)
            },
            onError: (error) => {
              toast.error('Error updating profile')
              console.error('Error updating profile:', error)
            },
          },
        )
      }
    } catch (error) {
      toast.error('An error occurred while updating your profile')
      console.error('Error in form submission:', error)
    }
  }

  // Show loading state
  if (
    (isLoadingProfile && !profileData) ||
    updateProfileMutation.isPending ||
    uploadImageMutation.isPending ||
    deleteProfileImageMutation.isPending
  ) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!session?.user || !profileData) {
    return (
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to view your profile.
        </p>
      </div>
    )
  }

  // Process the image URL to ensure it's absolute
  const profileImageUrl = ensureAbsoluteUrl(profileData.image)

  return (
    <div className="dark:bg-BlackLight overflow-hidden rounded-lg bg-white shadow">
      {/* Profile Header */}
      <div className="bg-primary h-32"></div>

      <div className="px-6 py-8">
        <div className="flex flex-col items-center md:flex-row">
          {/* Profile Image */}
          <div className="relative -mt-16 mb-4 md:mr-6 md:mb-0">
            {/* Delete button positioned outside of the avatar container */}
            {isEditing && profileImageUrl && !imageError && (
              <button
                className="absolute right-3 bottom-3 z-50 flex translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-red-500 p-1.5 text-white shadow-md hover:bg-red-600 dark:border-gray-800"
                onClick={(e) => {
                  e.stopPropagation()
                  openDeleteDialog(e)
                }}
                title="Remove profile image"
                type="button"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            )}

            <div className="bg-bgLight border-BorderLight dark:border-BorderDark relative h-24 w-24 overflow-hidden rounded-full border-4">
              {isEditing ? (
                <div className="relative h-full w-full">
                  {/* Preview image or current image */}
                  {previewUrl ? (
                    <div
                      className="h-full w-full cursor-pointer"
                      onClick={handleImageClick}
                    >
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                        onError={handleImageError}
                      />
                    </div>
                  ) : profileImageUrl && !imageError ? (
                    <div
                      className="h-full w-full cursor-pointer"
                      onClick={handleImageClick}
                    >
                      <Image
                        src={profileImageUrl}
                        alt={profileData.name || 'Profile Picture'}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                        onError={handleImageError}
                      />
                    </div>
                  ) : (
                    <div
                      className="flex h-full w-full cursor-pointer items-center justify-center bg-blue-100 dark:bg-blue-900"
                      onClick={handleImageClick}
                    >
                      <FaUser className="h-12 w-12 text-blue-500 dark:text-blue-300" />
                    </div>
                  )}

                  {/* Camera overlay */}
                  <div
                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50"
                    onClick={handleImageClick}
                  >
                    <FaCamera className="h-8 w-8 text-white" />
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
                  alt={profileData.name || 'Profile Picture'}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  priority
                  unoptimized={true}
                  onError={handleImageError}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-100 dark:bg-blue-900">
                  <FaUser className="h-12 w-12 text-blue-500 dark:text-blue-300" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Info & Form */}
          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md p-2 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                    disabled={
                      updateProfileMutation.isPending ||
                      uploadImageMutation.isPending ||
                      deleteProfileImageMutation.isPending
                    }
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={
                      updateProfileMutation.isPending ||
                      uploadImageMutation.isPending ||
                      deleteProfileImageMutation.isPending
                    }
                    className="bg-primary hover:bg-primaryHover inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm outline-none"
                  >
                    <FaSave className="mr-2 -ml-1 h-4 w-4" />
                    {updateProfileMutation.isPending ||
                    uploadImageMutation.isPending ||
                    deleteProfileImageMutation.isPending
                      ? 'Saving...'
                      : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={openDiscardDialog}
                    className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm outline-none hover:bg-gray-50 dark:bg-zinc-600 dark:text-gray-200 dark:hover:bg-zinc-700"
                  >
                    <FaTimes className="mr-2 -ml-1 h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileData.name || 'User'}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center rounded-md border border-transparent p-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <FaPencilAlt className="h-4 w-4" />
                    <span className="ml-1">Edit</span>
                  </button>
                </div>
                <div className="mt-2 flex items-center text-gray-600 dark:text-gray-400">
                  <FaEnvelope className="mr-2 h-4 w-4" />
                  <span>{profileData.email}</span>
                </div>
                <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>
                      Login method:{' '}
                      {profileData.provider
                        ? profileData.provider.charAt(0).toUpperCase() +
                          profileData.provider.slice(1)
                        : 'Email/Password'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="border-t border-gray-200 px-6 py-6 dark:border-gray-700">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          Task Statistics
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {userStats ? userStats.total : '--'}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <FaClipboardList className="mr-1" />
              Created Tasks
            </div>
          </div>
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {userStats ? userStats.completed : '--'}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <FaClipboardCheck className="mr-1" />
              Completed Tasks
            </div>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/30">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {userStats ? userStats.pending : '--'}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <FaClock className="mr-1" />
              Pending
            </div>
          </div>
        </div>
      </div>

      {/* Delete Profile Image Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete Profile Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove your profile image? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteImage}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discard Changes Confirmation Dialog */}
      <Dialog open={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Discard Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setIsDiscardDialogOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={confirmDiscardChanges}
              className="rounded-md bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
            >
              Discard Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
