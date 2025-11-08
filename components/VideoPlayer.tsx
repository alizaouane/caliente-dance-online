'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface VideoPlayerProps {
  videoUrl: string | null
  previewUrl: string | null
  hasSubscription: boolean
  thumbnailUrl: string | null
}

export function VideoPlayer({
  videoUrl,
  previewUrl,
  hasSubscription,
  thumbnailUrl,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [showPreviewCTA, setShowPreviewCTA] = useState(false)

  useEffect(() => {
    if (videoRef.current && (videoUrl || previewUrl)) {
      const video = videoRef.current
      
      if (hasSubscription && videoUrl) {
        video.src = videoUrl
      } else if (previewUrl) {
        video.src = previewUrl
        video.addEventListener('timeupdate', () => {
          if (video.currentTime >= 30) {
            video.pause()
            setShowPreviewCTA(true)
          }
        })
      }
    }
  }, [videoUrl, previewUrl, hasSubscription])

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setPlaying(true)
    }
  }

  if (!hasSubscription && !previewUrl) {
    return (
      <Card className="aspect-video bg-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="w-16 h-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Subscribe to Watch</h3>
            <p className="text-muted-foreground mb-4">
              This video is available to subscribers only.
            </p>
            <Link href="/pricing">
              <Button>View Pricing</Button>
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        {!playing && thumbnailUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={thumbnailUrl}
              alt="Video thumbnail"
              fill
              className="object-cover opacity-50"
            />
            <Button
              size="lg"
              onClick={handlePlay}
              className="relative z-10"
            >
              <Play className="w-6 h-6 mr-2" />
              Play
            </Button>
          </div>
        )}
        {showPreviewCTA && !hasSubscription && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-20">
            <div className="text-center space-y-4 p-6">
              <Lock className="w-12 h-12 mx-auto text-white" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Preview Ended
                </h3>
                <p className="text-white/80 mb-4">
                  Subscribe to watch the full video and access our entire library.
                </p>
                <Link href="/pricing">
                  <Button size="lg">Subscribe Now</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

