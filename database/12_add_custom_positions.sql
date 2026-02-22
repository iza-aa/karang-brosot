-- Add custom x,y position fields to org_members table
-- This allows manual positioning of org chart nodes

ALTER TABLE public.org_members 
ADD COLUMN IF NOT EXISTS custom_x NUMERIC,
ADD COLUMN IF NOT EXISTS custom_y NUMERIC,
ADD COLUMN IF NOT EXISTS use_custom_layout BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN public.org_members.custom_x IS 'Custom X coordinate for manual node positioning';
COMMENT ON COLUMN public.org_members.custom_y IS 'Custom Y coordinate for manual node positioning';
COMMENT ON COLUMN public.org_members.use_custom_layout IS 'Whether to use custom layout positioning or auto layout';
