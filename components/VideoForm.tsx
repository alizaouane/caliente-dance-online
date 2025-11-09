'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { getPublicUrl } from '@/lib/storage'

interface VideoFormProps {
  video?: any
}

export function VideoForm({ video }: VideoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [styles, setStyles] = useState<any[]>([])
  const [levels, setLevels] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: video?.title || '',
    slug: video?.slug || '',
    description: video?.description || '',
    duration_seconds: video?.duration_seconds || '',
    teacher: video?.teacher || '',
    published: video?.published || false,
    selectedStyles: video?.video_styles?.map((vs: any) => vs.styles.id) || [],
    selectedLevels: video?.video_levels?.map((vl: any) => vl.levels.id) || [],
    video_path: video?.video_path || '',
    preview_path: video?.preview_path || '',
    thumbnail_path: video?.thumbnail_path || '',
  })
  const [filePreviews, setFilePreviews] = useState({
    video: null as string | null,
    preview: null as string | null,
    thumbnail: null as string | null,
  })

  useEffect(() => {
    async function loadData() {
      const { data: stylesData } = await supabase
        .from('styles')
        .select('id, name')
        .order('position')

      const { data: levelsData } = await supabase
        .from('levels')
        .select('id, name')
        .order('position')

      setStyles(stylesData || [])
      setLevels(levelsData || [])

      // Load existing file previews
      if (video) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (supabaseUrl) {
          setFilePreviews({
            video: video.video_path ? `${supabaseUrl}/storage/v1/object/public/videos/${video.video_path}` : null,
            preview: video.preview_path ? `${supabaseUrl}/storage/v1/object/public/previews/${video.preview_path}` : null,
            thumbnail: video.thumbnail_path ? `${supabaseUrl}/storage/v1/object/public/thumbnails/${video.thumbnail_path}` : null,
          })
        }
      }
    }
    loadData()
  }, [supabase, video])

  const handleFileUpload = async (file: File, bucket: 'videos' | 'previews' | 'thumbnails', field: 'video_path' | 'preview_path' | 'thumbnail_path') => {
    setUploading(field)
    setUploadProgress(0)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('bucket', bucket)
      
      // Use existing path if updating, or generate new one
      if (formData[field]) {
        uploadFormData.append('path', formData[field])
      }

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const { path, url } = await response.json()
      
      setFormData({ ...formData, [field]: path })
      setFilePreviews({ ...filePreviews, [field === 'video_path' ? 'video' : field === 'preview_path' ? 'preview' : 'thumbnail']: url })
      
      toast({
        title: 'Success',
        description: 'File uploaded successfully!',
      })
    } catch (error: any) {
      toast({
        title: 'Upload Error',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      })
    } finally {
      setUploading(null)
      setUploadProgress(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(
        video ? `/api/admin/videos/${video.id}` : '/api/admin/videos',
        {
          method: video ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save video')
      }

      toast({
        title: 'Success',
        description: `Video ${video ? 'updated' : 'created'} successfully!`,
      })

      router.push('/admin/videos')
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save video',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Video title, description, and metadata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              placeholder="video-slug-url"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_seconds}
                onChange={(e) => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher</Label>
              <Input
                id="teacher"
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Assign styles and levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-3 block">Dance Styles</Label>
            <div className="space-y-2">
              {styles.map((style) => (
                <div key={style.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`style-${style.id}`}
                    checked={formData.selectedStyles.includes(style.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          selectedStyles: [...formData.selectedStyles, style.id],
                        })
                      } else {
                        setFormData({
                          ...formData,
                          selectedStyles: formData.selectedStyles.filter((id: string) => id !== style.id),
                        })
                      }
                    }}
                  />
                  <Label htmlFor={`style-${style.id}`} className="font-normal cursor-pointer">
                    {style.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-3 block">Levels</Label>
            <div className="space-y-2">
              {levels.map((level) => (
                <div key={level.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`level-${level.id}`}
                    checked={formData.selectedLevels.includes(level.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          selectedLevels: [...formData.selectedLevels, level.id],
                        })
                      } else {
                        setFormData({
                          ...formData,
                          selectedLevels: formData.selectedLevels.filter((id: string) => id !== level.id),
                        })
                      }
                    }}
                  />
                  <Label htmlFor={`level-${level.id}`} className="font-normal cursor-pointer">
                    {level.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media Files</CardTitle>
          <CardDescription>Upload video, preview, and thumbnail files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video File Upload */}
          <div className="space-y-2">
            <Label htmlFor="video">Video File (MP4, WebM, MOV)</Label>
            {filePreviews.video && (
              <div className="mb-2">
                <video
                  src={filePreviews.video}
                  controls
                  className="w-full max-w-md rounded border"
                  style={{ maxHeight: '200px' }}
                />
                <p className="text-sm text-muted-foreground mt-1">Current video</p>
              </div>
            )}
            <Input
              id="video"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, 'videos', 'video_path')
              }}
              disabled={uploading === 'video_path'}
            />
            {uploading === 'video_path' && (
              <div className="text-sm text-muted-foreground">Uploading video...</div>
            )}
            {formData.video_path && (
              <p className="text-sm text-muted-foreground">Path: {formData.video_path}</p>
            )}
          </div>

          {/* Preview File Upload */}
          <div className="space-y-2">
            <Label htmlFor="preview">Preview File (MP4, WebM, MOV) - Optional</Label>
            {filePreviews.preview && (
              <div className="mb-2">
                <video
                  src={filePreviews.preview}
                  controls
                  className="w-full max-w-md rounded border"
                  style={{ maxHeight: '200px' }}
                />
                <p className="text-sm text-muted-foreground mt-1">Current preview</p>
              </div>
            )}
            <Input
              id="preview"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, 'previews', 'preview_path')
              }}
              disabled={uploading === 'preview_path'}
            />
            {uploading === 'preview_path' && (
              <div className="text-sm text-muted-foreground">Uploading preview...</div>
            )}
            {formData.preview_path && (
              <p className="text-sm text-muted-foreground">Path: {formData.preview_path}</p>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail Image (JPG, PNG, WebP)</Label>
            {filePreviews.thumbnail && (
              <div className="mb-2">
                <img
                  src={filePreviews.thumbnail}
                  alt="Thumbnail"
                  className="w-full max-w-md rounded border"
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
                <p className="text-sm text-muted-foreground mt-1">Current thumbnail</p>
              </div>
            )}
            <Input
              id="thumbnail"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, 'thumbnails', 'thumbnail_path')
              }}
              disabled={uploading === 'thumbnail_path'}
            />
            {uploading === 'thumbnail_path' && (
              <div className="text-sm text-muted-foreground">Uploading thumbnail...</div>
            )}
            {formData.thumbnail_path && (
              <p className="text-sm text-muted-foreground">Path: {formData.thumbnail_path}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
          <CardDescription>Control video visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
            />
            <Label htmlFor="published" className="cursor-pointer">
              Published (visible to members)
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : video ? 'Update Video' : 'Create Video'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

