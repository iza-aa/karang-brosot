-- Organization Members Table
CREATE TABLE IF NOT EXISTS org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id UUID NOT NULL REFERENCES org_structures(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES org_members(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  role TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0,
  "order" INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT,
  description TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

-- Public can read active members
CREATE POLICY "Public can view active org members"
  ON org_members FOR SELECT
  USING (is_active = true);

-- Admins can do everything (check if admins table exists first)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admins') THEN
    EXECUTE '
      CREATE POLICY "Admins can manage org members"
        ON org_members FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
          )
        )';
  ELSE
    -- Fallback: allow authenticated users (will be restricted later)
    EXECUTE '
      CREATE POLICY "Admins can manage org members"
        ON org_members FOR ALL
        USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_members_structure ON org_members(structure_id);
CREATE INDEX IF NOT EXISTS idx_org_members_parent ON org_members(parent_id);
CREATE INDEX IF NOT EXISTS idx_org_members_level ON org_members(level);
CREATE INDEX IF NOT EXISTS idx_org_members_order ON org_members("order");
CREATE INDEX IF NOT EXISTS idx_org_members_active ON org_members(is_active);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_org_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_org_members_updated_at
  BEFORE UPDATE ON org_members
  FOR EACH ROW
  EXECUTE FUNCTION update_org_members_updated_at();

-- Function to automatically set level based on parent
CREATE OR REPLACE FUNCTION set_org_member_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.level = 0;
  ELSE
    SELECT level + 1 INTO NEW.level
    FROM org_members
    WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_org_member_level
  BEFORE INSERT OR UPDATE OF parent_id ON org_members
  FOR EACH ROW
  EXECUTE FUNCTION set_org_member_level();

-- Sample data for Perangkat Desa
DO $$
DECLARE
  perangkat_struktur_id UUID;
  dukuh_id UUID;
BEGIN
  -- Get Perangkat Desa structure ID
  SELECT id INTO perangkat_struktur_id FROM org_structures WHERE name = 'Perangkat Desa' LIMIT 1;
  
  IF perangkat_struktur_id IS NOT NULL THEN
    -- Insert Dukuh (Level 0 - Root)
    INSERT INTO org_members (
      structure_id, parent_id, name, position, role, level, "order"
    ) VALUES (
      perangkat_struktur_id, NULL, 'Sutrisno', 'Dukuh Padukuhan Karangbrosot', 'Kepala Dukuh', 0, 1
    ) RETURNING id INTO dukuh_id;
    
    -- Insert Staff Level 1
    INSERT INTO org_members (
      structure_id, parent_id, name, position, role, level, "order"
    ) VALUES 
      (perangkat_struktur_id, dukuh_id, 'Siti Aminah', 'Sekretaris Dukuh', 'Staf', 1, 1),
      (perangkat_struktur_id, dukuh_id, 'Budi Santoso', 'Bendahara', 'Staf', 1, 2),
      (perangkat_struktur_id, dukuh_id, 'Ahmad Yani', 'Koordinator Keamanan', 'Staf', 1, 3);
  END IF;
END $$;
