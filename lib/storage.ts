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
}

export async function getSignedUrl(
  bucket: keyof typeof BUCKETS,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createServiceClient()
  const bucketName = BUCKETS[bucket]

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}

export async function deleteFile(
  bucket: keyof typeof BUCKETS,
  path: string
): Promise<void> {
  const supabase = createServiceClient()
  const bucketName = BUCKETS[bucket]

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([path])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

// Public URL helper (for thumbnails that should be public)
export function getPublicUrl(bucket: keyof typeof BUCKETS, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const bucketName = BUCKETS[bucket]
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`
}

