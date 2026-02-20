-- ============================================
-- KARANG BROSOT - DATABASE SCHEMA
-- ============================================
-- Supabase SQL Schema untuk Website Pedukuhan Karang Brosot
-- Jalankan setiap section sesuai kebutuhan feature
-- ============================================

-- ============================================
-- 1. TABEL ADMIN (Authentication & Authorization)
-- ============================================
-- Untuk menyimpan data admin yang dapat login
-- Hubungkan dengan Supabase Auth

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk query yang lebih cepat
CREATE INDEX idx_admins_user_id ON admins(user_id);
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_email ON admins(email);

-- Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Admin hanya bisa melihat data mereka sendiri
CREATE POLICY "Admins can view their own data"
  ON admins FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Super admin bisa melihat semua admin
CREATE POLICY "Super admins can view all admins"
  ON admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================
-- 2. TABEL INFOBOX (Statistik Pedukuhan)
-- ============================================
-- Untuk menyimpan data statistik yang ditampilkan di card

CREATE TABLE IF NOT EXISTS infobox_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  luas_wilayah VARCHAR(50) NOT NULL DEFAULT '0 km²',
  kartu_keluarga VARCHAR(50) NOT NULL DEFAULT '0',
  total_penduduk VARCHAR(50) NOT NULL DEFAULT '0',
  rt_rw VARCHAR(50) NOT NULL DEFAULT '0 / 0',
  fasilitas_umum VARCHAR(50) NOT NULL DEFAULT '0',
  fasilitas_umum_detail TEXT,
  organisasi_aktif VARCHAR(50) NOT NULL DEFAULT '0',
  organisasi_aktif_detail TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hanya 1 record aktif yang digunakan
CREATE UNIQUE INDEX idx_infobox_active ON infobox_stats(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE infobox_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa melihat statistik
CREATE POLICY "Anyone can view active infobox stats"
  ON infobox_stats FOR SELECT
  USING (is_active = true);

-- Policy: Admin bisa update
CREATE POLICY "Admins can update infobox stats"
  ON infobox_stats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Insert data awal
INSERT INTO infobox_stats (
  luas_wilayah,
  kartu_keluarga,
  total_penduduk,
  rt_rw,
  fasilitas_umum,
  fasilitas_umum_detail,
  organisasi_aktif,
  organisasi_aktif_detail
) VALUES (
  '1,234 km²',
  '34',
  '190',
  '30 / 22',
  '5',
  'Masjid, Mushola, Balai, dan Poskamling',
  '3',
  'Taruna Bakti, PKK, dan Kelompok Tani'
);

-- ============================================
-- 3. TABEL ABOUT (Konten Informasi)
-- ============================================
-- Untuk menyimpan konten card di about section

CREATE TABLE IF NOT EXISTS about_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('ultra_thin', 'thin', 'regular')),
  title VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_about_card_type ON about_contents(card_type);
CREATE INDEX idx_about_display_order ON about_contents(display_order);

-- RLS
ALTER TABLE about_contents ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa melihat konten aktif
CREATE POLICY "Anyone can view active about contents"
  ON about_contents FOR SELECT
  USING (is_active = true);

-- Policy: Admin bisa CRUD
CREATE POLICY "Admins can manage about contents"
  ON about_contents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Insert data awal
INSERT INTO about_contents (card_type, title, description, content, display_order) VALUES
  ('ultra_thin', 'Sejarah Singkat', 'Perjalanan sejarah Pedukuhan Karang Brosot', 'Pedukuhan Karang Brosot memiliki sejarah panjang yang kaya akan budaya dan tradisi masyarakat Yogyakarta.', 1),
  ('thin', 'Visi & Misi', 'Tujuan dan cita-cita bersama', 'Membangun masyarakat yang sejahtera, mandiri, dan berbudaya dengan gotong royong sebagai landasan utama.', 2),
  ('regular', 'Struktur Organisasi', 'Susunan pemerintahan desa', 'Pedukuhan Karang Brosot dipimpin oleh Dukuh dan dibantu oleh perangkat desa serta tokoh masyarakat.', 3);

-- ============================================
-- 4. TABEL GALLERY (Galeri Foto)
-- ============================================
-- Untuk menyimpan foto-foto galeri

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
  uploaded_by UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_gallery_display_order ON gallery_photos(display_order);
CREATE INDEX idx_gallery_is_featured ON gallery_photos(is_featured);
CREATE INDEX idx_gallery_created_at ON gallery_photos(created_at DESC);

-- RLS
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa melihat foto aktif
CREATE POLICY "Anyone can view active gallery photos"
  ON gallery_photos FOR SELECT
  USING (is_active = true);

-- Policy: Admin bisa CRUD
CREATE POLICY "Admins can manage gallery photos"
  ON gallery_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ============================================
