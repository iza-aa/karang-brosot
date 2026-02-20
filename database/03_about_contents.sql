-- ============================================
-- 3. TABEL ABOUT (Konten Informasi)
-- ============================================
-- Feature: Kartu konten di about section
-- 3 card dengan variant: ultra_thin, thin, regular

CREATE TABLE IF NOT EXISTS about_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('ultra_thin', 'thin', 'regular')),
  title VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_about_card_type ON about_contents(card_type);
CREATE INDEX idx_about_display_order ON about_contents(display_order);

-- Trigger untuk auto update timestamp
CREATE TRIGGER update_about_updated_at BEFORE UPDATE ON about_contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert data awal (sesuaikan dengan kebutuhan)
INSERT INTO about_contents (card_type, title, description, content, display_order) VALUES
  ('ultra_thin', 'Sejarah Singkat', 'Perjalanan sejarah Pedukuhan Karang Brosot', 
   'Pedukuhan Karang Brosot memiliki sejarah panjang yang kaya akan budaya dan tradisi masyarakat Yogyakarta.', 1),
  ('thin', 'Visi & Misi', 'Tujuan dan cita-cita bersama', 
   'Membangun masyarakat yang sejahtera, mandiri, dan berbudaya dengan gotong royong sebagai landasan utama.', 2),
  ('regular', 'Struktur Organisasi', 'Susunan pemerintahan desa', 
   'Pedukuhan Karang Brosot dipimpin oleh Dukuh dan dibantu oleh perangkat desa serta tokoh masyarakat.', 3);
