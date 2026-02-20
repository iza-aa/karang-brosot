# Database Setup untuk Kelembagaan

## Quick Start - Run Migrations di Supabase

### Option 1: Via Supabase Dashboard (Recommended)

1. Buka **Supabase Dashboard** → Pilih project Anda
2. Klik **SQL Editor** di sidebar kiri
3. Klik **New Query**

#### Step 1: Run org_structures migration
Copy-paste isi file `database/08_org_structures.sql` → klik **Run**

#### Step 2: Run org_members migration  
Copy-paste isi file `database/09_org_members.sql` → klik **Run**

✅ Done! Tables sudah siap.

---

### Option 2: Via Supabase CLI

```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login
supabase login

# Link ke project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push

# Atau run individual files
psql $DATABASE_URL < database/08_org_structures.sql
psql $DATABASE_URL < database/09_org_members.sql
```

---

## Verify Setup

Cek di Supabase Dashboard → **Table Editor**:

### Tables Created:
- ✅ `org_structures` - Struktur organisasi (tabs)
- ✅ `org_members` - Anggota organisasi

### Sample Data Inserted:
- **Perangkat Desa** (dengan beberapa anggota)
- **RT/RW** (kosong)
- **PKK** (kosong)

---

## Test di Browser

1. Buka aplikasi: `http://localhost:3000`
2. Navigate ke: `/kelembagaan`
3. Anda akan melihat:
   - 3 tabs: Perangkat Desa, RT/RW, PKK
   - Tab "Perangkat Desa" sudah ada struktur sampel
   - Tab lainnya masih kosong

---

## Troubleshooting

### Error: "relation admins does not exist"
✅ **Fixed!** SQL files sudah updated untuk handle ini. Aman di-run sebelum admins table exists.

### RLS Policy Issues
Jika Anda sudah punya admins table:
```sql
-- Drop old policy
DROP POLICY IF EXISTS "Admins can manage org structures" ON org_structures;
DROP POLICY IF EXISTS "Admins can manage org members" ON org_members;

-- Run the migration files again
```

### Can't Add/Edit (Admin Mode)
- Pastikan Anda sudah login sebagai admin
- Jika belum ada admin table, sementara semua authenticated users bisa edit
- Nanti setelah admin table ada, hanya admin yang bisa edit

---

## Next Steps

1. ✅ Run migrations
2. ✅ Test di browser
3. ✅ Login sebagai admin
4. ✅ Tambah struktur & anggota baru
5. 🎨 Customize colors & content

Happy coding! 🚀
