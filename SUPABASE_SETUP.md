# Setup Supabase Integration

## ✅ Yang Sudah Diimplementasi

### 1. **Supabase Clients** (`lib/`)
- ✅ `supabase.ts` - Client untuk public access (read-only)  
- ✅ `supabase-admin.ts` - Admin client untuk server-side operations
- ✅ Type definitions untuk semua tabel database

### 2. **API Routes** (`app/api/`)
- ✅ `/api/login` - Admin authentication dengan bcrypt
- ✅ `/api/infobox` - CRUD untuk statistik pedukuhan
- ✅ `/api/gallery` - CRUD untuk galeri foto
- ✅ `/api/news` - CRUD untuk berita & acara
- ✅ `/api/about` - Update konten about section

### 3. **Custom Hooks** (`lib/hooks/`)
- ✅ `useInfoboxStats()` - Fetch statistik pedukuhan
- ✅ `useGalleryPhotos()` - Fetch gallery photos
- ✅ `useNews()` - Fetch berita/acara
- ✅ `useAboutContents()` - Fetch konten about

### 4. **Frontend Integration**
- ✅ Profil page connected dengan database
- ✅ Infobox stats real-time dari Supabase
- ✅ Edit modal dengan auto-load data
- ✅ Save functionality ke database

---

## 🚀 Langkah Setup

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js bcryptjs
npm install -D @types/bcryptjs
```

### 2. Setup Environment Variables
Copy `.env.local.example` ke `.env.local` dan isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SESSION_SECRET=your-random-secret-32-chars
```

**Cara mendapatkan keys:**
1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Go to **Settings** > **API**
4. Copy `URL`, `anon/public key`, dan `service_role key`

### 3. Setup Database
Jalankan SQL files di Supabase SQL Editor berurutan:

```bash
# 1. Function utilities (WAJIB!)
database/01_admins.sql (bagian FUNCTION & TRIGGER UTILITIES)

# 2. Tabel-tabel sesuai kebutuhan
database/02_infobox_stats.sql
database/03_about_contents.sql  
database/04_gallery_photos.sql
database/05_news_events.sql
database/06_hero_banners.sql
```

### 4. Setup Storage Buckets (Untuk Upload Gambar)
Di Supabase Dashboard > Storage:

```sql
-- Jalankan di SQL Editor
INSERT INTO storage.buckets (id, name, public) VALUES 
('gallery-photos', 'gallery-photos', true),
('news-images', 'news-images', true);
```

### 5. Verify Admin User
Pastikan admin user sudah ada:

```sql
SELECT * FROM admin_users;
```

Default credentials:
- Username: `adminkarang`
- Password: `brosotadmin1945`

---

## 🧪 Testing

### 1. Test Login
```bash
# Start dev server
npm run dev

# Navigate to
http://localhost:3000/login

# Login with:
Username: adminkarang
Password: brosotadmin1945
```

### 2. Test Infobox Stats
```bash
# Public endpoint (no auth required)
curl http://localhost:3000/api/infobox

# Expected response:
{
  "data": {
    "luas_wilayah": "1,234 km²",
    "kartu_keluarga": "34",
    ...
  }
}
```

### 3. Test Update (Admin Only)
1. Login sebagai admin
2. Go to `/profil`
3. Click "Edit Infobox"
4. Update values
5. Click Save
6. Verify data updated di database

---

## 📁 File Structure

```
app/
├── api/
│   ├── login/route.ts       # ✅ Login API
│   ├── infobox/route.ts     # ✅ Infobox CRUD
│   ├── gallery/route.ts     # ✅ Gallery CRUD
│   ├── news/route.ts        # ✅ News CRUD
│   └── about/route.ts       # ✅ About CRUD
├── profil/
│   └── page.tsx             # ✅ Connected to DB
lib/
├── supabase.ts              # ✅ Public client + types
├── supabase-admin.ts        # ✅ Admin client + helpers
└── hooks/
    └── useData.ts           # ✅ Custom hooks
components/
└── modals/
    ├── edit-infobox-modal.tsx  # ✅ Load from DB
    └── ...
```

---

## 🔄 Data Flow

### Read (Public)
```
Component → Custom Hook → API Route → Supabase (anon key) → Display
```

### Write (Admin)
```
Admin Login → Set Cookie → Modal Edit → API Route (verify session) 
→ Supabase (service_role) → Update DB → Refetch Data
```

---

## 🐛 Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution:** Verify `.env.local` exists dan semua variables filled

### Issue: "Failed to fetch infobox stats"
**Solution:** 
1. Check database table `infobox_stats` exists
2. Verify at least 1 row dengan `is_active = true`
3. Check SQL was run correctly

### Issue: "Unauthorized" saat update
**Solution:**
1. Verify admin sudah login
2. Check cookie `admin_session` exists
3. Verify admin user exist di tabel `admin_users`

### Issue: Upload gambar gagal
**Solution:**
1. Pastikan storage buckets sudah dibuat
2. Check storage policies (akan diimplementasi next)
3. Use service_role key untuk bypass RLS

---

## 📝 Next Steps (Belum Diimplementasi)

### 1. Gallery & News Integration
Update components untuk fetch & display dari database:
- `image-galery-section.tsx` - Use `useGalleryPhotos()` hook
- `news-section.tsx` - Use `useNews()` hook

### 2. Image Upload
Implement upload functionality ke Supabase Storage:
- Create upload utility function
- Update modals untuk handle file upload
- Store URLs di database

### 3. About Section
Connect about section components dengan database:
- Fetch from `/api/about`
- Display dynamic content
- Edit modal integration

### 4. Loading States
Add proper loading skeletons:
- Shimmer effects untuk cards
- Loading indicators untuk buttons
- Error handling UI

### 5. Optimistic Updates
Implement optimistic UI updates:
- Update UI before API response
- Rollback on error
- Better UX

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [React Hooks](https://react.dev/reference/react)

---

**Status:** 🟢 Core functionality implemented & ready for testing

**Last Updated:** February 13, 2026
