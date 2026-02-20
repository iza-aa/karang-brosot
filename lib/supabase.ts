import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client untuk public access (read-only di frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types berdasarkan schema
export type AdminUser = {
  id: string
  username: string
  password_hash: string
  created_at: string
  updated_at: string
}

export type InfoboxStats = {
  id: string
  luas_wilayah: string
  kartu_keluarga: string
  total_penduduk: string
  rt_rw: string
  fasilitas_umum: string
  fasilitas_umum_detail: string | null
  organisasi_aktif: string
  organisasi_aktif_detail: string | null
  is_active: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type AboutContent = {
  id: string
  card_type: 'ultra_thin' | 'thin' | 'regular'
  title: string
  description: string | null
  content: string
  display_order: number
  is_active: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type GalleryPhoto = {
  id: string
  title: string | null
  description: string | null
  image_url: string
  image_path: string | null
  thumbnail_url: string | null
  alt_text: string | null
  display_order: number
  is_featured: boolean
  is_active: boolean
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export type NewsEvent = {
  id: string
  category: 'BERITA' | 'ACARA' | 'PENGUMUMAN'
  title: string
  slug: string
  description: string | null
  content: string
  image_url: string | null
  image_path: string | null
  thumbnail_url: string | null
  event_date: string | null
  event_time_start: string | null
  event_time_end: string | null
  event_location: string | null
  is_published: boolean
  is_featured: boolean
  views_count: number
  published_at: string
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type HeroBanner = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  image_url: string | null
  image_path: string | null
  button_text: string | null
  button_link: string | null
  display_order: number
  is_active: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type OrgStructure = {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type OrgMember = {
  id: string
  structure_id: string
  parent_id: string | null
  name: string
  position: string
  role: string
  level: number
  order: number
  photo_url: string | null
  description: string | null
  phone: string | null
  email: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Database type definition
export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: AdminUser
        Insert: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>>
      }
      infobox_stats: {
        Row: InfoboxStats
        Insert: Omit<InfoboxStats, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<InfoboxStats, 'id' | 'created_at' | 'updated_at'>>
      }
      about_contents: {
        Row: AboutContent
        Insert: Omit<AboutContent, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<AboutContent, 'id' | 'created_at' | 'updated_at'>>
      }
      gallery_photos: {
        Row: GalleryPhoto
        Insert: Omit<GalleryPhoto, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<GalleryPhoto, 'id' | 'created_at' | 'updated_at'>>
      }
      news_events: {
        Row: NewsEvent
        Insert: Omit<NewsEvent, 'id' | 'created_at' | 'updated_at' | 'slug'>
        Update: Partial<Omit<NewsEvent, 'id' | 'created_at' | 'updated_at' | 'slug'>>
      }
      hero_banners: {
        Row: HeroBanner
        Insert: Omit<HeroBanner, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<HeroBanner, 'id' | 'created_at' | 'updated_at'>>
      }

      org_structures: {
        Row: OrgStructure
        Insert: Omit<OrgStructure, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<OrgStructure, 'id' | 'created_at' | 'updated_at'>>
      }

      org_members: {
        Row: OrgMember
        Insert: Omit<OrgMember, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<OrgMember, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}