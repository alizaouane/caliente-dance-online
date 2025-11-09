import { createServiceClient } from './supabase/server'

const BUCKETS = {
  videos: 'videos',
  thumbnails: 'thumbnails',
  previews: 'previews',
} as const

export async function uploadFile(
  bucket: keyof typeof BUCKETS,
  path: string,
  file: File | Buffer,
  contentType?: string
): Promise<string> {
  try {
    const supabase = createServiceClient()
    const bucketName = BUCKETS[bucket]

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        contentType,
        upsert: true,
      })

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    return data.path
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export async function getSignedUrl(
  bucket: keyof typeof BUCKETS,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    if (!path) {
      throw new Error('Path is required')
    }
    const supabase = createServiceClient()
    const bucketName = BUCKETS[bucket]

    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, expiresIn)

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`)
    }

    return data.signedUrl
  } catch (error) {
    console.error('Error creating signed URL:', error)
    throw error
  }
}

export async function deleteFile(
  bucket: keyof typeof BUCKETS,
  path: string
): Promise<void> {
  try {
    const supabase = createServiceClient()
    const bucketName = BUCKETS[bucket]

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path])

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

// Public URL helper (for thumbnails that should be public)
export function getPublicUrl(bucket: keyof typeof BUCKETS, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not set')
    return ''
  }
  const bucketName = BUCKETS[bucket]
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`
}

