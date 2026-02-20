-- ============================================
-- 5. TABEL NEWS & EVENTS (Berita & Acara)
-- ============================================
-- Feature: News section - berita, acara, pengumuman
-- Admin dapat tambah, edit, delete berita/event

CREATE TABLE IF NOT EXISTS news_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(20) NOT NULL CHECK (category IN ('BERITA', 'ACARA', 'PENGUMUMAN')),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  image_path TEXT,
  thumbnail_url TEXT,
  event_date DATE,
  event_time_start TIME,
  event_time_end TIME,
  event_location VARCHAR(255),
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_news_category ON news_events(category);
CREATE INDEX idx_news_slug ON news_events(slug);
CREATE INDEX idx_news_published_at ON news_events(published_at DESC);
CREATE INDEX idx_news_is_featured ON news_events(is_featured);
CREATE INDEX idx_news_event_date ON news_events(event_date);

-- Function untuk auto-generate slug dari title
CREATE OR REPLACE FUNCTION generate_slug_from_title()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  NEW.slug := regexp_replace(NEW.slug, '^-+|-+$', '', 'g');
  -- Tambahkan random string jika slug sudah ada
  IF EXISTS (SELECT 1 FROM news_events WHERE slug = NEW.slug AND id != NEW.id) THEN
    NEW.slug := NEW.slug || '-' || substr(md5(random()::text), 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-generate slug
CREATE TRIGGER set_news_slug
  BEFORE INSERT OR UPDATE OF title ON news_events
  FOR EACH ROW
  EXECUTE FUNCTION generate_slug_from_title();

-- Trigger untuk auto update timestamp
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View untuk news yang published dengan informasi creator
CREATE OR REPLACE VIEW v_published_news AS
SELECT 
  ne.*,
  au.username as creator_username
FROM news_events ne
LEFT JOIN admin_users au ON ne.created_by = au.id
WHERE ne.is_published = true
ORDER BY ne.published_at DESC;

-- Insert data sample
INSERT INTO news_events (category, title, description, content, event_date) VALUES
  ('BERITA', 'Menyongsong Tahun 2026, BSI UII Tekankan Adopsi Kecerdasan Buatan', 
   'Badan Sistem Informasi (BSI) UII menggelar Kick-Off Meeting 2026 dengan tema "2026: Kompak, Serempak, Rampak" guna memperkuat sinergi...',
   'Konten lengkap berita di sini...', '2026-01-08'),
  ('ACARA', 'Waspada Ancaman Modern, BSI UII Gelar Pelatihan Secure Development',
   'Pelatihan intensif Secure Development bersama Ismail Hakim, CEO Cyberkarta, untuk membangun kesadaran keamanan aplikasi...',
   'Konten lengkap acara di sini...', '2025-12-11');

-- Note: Setup Supabase Storage Bucket untuk menyimpan gambar berita
-- Bucket name: news-images
-- Public access: true
