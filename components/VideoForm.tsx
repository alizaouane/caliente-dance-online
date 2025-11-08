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

interface VideoFormProps {
  video?: any
}

export function VideoForm({ video }: VideoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
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
    }
    loadData()
  }, [supabase])

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

