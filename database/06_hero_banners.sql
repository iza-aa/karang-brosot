-- ============================================
-- 6. TABEL HERO SECTION (Banner/Slider)
-- ============================================
-- Feature: Hero banner di halaman profil
-- Bisa dibuat multiple untuk slider

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
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_hero_display_order ON hero_banners(display_order);

-- Trigger untuk auto update timestamp
CREATE TRIGGER update_hero_updated_at BEFORE UPDATE ON hero_banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert data awal
INSERT INTO hero_banners (title, subtitle, description, display_order) VALUES
  ('Pedukuhan Karang Brosot', 
   'Desa Wisata yang Asri dan Berbudaya',
   'Terletak di jantung Yogyakarta, Karang Brosot merupakan pedukuhan dengan kearifan lokal yang masih terjaga',
   1);
