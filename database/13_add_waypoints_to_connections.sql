-- Add waypoints column to org_connections table
-- This stores custom path waypoints for draggable connections

ALTER TABLE public.org_connections
ADD COLUMN IF NOT EXISTS waypoints JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.org_connections.waypoints IS 'Array of waypoint coordinates [{x: number, y: number}] for custom connection paths';
