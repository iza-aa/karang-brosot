-- ============================================
-- 4. TABEL GALLERY (Galeri Foto)
-- ============================================
-- Feature: Image gallery section
-- Admin dapat upload, edit, delete foto

CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  description TEXT,
  image_url TEXT NOT NULL,
  image_path TEXT,
  thumbnail_url TEXT,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_gallery_display_order ON gallery_photos(display_order);
CREATE INDEX idx_gallery_is_featured ON gallery_photos(is_featured);
CREATE INDEX idx_gallery_created_at ON gallery_photos(created_at DESC);

-- Trigger untuk auto update timestamp
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View untuk gallery dengan informasi uploader
CREATE OR REPLACE VIEW v_gallery_with_uploader AS
SELECT 
  gp.*,
  au.username as uploader_username
FROM gallery_photos gp
LEFT JOIN admin_users au ON gp.uploaded_by = au.id
WHERE gp.is_active = true
ORDER BY gp.display_order, gp.created_at DESC;

-- Note: Setup Supabase Storage Bucket untuk menyimpan file foto
-- Bucket name: gallery-photos
-- Public access: true (atau false jika ingin private)
