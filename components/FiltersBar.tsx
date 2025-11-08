'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface FiltersBarProps {
  styles: Array<{ id: string; name: string; slug: string }>
  levels: Array<{ id: string; name: string }>
}

export function FiltersBar({ styles, levels }: FiltersBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [styleId, setStyleId] = useState(searchParams.get('style') || '')
  const [levelId, setLevelId] = useState(searchParams.get('level') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    router.push(`/videos?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ q: search, style: styleId, level: levelId, sort })
  }

  const clearFilters = () => {
    setSearch('')
    setStyleId('')
    setLevelId('')
    setSort('newest')
    router.push('/videos')
  }

  const hasFilters = search || styleId || levelId || sort !== 'newest'

  return (
    <div className="space-y-4 mb-8">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={styleId} onValueChange={(value) => {
          setStyleId(value)
          updateFilters({ style: value, level: levelId, sort })
        }}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Styles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Styles</SelectItem>
            {styles.map((style) => (
              <SelectItem key={style.id} value={style.id}>
                {style.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={levelId} onValueChange={(value) => {
          setLevelId(value)
          updateFilters({ style: styleId, level: value, sort })
        }}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(value) => {
          setSort(value)
          updateFilters({ style: styleId, level: levelId, sort: value })
        }}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Search</Button>
        {hasFilters && (
          <Button type="button" variant="outline" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </form>
    </div>
  )
}

