'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useProfileQuery, useStatsQuery } from '@/hooks/useProfileQuery'
import ProfileHeader from '../ui/ProfileHeader'
import ProfileImageManager from '../ui/ProfileImageManager'
import ProfileForm from '../ui/ProfileForm'
import UserStats from '../ui/UserStats'
import ProfileDiscardDialog from '../dialog/ProfileDiscardDialog'

export default function ProfileManager() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useProfileQuery()

  const { data: userStats } = useStatsQuery()

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
      })
    }
  }, [profileData])

  const toggleEditMode = () => {
    setIsEditing(true)
  }

  const openDiscardDialog = () => {
    if (formData.name !== profileData?.name || selectedImage) {
      setIsDiscardDialogOpen(true)
    } else {
      setIsEditing(false)
    }
  }

  if (isLoadingProfile && !profileData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!session?.user || !profileData) {
    return (
      <div className="rounded-lg bg-white p-6 shadow dark:bg-BlackLight">
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to view your profile.
        </p>
      </div>
    )
  }

  const typedUserStats = userStats
    ? {
        total: userStats.total,
        completed: userStats.completed,
        pending: userStats.pending,
      }
    : undefined

  return (
    <div className="dark:bg-BlackLight overflow-hidden rounded-lg bg-white shadow">
      {/* Profile Header */}
      <div className="bg-primary h-32"></div>

      <div className="px-6 py-8">
        <div className="flex flex-col items-center md:flex-row">
          {/* Profile Image Management */}
          <ProfileImageManager
            profileData={profileData}
            isEditing={isEditing}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            previewUrl={previewUrl}
            setPreviewUrl={setPreviewUrl}
            isDeleteDialogOpen={isDeleteDialogOpen}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            session={session}
            refetchProfile={refetchProfile}
          />

          {/* Profile Info & Form */}
          <div className="flex-1">
            {isEditing ? (
              <ProfileForm
                formData={formData}
                setFormData={setFormData}
                profileData={profileData}
                onCancel={openDiscardDialog}
                session={session}
                refetchProfile={refetchProfile}
                selectedImage={selectedImage}
                previewUrl={previewUrl}
                setSelectedImage={setSelectedImage}
                setPreviewUrl={setPreviewUrl}
                setIsEditing={setIsEditing}
              />
            ) : (
              <ProfileHeader
                profileData={profileData}
                onEdit={toggleEditMode}
              />
            )}
          </div>
        </div>
      </div>

      {/* Profile Sections - Statistics */}
      <UserStats userStats={typedUserStats} />

      {/* Dialogs */}
      <ProfileDiscardDialog
        isOpen={isDiscardDialogOpen}
        onClose={() => setIsDiscardDialogOpen(false)}
        onConfirm={() => {
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
        }}
      />
    </div>
  )
}
