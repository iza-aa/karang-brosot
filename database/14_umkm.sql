-- ============================================
-- 14. TABEL UMKM (Usaha Mikro Kecil Menengah)
-- ============================================
-- Feature: UMKM directory untuk padukuhan
-- Admin dapat tambah, edit, delete UMKM

CREATE TABLE IF NOT EXISTS umkm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_usaha VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  kategori VARCHAR(50) NOT NULL CHECK (kategori IN ('KULINER', 'KERAJINAN', 'PETERNAKAN')),
  deskripsi TEXT,
  
  -- Informasi Pemilik
  nama_pemilik VARCHAR(255) NOT NULL,
  nomor_telepon VARCHAR(20),
  email VARCHAR(255),
  alamat TEXT,
  
  -- Media
  foto_url TEXT,
  foto_path TEXT,
  
  -- Kontak & Sosmed
  whatsapp VARCHAR(20),
  instagram VARCHAR(100),
  
  -- Operasional
  jam_operasional VARCHAR(100),
  harga_range VARCHAR(50),
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  tahun_berdiri INTEGER,
  
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_umkm_kategori ON umkm(kategori);
CREATE INDEX idx_umkm_slug ON umkm(slug);
CREATE INDEX idx_umkm_is_active ON umkm(is_active);
CREATE INDEX idx_umkm_is_featured ON umkm(is_featured);

-- Function untuk auto-generate slug dari nama usaha
CREATE OR REPLACE FUNCTION generate_umkm_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := lower(regexp_replace(NEW.nama_usaha, '[^a-zA-Z0-9]+', '-', 'g'));
  NEW.slug := regexp_replace(NEW.slug, '^-+|-+$', '', 'g');
  -- Tambahkan random string jika slug sudah ada
  IF EXISTS (SELECT 1 FROM umkm WHERE slug = NEW.slug AND id != NEW.id) THEN
    NEW.slug := NEW.slug || '-' || substr(md5(random()::text), 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-generate slug
CREATE TRIGGER set_umkm_slug
  BEFORE INSERT OR UPDATE OF nama_usaha ON umkm
  FOR EACH ROW
  EXECUTE FUNCTION generate_umkm_slug();

-- Trigger untuk auto update timestamp
CREATE TRIGGER update_umkm_updated_at BEFORE UPDATE ON umkm
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert data sample
INSERT INTO umkm (
  nama_usaha, kategori, deskripsi, nama_pemilik, nomor_telepon, 
  alamat, jam_operasional, harga_range, tahun_berdiri
) VALUES
  (
    'Warung Bu Tini', 
    'KULINER', 
    'Menyediakan nasi goreng, mie goreng, dan aneka minuman segar',
    'Tini Susanti',
    '081234567890',
    'RT 02 RW 01, Karang Brosot',
    '08:00 - 20:00',
    'Rp 10.000 - Rp 25.000',
    2020
  ),
  (
    'Kerajinan Bambu Pak Joko',
    'KERAJINAN',
    'Produksi berbagai kerajinan dari bambu seperti anyaman, furniture, dan dekorasi',
    'Joko Santoso',
    '081234567891',
    'RT 03 RW 02, Karang Brosot',
    '08:00 - 17:00',
    'Rp 50.000 - Rp 500.000',
    2018
  ),
  (
    'Peternakan Ayam Bu Sari',
    'PETERNAKAN',
    'Peternakan ayam kampung dan jual telur segar setiap hari',
    'Sari Wulandari',
    '081234567892',
    'RT 01 RW 01, Karang Brosot',
    '06:00 - 18:00',
    'Rp 35.000 - Rp 150.000',
    2019
  );

-- Note: Setup Supabase Storage Bucket untuk menyimpan foto UMKM
-- Bucket name: photos
-- Folder: umkm/
-- Public access: true
