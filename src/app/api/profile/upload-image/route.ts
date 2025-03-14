import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { v4 as uuidv4 } from 'uuid'

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Parse the multipart form data
    const formData = await request.formData()
    const imageFile = formData.get('image') as File | null

    if (!imageFile) {
      return NextResponse.json(
        { message: 'No image file provided' },
        { status: 400 },
      )
    }

    // Validate file size
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'File size exceeds the 5MB limit' },
        { status: 400 },
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(imageFile.type)) {
      return NextResponse.json(
        {
          message:
            'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed',
        },
        { status: 400 },
      )
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate a unique filename with UUID
    const fileExtension = imageFile.name.split('.').pop() || 'jpg'
    const fileName = `${userId}_${uuidv4()}.${fileExtension}`
    const filePath = `profile_images/${fileName}`

    // Upload to Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from('user_uploads')
      .upload(filePath, buffer, {
        contentType: imageFile.type,
        upsert: true,
      })

    if (error) {
      console.error('Error uploading to Supabase Storage:', error)
      return NextResponse.json(
        { message: 'Error uploading image' },
        { status: 500 },
      )
    }

    // Get the public URL for the uploaded image
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('user_uploads').getPublicUrl(filePath)

    // Make sure the URL is absolute
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    // Check if we need to construct a fully qualified URL
    const absoluteUrl = publicUrl.startsWith('http')
      ? publicUrl
      : `${supabaseUrl}/storage/v1/object/public/user_uploads/${filePath}`

    return NextResponse.json(
      {
        message: 'Image uploaded successfully',
        url: absoluteUrl,
        filename: fileName,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error handling image upload:', error)
    return NextResponse.json(
      { message: 'Error processing image upload' },
      { status: 500 },
    )
  }
}
