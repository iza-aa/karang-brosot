# Quick Start Guide - Supabase Integration

## 🎯 Ringkasan
Implementasi Supabase untuk backend Karang Brosot website sudah selesai! Berikut cara menggunakannya.

---

## ⚡ Quick Setup (5 Menit)

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js bcryptjs
npm install -D @types/bcryptjs
```

### 2. Setup Environment
```bash
# Copy template
cp .env.local.example .env.local

# Edit .env.local dengan credentials Supabase Anda
```

### 3. Setup Database
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Buka **SQL Editor**
3. Copy paste & run SQL files dari folder `database/`:
   - ✅ `01_admins.sql` (bagian FUNCTION & TRIGGER saja)
   - ✅ `02_infobox_stats.sql` (ini yang penting untuk testing)
   - Lainnya opsional (bisa dijalankan nanti)

### 4. Test!
```bash
npm run dev

# Test 1: Login
# http://localhost:3000/login
# Username: adminkarang
# Password: brosotadmin1945

# Test 2: Lihat data
# http://localhost:3000/profil
# Data statistik sekarang dari database!

# Test 3: Edit data
# Klik "Edit Infobox" → ubah values → Save
# Refresh page → data berubah!
```

---

## 📊 Yang Sudah Jalan

### ✅ Feature Complete
1. **Admin Login** - Berfungsi 100%
2. **Infobox Stats** - Read & Update dari DB
3. **API Routes** - Semua endpoint ready
4. **Type Safety** - Full TypeScript support

### 🔄 Ready but Not Connected
1. **Gallery** - API ready, perlu connect component
2. **News** - API ready, perlu connect component  
3. **About** - API ready, perlu connect component

---

## 🗂️ File Penting

```
📁 Supabase Setup
├── lib/supabase.ts                 ← Public client & types
├── lib/supabase-admin.ts           ← Admin client (server-side)
├── lib/hooks/useData.ts            ← Custom hooks untuk fetch
└── .env.local.example              ← Template environment

📁 API Routes
├── app/api/login/route.ts          ← ✅ Authentication
├── app/api/infobox/route.ts        ← ✅ Statistik CRUD
├── app/api/gallery/route.ts        ← Gallery CRUD
├── app/api/news/route.ts           ← News CRUD
└── app/api/about/route.ts          ← About CRUD

📁 Database
├── database/README.md              ← Dokumentasi lengkap
├── database/01_admins.sql          ← ⚠️ Jalankan bagian FUNCTION saja
├── database/02_infobox_stats.sql   ← ⚠️ Wajib untuk testing
└── database/0X_*.sql               ← Opsional

📁 Docs
├── SUPABASE_SETUP.md               ← Setup guide lengkap
└── QUICKSTART.md (this file)       ← Quick start guide
```

---

## 🧪 Testing Checklist

### Test 1: Database Connection
```bash
# Di Supabase SQL Editor, jalankan:
SELECT * FROM infobox_stats WHERE is_active = true;

# Harus return 1 row dengan data
```

### Test 2: API Endpoint
```bash
# Test GET (public)
curl http://localhost:3000/api/infobox

# Expected: JSON dengan data statistik
```

### Test 3: Frontend Display
```bash
# Buka browser: http://localhost:3000/profil
# Scroll ke section statistik (6 kartu)
# Data harus muncul dari database (bukan hardcoded)
```

### Test 4: Admin Update
```bash
# 1. Login: http://localhost:3000/login
# 2. Go to: http://localhost:3000/profil  
# 3. Klik tombol "Edit Infobox" (muncul kalau sudah login)
# 4. Edit nilai (misal: ubah "190" jadi "200")
# 5. Klik Save
# 6. Refresh page
# 7. Nilai harus berubah di tampilan
```

---

## ❗ Troubleshooting

### Error: "Missing Supabase environment variables"
```bash
# Cek file .env.local ada dan terisi
cat .env.local

# Harus ada 3 variables:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Error: "Failed to fetch infobox stats"
```sql
-- Cek di Supabase SQL Editor:
SELECT * FROM infobox_stats;

-- Kalau kosong, insert data:
INSERT INTO infobox_stats (
  luas_wilayah, kartu_keluarga, total_penduduk,
  rt_rw, fasilitas_umum, organisasi_aktif,
  is_active
) VALUES (
  '1,234 km²', '34', '190',
  '30 / 22', '5', '3',
  true
);
```

### Error: "Unauthorized" saat save
```bash
# 1. Pastikan sudah login
# 2. Check browser console untuk errors
# 3. Verify cookie 'admin_session' exists (F12 → Application → Cookies)
```

### Data tidak update
```bash
# Hard refresh browser:
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

---

## 🎯 Next: Connect Remaining Features

Sekarang Anda bisa connect component lain ke database dengan pattern yang sama:

### Pattern untuk Gallery:
```typescript
// Di gallery component
import { useGalleryPhotos } from '@/lib/hooks/useData'

const { data: photos, loading, refetch } = useGalleryPhotos()

// Display photos...
{photos.map(photo => (
  <img src={photo.image_url} alt={photo.alt_text} />
))}
```

### Pattern untuk News:
```typescript
// Di news component
import { useNews } from '@/lib/hooks/useData'

const { data: newsItems, loading } = useNews()

// Display news...
{newsItems.map(news => (
  <div key={news.id}>{news.title}</div>
))}
```

---

## 📞 Need Help?

1. Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) untuk detail lengkap
2. Check [database/README.md](./database/README.md) untuk SQL schema
3. Check Supabase Dashboard → Logs untuk error messages
4. Check browser console (F12) untuk frontend errors

---

**Happy Coding! 🚀**
