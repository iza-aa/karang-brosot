-- ============================================
-- 14b. UMKM - Remove Kategori Constraint
-- ============================================
-- Migration script to allow free-form kategori input by admin
-- Remove CHECK constraint and make kategori a simple VARCHAR field

-- Drop the existing CHECK constraint
ALTER TABLE umkm DROP CONSTRAINT IF EXISTS umkm_kategori_check;

-- Modify kategori column to VARCHAR without constraints
-- (Already VARCHAR(50), just ensuring no constraint)
ALTER TABLE umkm ALTER COLUMN kategori TYPE VARCHAR(100);
ALTER TABLE umkm ALTER COLUMN kategori SET NOT NULL;

-- Update existing data if needed (optional - keep existing kategori values)
-- No changes needed to existing data

-- Note: Index idx_umkm_kategori already exists and will continue to work
