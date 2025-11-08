export type SortOption = 'newest' | 'popular' | 'duration'

export interface VideoFilters {
  styleId?: string
  levelId?: string
  sort?: SortOption
  search?: string
}

export function buildVideoQuery(filters: VideoFilters) {
  let query = `
    select 
      v.*,
      coalesce(json_agg(distinct jsonb_build_object('id', s.id, 'name', s.name, 'slug', s.slug)) filter (where s.id is not null), '[]') as styles,
      coalesce(json_agg(distinct jsonb_build_object('id', l.id, 'name', l.name)) filter (where l.id is not null), '[]') as levels,
      count(distinct vv.id) as view_count
    from videos v
    left join video_styles vs on v.id = vs.video_id
    left join styles s on vs.style_id = s.id
    left join video_levels vl on v.id = vl.video_id
    left join levels l on vl.level_id = l.id
    left join video_views vv on v.id = vv.video_id
    where v.published = true
  `

  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (filters.styleId) {
    conditions.push(`exists (select 1 from video_styles where video_id = v.id and style_id = $${paramIndex})`)
    params.push(filters.styleId)
    paramIndex++
  }

  if (filters.levelId) {
    conditions.push(`exists (select 1 from video_levels where video_id = v.id and level_id = $${paramIndex})`)
    params.push(filters.levelId)
    paramIndex++
  }

  if (filters.search) {
    conditions.push(`(v.title ilike $${paramIndex} or v.description ilike $${paramIndex})`)
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  if (conditions.length > 0) {
    query += ' and ' + conditions.join(' and ')
  }

  query += ' group by v.id'

  // Sorting
  switch (filters.sort) {
    case 'popular':
      query += ' order by view_count desc, v.created_at desc'
      break
    case 'duration':
      query += ' order by v.duration_seconds asc, v.created_at desc'
      break
    case 'newest':
    default:
      query += ' order by v.created_at desc'
  }

  return { query, params }
}