-- 5. TABEL NEWS & EVENTS (Berita & Acara)
-- ============================================
-- Untuk menyimpan berita dan event

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
  created_by UUID REFERENCES admins(id),
  updated_by UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_news_category ON news_events(category);
CREATE INDEX idx_news_slug ON news_events(slug);
CREATE INDEX idx_news_published_at ON news_events(published_at DESC);
CREATE INDEX idx_news_is_featured ON news_events(is_featured);
CREATE INDEX idx_news_event_date ON news_events(event_date);

-- RLS
ALTER TABLE news_events ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa melihat berita/event yang published
CREATE POLICY "Anyone can view published news and events"
  ON news_events FOR SELECT
  USING (is_published = true);

-- Policy: Admin bisa CRUD
CREATE POLICY "Admins can manage news and events"
  ON news_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Function untuk auto-generate slug
CREATE OR REPLACE FUNCTION generate_slug_from_title()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  NEW.slug := regexp_replace(NEW.slug, '^-+|-+$', '', 'g');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-generate slug
CREATE TRIGGER set_news_slug
  BEFORE INSERT OR UPDATE OF title ON news_events
  FOR EACH ROW
  EXECUTE FUNCTION generate_slug_from_title();

-- Insert data sample berita
INSERT INTO news_events (category, title, description, content, event_date) VALUES
  ('BERITA', 'Menyongsong Tahun 2026, BSI UII Tekankan Adopsi Kecerdasan Buatan', 
   'Badan Sistem Informasi (BSI) UII menggelar Kick-Off Meeting 2026 dengan tema "2026: Kompak, Serempak, Rampak" guna memperkuat sinergi...',
   'Konten lengkap berita...', '2026-01-08'),
  ('ACARA', 'Waspada Ancaman Modern, BSI UII Gelar Pelatihan Secure Development',
   'Pelatihan intensif Secure Development bersama Ismail Hakim, CEO Cyberkarta, untuk membangun kesadaran keamanan aplikasi...',
   'Konten lengkap acara...', '2025-12-11');

-- ============================================
-- 6. TABEL HERO SECTION (Banner/Slider)
-- ============================================
-- Untuk menyimpan data hero banner di halaman profil

CREATE TABLE IF NOT EXISTS hero_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  image_path TEXT,
  button_text VARCHAR(50),
  button_link VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admins(id),
  updated_by UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_hero_display_order ON hero_banners(display_order);

-- RLS
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa melihat banner aktif
CREATE POLICY "Anyone can view active hero banners"
  ON hero_banners FOR SELECT
  USING (is_active = true);

-- Policy: Admin bisa CRUD
CREATE POLICY "Admins can manage hero banners"
  ON hero_banners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Insert data awal
INSERT INTO hero_banners (title, subtitle, description, display_order) VALUES
  ('Pedukuhan Karang Brosot', 
   'Desa Wisata yang Asri dan Berbudaya',
   'Terletak di jantung Yogyakarta, Karang Brosot merupakan pedukuhan dengan kearifan lokal yang masih terjaga',
   1);

-- ============================================
-- 7. FUNCTION UPDATE TIMESTAMP
-- ============================================
-- Auto update timestamp saat record diupdate

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Terapkan trigger ke semua tabel
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_infobox_updated_at BEFORE UPDATE ON infobox_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_updated_at BEFORE UPDATE ON about_contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_updated_at BEFORE UPDATE ON hero_banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. VIEWS (Optional - untuk query lebih mudah)
-- ============================================

-- View untuk news yang published dengan informasi creator
CREATE OR REPLACE VIEW v_published_news AS
SELECT 
  ne.*,
  a.full_name as creator_name,
  a.username as creator_username
FROM news_events ne
LEFT JOIN admins a ON ne.created_by = a.id
WHERE ne.is_published = true
ORDER BY ne.published_at DESC;

-- View untuk gallery dengan informasi uploader
CREATE OR REPLACE VIEW v_gallery_with_uploader AS
SELECT 
  gp.*,
  a.full_name as uploader_name,
  a.username as uploader_username
FROM gallery_photos gp
LEFT JOIN admins a ON gp.uploaded_by = a.id
WHERE gp.is_active = true
ORDER BY gp.display_order, gp.created_at DESC;

-- ============================================
-- SELESAI!
-- ============================================
-- Cara Penggunaan:
-- 1. Copy seluruh file ini atau per section sesuai kebutuhan
-- 2. Buka Supabase Dashboard > SQL Editor
-- 3. Paste dan Run SQL
-- 4. Untuk RLS, pastikan sudah setup Supabase Auth terlebih dahulu
-- 5. Test koneksi dari aplikasi Next.js
-- ============================================
