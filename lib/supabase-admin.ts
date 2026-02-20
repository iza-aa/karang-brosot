import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Admin client dengan service_role key - HANYA untuk server-side!
// Bypass RLS dan punya full access ke database
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper functions untuk common operations

export async function getActiveInfoboxStats() {
  const { data, error } = await supabaseAdmin
    .from('infobox_stats')
    .select('*')
    .eq('is_active', true)
    .single()
  
  if (error) throw error
  return data
}

export async function updateInfoboxStats(stats: Partial<Database['public']['Tables']['infobox_stats']['Update']>) {
  const { data, error } = await supabaseAdmin
    .from('infobox_stats')
    // @ts-expect-error - Supabase type issue with update
    .update(stats as any) // Type assertion untuk bypass Supabase type issue
    .eq('is_active', true)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getActiveAboutContents() {
  const { data, error } = await supabaseAdmin
    .from('about_contents')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) throw error
  return data
}

export async function getActiveGalleryPhotos() {
  const { data, error } = await supabaseAdmin
    .from('gallery_photos')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) throw error
  return data
}

export async function getPublishedNewsEvents() {
  const { data, error } = await supabaseAdmin
    .from('news_events')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getActiveHeroBanners() {
  const { data, error } = await supabaseAdmin
    .from('hero_banners')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) throw error
  return data
}

// Admin user authentication
export async function verifyAdminCredentials(username: string) {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('username', username)
    .single()
  
  if (error || !data) return null
  return data
}
