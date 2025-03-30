/**
 * Ensures that a URL is absolute by adding appropriate prefixes if needed
 *
 * @param url
 * @returns
 */
export function ensureAbsoluteUrl(
  url: string | null | undefined,
): string | null {
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

/**
 * Validates an image file for supported formats and size limits
 *
 * @param file The file to validate
 * @param maxSizeBytes Maximum file size in bytes (default: 2MB)
 * @returns An object with validation result and error message if applicable
 */
export async function validateImageFile(
  file: File,
  maxSizeBytes: number = 2 * 1024 * 1024, // 2MB
): Promise<{ valid: boolean; error?: string }> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024))

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size error: maximum size is ${maxSizeMB}MB`,
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type error',
    }
  }

  return { valid: true }
}

/**
 * Creates a URL object for an image file for preview
 *
 * @param file The file to create a preview URL for
 * @returns An object URL string
 */
export function createImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Cleans up a previously created object URL to avoid memory leaks
 *
 * @param url The URL to revoke
 */
export function revokeImagePreviewUrl(url: string | null): void {
  if (url) {
    URL.revokeObjectURL(url)
  }
}
