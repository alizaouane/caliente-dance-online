/**
 * Seed script for Caliente Dance Online
 * 
 * This script creates default styles and levels in the database.
 * Run with: npm run seed
 * 
 * Make sure to set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seed() {
  console.log('🌱 Starting seed...')

  // Seed Dance Styles
  const styles = [
    { name: 'Salsa', slug: 'salsa', position: 0 },
    { name: 'Bachata', slug: 'bachata', position: 1 },
    { name: 'Kizomba', slug: 'kizomba', position: 2 },
  ]

  console.log('📝 Seeding dance styles...')
  for (const style of styles) {
    const { data, error } = await supabase
      .from('styles')
      .upsert(style, { onConflict: 'slug' })
      .select()
      .single()

    if (error) {
      console.error(`Error seeding style ${style.name}:`, error.message)
    } else {
      console.log(`  ✓ ${style.name}`)
    }
  }

  // Seed Levels
  const levels = [
    { name: 'Beginner', position: 0 },
    { name: 'Intermediate', position: 1 },
    { name: 'Advanced', position: 2 },
  ]

  console.log('📝 Seeding levels...')
  for (const level of levels) {
    const { data, error } = await supabase
      .from('levels')
      .upsert(level, { onConflict: 'name' })
      .select()
      .single()

    if (error) {
      console.error(`Error seeding level ${level.name}:`, error.message)
    } else {
      console.log(`  ✓ ${level.name}`)
    }
  }

  console.log('✅ Seed completed!')
  console.log('\n📌 Next steps:')
  console.log('  1. Create an admin user by updating profiles.role = "admin" in Supabase')
  console.log('  2. Set up Stripe products and price IDs')
  console.log('  3. Configure Supabase Storage buckets (videos, thumbnails, previews)')
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})

