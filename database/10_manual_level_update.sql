-- Update trigger to handle manual_level
-- This trigger prioritizes manual_level over auto-calculated level

DROP TRIGGER IF EXISTS trigger_set_org_member_level ON org_members;
DROP FUNCTION IF EXISTS set_org_member_level();

-- Updated function to handle manual_level
CREATE OR REPLACE FUNCTION set_org_member_level()
RETURNS TRIGGER AS $$
BEGIN
  -- If manual_level is set, use it
  IF NEW.manual_level IS NOT NULL THEN
    NEW.level = NEW.manual_level;
  -- Otherwise, auto-calculate from parent
  ELSIF NEW.parent_id IS NULL THEN
    NEW.level = 0;
  ELSE
    SELECT level + 1 INTO NEW.level
    FROM org_members
    WHERE id = NEW.parent_id;
    
    -- If parent not found, default to 0
    IF NEW.level IS NULL THEN
      NEW.level = 0;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER trigger_set_org_member_level
  BEFORE INSERT OR UPDATE OF parent_id, manual_level ON org_members
  FOR EACH ROW
  EXECUTE FUNCTION set_org_member_level();

-- Add comment
COMMENT ON FUNCTION set_org_member_level() IS 
'Automatically sets the level field based on manual_level (if set) or parent relationship';
