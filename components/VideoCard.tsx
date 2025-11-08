import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDuration } from '@/lib/utils'
import { getPublicUrl } from '@/lib/storage'
import { Play } from 'lucide-react'

interface VideoCardProps {
  id: string
  slug: string
  title: string
  thumbnailPath: string | null
  durationSeconds: number | null
  styles: Array<{ name: string; slug: string }>
  levels: Array<{ name: string }>
}

export function VideoCard({
  id,
  slug,
  title,
  thumbnailPath,
  durationSeconds,
  styles,
  levels,
}: VideoCardProps) {
  const thumbnailUrl = thumbnailPath
    ? getPublicUrl('thumbnails', thumbnailPath)
    : '/placeholder-video.jpg'

  return (
    <Link href={`/videos/${slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative aspect-video bg-muted">
          {thumbnailPath ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          {durationSeconds && (
            <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
              {formatDuration(durationSeconds)}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex flex-wrap gap-2">
            {styles.slice(0, 2).map((style) => (
              <Badge key={style.slug} variant="secondary" className="text-xs">
                {style.name}
              </Badge>
            ))}
            {levels.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {levels[0].name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

