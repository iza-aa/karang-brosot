# Database Schema - Karang Brosot

Database schema untuk website Pedukuhan Karang Brosot menggunakan Supabase PostgreSQL.

## 📋 Daftar Tabel

### Core Tables
1. **admin_users** ✅ - Sudah ada (untuk authentication)
2. **infobox_stats** - Statistik pedukuhan (6 kartu info)
3. **about_contents** - Konten informasi about section
4. **gallery_photos** - Galeri foto
5. **news_events** - Berita dan acara
6. **hero_banners** - Banner hero section

## 🚀 Cara Penggunaan

### ⚠️ Tabel admin_users sudah ada - SKIP file 01!

Karena tabel `admin_users` sudah dibuat, Anda **tidak perlu** menjalankan `01_admins.sql`.

### Install Per Feature
Jalankan file SQL sesuai kebutuhan feature:

```bash
# SKIP ini - admin_users sudah ada
# ❌ 01_admins.sql

# ✅ Jalankan function utilities dulu (ada di 01_admins.sql)
# Copy paste bagian FUNCTION & TRIGGER UTILITIES saja

# ✅ Pilih sesuai feature yang diperlukan
02_infobox_stats.sql      # Statistik Pedukuhan
03_about_contents.sql      # Konten About
04_gallery_photos.sql      # Galeri Foto
05_news_events.sql         # Berita & Acara
06_hero_banners.sql        # Hero Banner
```

## 📝 Langkah-Langkah Setup

### 1. Setup Supabase Project
1. Buka [supabase.com](https://supabase.com)
2. Create new project
3. Tunggu sampai project ready

### 2. Setup Function Utilities (PENTING!)
Sebelum menjalankan file lain, setup function untuk auto-update timestamp:

```sql
-- Copy dari file 01_admins.sql bagian FUNCTION & TRIGGER UTILITIES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk admin_users
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. Run SQL Schema Per Feature
1. Buka **SQL Editor** di Supabase Dashboard
2. Copy paste isi file SQL (02-06 sesuai kebutuhan)
3. Klik **Run** atau tekan `Ctrl/Cmd + Enter`
4. Ulangi untuk setiap file yang diperlukan

### 4. Setup Storage (untuk Upload File)
Untuk Gallery & News yang ada upload gambar:

#### Buat Storage Buckets
1. Go to **Storage** di Supabase Dashboard
2. Create new bucket: `gallery-photos` (Set Public: **YES**)
3. Create new bucket: `news-images` (Set Public: **YES**)

Atau via SQL:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES 
('gallery-photos', 'gallery-photos', true),
('news-images', 'news-images', true);
```

#### Setup Storage Policies (Public Access)
Karena bucket sudah public, semua orang bisa view. Untuk upload, buat policy:

```sql
-- Gallery Photos - Allow authenticated upload
CREATE POLICY "Allow authenticated uploads to gallery"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery-photos');

-- Gallery Photos - Allow public access
CREATE POLICY "Public Access to gallery"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery-photos');

-- News Images - Allow authenticated upload
CREATE POLICY "Allow authenticated uploads to news"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'news-images');

-- News Images - Allow public access
CREATE POLICY "Public Access to news images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'news-images');
```

**Note:** Gunakan `service_role` key di server-side untuk bypass policies saat upload dari admin.

## 🔐 Authentication & Authorization

### Setup yang digunakan:
- ✅ **Custom Authentication** (username + password hash)
- ✅ **Session management** di Next.js (cookies/JWT)
- ✅ **API authorization** di server-side
- ❌ **Supabase Auth** - tidak dipakai
- ❌ **Row Level Security (RLS)** - disabled

### Alasan disable RLS:
Karena menggunakan custom auth dengan `admin_users` table (bukan Supabase Auth), RLS policies yang bergantung pada `auth.uid()` tidak akan berfungsi. 

### Authorization Flow:
1. Admin login via API route (`/api/login`)
2. Validate username & password hash
3. Create session (JWT/cookie)
4. Setiap request cek session di middleware
5. Database query menggunakan `service_role` key

### Security Best Practices:
```typescript
// lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js'

// Untuk server-side admin operations
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Secret key!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Untuk client-side public read
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## 🔑 Environment Variables

Tambahkan ke `.env.local` di project Next.js:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-side only - JANGAN expose ke client!
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Session Secret (generate random string)
SESSION_SECRET=your-random-secret-string-min-32-chars
```

**PENTING:** 
- `SUPABASE_SERVICE_ROLE_KEY` hanya untuk server-side
- Tidak boleh di-expose ke client/browser
- Gunakan hanya di API routes & server components

## 📊 Struktur Data

### Infobox Stats
```typescript
{
  luas_wilayah: "1,234 km²",
  kartu_keluarga: "34",
  total_penduduk: "190",
  rt_rw: "30 / 22",
  fasilitas_umum: "5",
  organisasi_aktif: "3"
}
```

### Gallery Photos
```typescript
{
  title: "Foto Kegiatan...",
  description: "Deskripsi foto",
  image_url: "https://...",
  display_order: 1
}
```

### News & Events
```typescript
{
  category: "BERITA" | "ACARA" | "PENGUMUMAN",
  title: "Judul berita...",
  slug: "judul-berita",
  content: "Konten lengkap...",
  event_date: "2026-01-08",
  is_published: true
}
```

## 🛠️ Troubleshooting

### Error: relation "admin_users" does not exist
**Solusi**: Pastikan tabel admin_users sudah dibuat terlebih dahulu

### Error: function update_updated_at_column() does not exist
**Solusi**: Jalankan function utility dari file `01_admins.sql` bagian FUNCTION & TRIGGER UTILITIES

### Error: foreign key constraint
**Solusi**: 
1. Pastikan tabel `admin_users` sudah ada sebelum create tabel lain
2. Jika masalah persist, hapus foreign key constraint sementara

### Insert/Update gagal dari frontend
**Solusi**:
1. Pastikan menggunakan `service_role` key di API routes
2. Verify session/authentication di server-side
3. Check console untuk error details

### Upload file gagal
**Solusi**:
1. Pastikan storage bucket sudah dibuat
2. Cek storage policies sudah disetup
3. Gunakan `service_role` client untuk upload dari server
4. Verify file size tidak melebihi limit (default 50MB)

### Data tidak muncul di frontend
**Solusi**:
1. Cek apakah `is_active = true` atau `is_published = true`
2. Test query manual di SQL Editor
3. Verify API route returns correct data
4. Check browser console untuk fetch errors

## 📞 Support

Jika ada kendala:
1. Cek Supabase Logs di Dashboard
2. Cek browser console untuk error
3. Test query manual di SQL Editor
4. Verify RLS policies dengan `pg_policies` table

---

**Happy Coding! 🚀**
