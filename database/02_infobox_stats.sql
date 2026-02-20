-- ============================================
-- 2. TABEL INFOBOX (Statistik Pedukuhan)
-- ============================================
-- Feature: Kartu statistik di halaman profil
-- Data: Luas Wilayah, KK, Penduduk, RT/RW, Fasilitas, Organisasi

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
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hanya 1 record aktif yang digunakan
CREATE UNIQUE INDEX idx_infobox_active ON infobox_stats(is_active) WHERE is_active = true;

-- Trigger untuk auto update timestamp
CREATE TRIGGER update_infobox_updated_at BEFORE UPDATE ON infobox_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
