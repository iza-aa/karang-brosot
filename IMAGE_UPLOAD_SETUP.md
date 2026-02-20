# Image Upload & Compression Setup

## 📦 Features

- **Automatic Image Compression**: Gambar otomatis dikompres sebelum upload untuk menghemat storage
- **Size Reduction**: Rata-rata 60-80% pengurangan ukuran file
- **Format Support**: JPG, PNG, WebP
- **Max File Size**: 10MB
- **Dimensions**: Otomatis resize ke maksimal 1920x1080px
- **Quality**: 85% (balance antara kualitas dan ukuran)

## 🔧 Setup Supabase Storage

### 1. Buat Storage Bucket

Di Supabase Dashboard:

1. Buka **Storage** di sidebar
2. Klik **New bucket**
3. Masukkan nama: `images`
4. Pilih **Public bucket** (agar gambar bisa diakses langsung via URL)
5. Klik **Create bucket**

### 2. Setup Storage Policy (Optional - untuk keamanan lebih)

Jika ingin hanya admin yang bisa upload/delete:

```sql
-- Allow admin to upload
CREATE POLICY "Admin can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow admin to delete images
CREATE POLICY "Admin can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- Allow public to read images
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');
```

**Note**: Karena kita menggunakan `service_role` key untuk upload, policies di atas optional.

## 📁 Folder Structure

Images akan tersimpan di folder-folder berikut:

```
images/
├── gallery/          # Foto galeri desa
│   ├── 1707123456-abc123.jpg
│   └── 1707123789-def456.jpg
└── news/             # Foto berita/acara
    ├── 1707234567-ghi789.jpg
    └── 1707234890-jkl012.jpg
```

## 🎯 How It Works

### Client-Side Compression

1. User pilih gambar dari device
2. File di-validate (type & size)
3. Gambar dikompres menggunakan Canvas API:
   - Resize jika > 1920x1080
   - Convert ke JPEG dengan quality 85%
   - Preview hasil kompresi
4. File compressed siap untuk upload

### Upload Process

1. File compressed dikirim ke `/api/upload`
2. API verify admin session
3. Generate unique filename: `timestamp-random.ext`
4. Upload ke Supabase Storage bucket `images`
5. Return public URL dan path
6. URL disimpan ke database

### Delete Process

1. Hapus record dari database (soft delete: set `is_active = false`)
2. Optional: Hapus file dari storage via `/api/upload?path=...`

## 📊 Compression Stats Example

```
Original:  2.5MB → Compressed: 450KB (82% smaller)
Original:  1.8MB → Compressed: 320KB (82% smaller)
Original:  950KB → Compressed: 180KB (81% smaller)
```

## 🔐 Security

- Upload hanya bisa dilakukan oleh admin (session verified)
- File type validation di client & server
- Max file size: 10MB
- Filename randomized untuk keamanan

## 🚀 Usage

### Add Photo (Gallery)

```typescript
// Modal automatically handles:
1. File selection
2. Validation
3. Compression
4. Upload to Storage
5. Save URL to database
```

### Add News with Image

```typescript
// Modal automatically handles:
1. File selection (optional)
2. Validation
3. Compression
4. Upload to Storage
5. Save URL to database with news data
```

## 🛠 Troubleshooting

### Error: "Failed to upload image"

- Check Supabase Storage bucket exists: `images`
- Check bucket is **Public**
- Check `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### Images not showing

- Check bucket is set to **Public**
- Verify URL format: `https://[project].supabase.co/storage/v1/object/public/images/...`

### Compression too aggressive

Edit compression settings in modal:

```typescript
const compressedFile = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.90,  // Increase quality (0.85 → 0.90)
});
```

## 💡 Tips

1. **Smaller file size**: Lower quality to 0.7-0.8
2. **Better quality**: Increase quality to 0.9-0.95
3. **Smaller dimensions**: Reduce maxWidth/maxHeight
4. **WebP format**: Change mimeType to 'image/webp' for ~30% smaller files

## 📝 API Endpoints

- `POST /api/upload` - Upload image dengan compression
- `DELETE /api/upload?path=...` - Delete image dari storage
