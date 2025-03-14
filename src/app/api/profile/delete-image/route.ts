import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('provider, provider_id, image')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json(
        { message: 'Error fetching user data' },
        { status: 500 },
      )
    }

    let imageToDelete = null
    if (userData.image && userData.image.includes('user_uploads')) {
      const urlParts = userData.image.split('/')
      const filename = urlParts[urlParts.length - 1]

      if (filename) {
        imageToDelete = `profile_images/${filename}`
      }
    }

    let newImageValue = null

    if (userData.provider === 'github' || userData.provider === 'google') {
      newImageValue = null
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        image: newImageValue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user profile:', updateError)
      return NextResponse.json(
        { message: 'Error removing profile image reference' },
        { status: 500 },
      )
    }

    if (imageToDelete) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('user_uploads')
        .remove([imageToDelete])

      if (storageError) {
        console.error(
          'Warning: Could not delete image file from storage:',
          storageError,
        )
      }
    }

    return NextResponse.json(
      {
        message: 'Profile image deleted successfully',
        provider: userData.provider,
      },
      { status: 200 },
    )
  } catch (error: unknown) {
    console.error('Error in delete profile image API:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error deleting profile image',
      },
      { status: 500 },
    )
  }
}
