-- ============================================
-- 1. TABEL ADMIN (Authentication & Authorization)
-- ============================================
-- SKIP FILE INI - Tabel admin_users sudah ada!
-- File ini hanya untuk dokumentasi dan function utilities

-- Tabel admin_users sudah ada dengan struktur:
-- CREATE TABLE IF NOT EXISTS admin_users (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   username VARCHAR(50) UNIQUE NOT NULL,
--   password_hash TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- ============================================
-- FUNCTION & TRIGGER UTILITIES
-- ============================================

-- Function untuk auto update timestamp (dipakai semua tabel)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk admin_users (jika belum ada)
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CATATAN PENTING: Row Level Security (RLS)
-- ============================================
-- Karena pakai custom authentication (bukan Supabase Auth),
-- RLS akan di-disable untuk semua tabel.
-- Authorization dilakukan di application layer (Next.js API).
--
-- Alternatif RLS:
-- 1. Gunakan service_role key di server-side
-- 2. Handle permission di API routes
-- 3. Validate session sebelum query database
