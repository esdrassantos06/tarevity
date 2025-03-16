import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

async function validateImageContent(buffer: Buffer, declaredType: string): Promise<boolean> {
  if (declaredType === 'image/jpeg' && buffer.length > 2) {
    return buffer[0] === 0xFF && buffer[1] === 0xD8;
  }
  
  if (declaredType === 'image/png' && buffer.length > 8) {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  }
  
  if (declaredType === 'image/gif' && buffer.length > 6) {
    return (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46);
  }
  
  return ALLOWED_MIME_TYPES.includes(declaredType);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const formData = await request.formData()
    const imageFile = formData.get('image') as File | null

    if (!imageFile) {
      return NextResponse.json(
        { message: 'No image file provided' },
        { status: 400 },
      )
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'File size exceeds the 5MB limit' },
        { status: 400 },
      )
    }

    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        {
          message:
            'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed',
        },
        { status: 400 },
      )
    }

    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    if (!(await validateImageContent(buffer, imageFile.type))) {
      return NextResponse.json(
        { message: 'Invalid image content' },
        { status: 400 }
      );
    }

    const fileExtension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      return NextResponse.json(
        { message: 'Invalid file extension' },
        { status: 400 }
      );
    }
    
    const secureFileName = `${userId}_${uuidv4()}.${fileExtension}`
    const filePath = `profile_images/${secureFileName}`

    const { error } = await supabaseAdmin.storage
      .from('user_uploads')
      .upload(filePath, buffer, {
        contentType: imageFile.type,
        upsert: true,
        cacheControl: 'max-age=31536000',
      })

    if (error) {
      console.error('Error uploading to Supabase Storage:', error)
      return NextResponse.json(
        { message: 'Error uploading image' },
        { status: 500 },
      )
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('user_uploads').getPublicUrl(filePath)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const absoluteUrl = publicUrl.startsWith('http')
      ? publicUrl
      : `${supabaseUrl}/storage/v1/object/public/user_uploads/${filePath}`

    return NextResponse.json(
      {
        message: 'Image uploaded successfully',
        url: absoluteUrl,
        filename: secureFileName,
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