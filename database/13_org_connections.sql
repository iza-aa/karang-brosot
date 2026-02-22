-- Create org_connections table to store visual connections between nodes
-- This allows manual connection drawing separate from hierarchical parent-child relationships

CREATE TABLE IF NOT EXISTS org_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  structure_id UUID NOT NULL REFERENCES org_structures(id) ON DELETE CASCADE,
  from_member_id UUID NOT NULL REFERENCES org_members(id) ON DELETE CASCADE,
  to_member_id UUID NOT NULL REFERENCES org_members(id) ON DELETE CASCADE,
  connection_type VARCHAR(50) DEFAULT 'solid', -- solid, dashed, dotted
  color VARCHAR(20) DEFAULT '#000000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(structure_id, from_member_id, to_member_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_org_connections_structure ON org_connections(structure_id);
CREATE INDEX IF NOT EXISTS idx_org_connections_from ON org_connections(from_member_id);
CREATE INDEX IF NOT EXISTS idx_org_connections_to ON org_connections(to_member_id);

-- Enable RLS
ALTER TABLE org_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to read connections
CREATE POLICY "Public can view org connections"
  ON org_connections FOR SELECT
  USING (true);

-- Admins can do everything (check if admins table exists first)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admins') THEN
    EXECUTE '
      CREATE POLICY "Admins can manage org connections"
        ON org_connections FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
          )
        )';
  ELSE
    -- Fallback: allow authenticated users (will be restricted at API layer)
    EXECUTE '
      CREATE POLICY "Admins can manage org connections"
        ON org_connections FOR ALL
        USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- Add trigger to update updated_at
CREATE TRIGGER trigger_update_org_connections_updated_at
  BEFORE UPDATE ON org_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
