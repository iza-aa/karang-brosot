-- Organization Structures Table (Tabs)
CREATE TABLE IF NOT EXISTS org_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE org_structures ENABLE ROW LEVEL SECURITY;

-- Public can read active structures
CREATE POLICY "Public can view active org structures"
  ON org_structures FOR SELECT
  USING (is_active = true);

-- Admins can do everything (check if admins table exists first)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admins') THEN
    EXECUTE '
      CREATE POLICY "Admins can manage org structures"
        ON org_structures FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
          )
        )';
  ELSE
    -- Fallback: allow authenticated users (will be restricted later)
    EXECUTE '
      CREATE POLICY "Admins can manage org structures"
        ON org_structures FOR ALL
        USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_org_structures_order ON org_structures("order");
CREATE INDEX IF NOT EXISTS idx_org_structures_active ON org_structures(is_active);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_org_structures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_org_structures_updated_at
  BEFORE UPDATE ON org_structures
  FOR EACH ROW
  EXECUTE FUNCTION update_org_structures_updated_at();

-- Insert default structures
INSERT INTO org_structures (name, description, color, "order") VALUES
  ('Perangkat Desa', 'Struktur perangkat desa dan kepemimpinan', '#3B82F6', 1),
  ('RT/RW', 'Struktur Rukun Tetangga dan Rukun Warga', '#10B981', 2),
  ('PKK', 'Pemberdayaan Kesejahteraan Keluarga', '#F59E0B', 3)
ON CONFLICT DO NOTHING;
