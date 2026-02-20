# 📸 Image Compressor & Upload System

## Overview

Sistem upload gambar dengan kompresi otomatis untuk **Gallery Desa** dan **Berita/Acara**. Gambar dikompres di client-side sebelum upload ke Supabase Storage untuk menghemat bandwidth dan storage.

## 🎯 Key Features

- ✅ **Automatic Compression**: Gambar otomatis dikompres sebelum upload
- ✅ **Real-time Preview**: Preview hasil kompresi sebelum save
- ✅ **Compression Stats**: Tampilkan persentase pengurangan ukuran file
- ✅ **File Validation**: Validate type dan size sebelum proses
- ✅ **Supabase Storage**: Upload ke cloud storage dengan public URL
- ✅ **Progress Indicator**: Loading state saat upload
- ✅ **Error Handling**: User-friendly error messages

## 📦 Components

### 1. Image Compressor Utility (`lib/image-compressor.ts`)

```typescript
// Compress single image
const compressed = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
});

// Get file size
const sizeKB = getFileSizeKB(file);
const sizeMB = getFileSizeMB(file);

// Validate image
validateImageFile(file, 10); // Max 10MB

// Create thumbnail
const thumb = await createThumbnail(file);
```

### 2. Upload API (`app/api/upload/route.ts`)

**POST** - Upload image
```bash
curl -X POST /api/upload \
  -F "file=@image.jpg" \
  -F "folder=gallery"
```

**DELETE** - Delete image
```bash
curl -X DELETE "/api/upload?path=gallery/123-abc.jpg"
```

### 3. Add Photo Modal (`components/modals/add-photo-modal.tsx`)

Modal untuk upload foto gallery dengan:
- File picker
- Auto compression
- Preview dengan stats
- Upload to Supabase Storage

### 4. Add News Event Modal (`components/modals/add-news-event-modal.tsx`)

Modal untuk tambah berita/acara dengan:
- Form input (title, description, date, time)
- Optional image upload
- Auto compression
- Upload to Supabase Storage

## 🚀 Quick Start

### 1. Setup Supabase Storage

Di Supabase Dashboard:

1. Buka **Storage** → **New bucket**
2. Nama: `images`
3. Pilih **Public bucket**
4. Klik **Create**

### 2. Environment Variables

Pastikan ada di `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Test Upload

1. Login sebagai admin
2. Buka halaman Profil
3. Klik "Tambah Foto" atau "Tambah Berita"
4. Pilih gambar (max 10MB)
5. Lihat compression stats
6. Klik Save

## 🔧 Configuration

### Compression Settings

Edit di `add-photo-modal.tsx` atau `add-news-event-modal.tsx`:

```typescript
const compressedFile = await compressImage(file, {
  maxWidth: 1920,     // Max width in pixels
  maxHeight: 1080,    // Max height in pixels
  quality: 0.85,      // 0.0 - 1.0 (higher = better quality)
  mimeType: 'image/jpeg', // Output format
});
```

### Quality Presets

| Quality | Use Case | File Size | Visual Quality |
|---------|----------|-----------|----------------|
| 0.95 | High-res photos | Largest | Excellent |
| 0.85 | **Default** | Medium | Very Good |
| 0.75 | Web images | Small | Good |
| 0.60 | Thumbnails | Smallest | Acceptable |

### Folder Structure

```
images/
├── gallery/    # Gallery photos
└── news/       # News/event photos
```

## 📊 Compression Examples

```
Original:  3.2MB (4000x3000) → Compressed: 520KB (1920x1440) - 84% smaller
Original:  2.1MB (3264x2448) → Compressed: 380KB (1920x1440) - 82% smaller
Original:  1.5MB (2048x1536) → Compressed: 280KB (1920x1440) - 81% smaller
```

## 🛠 How It Works

### Flow Diagram

```
User selects image
       ↓
Validate file (type, size)
       ↓
Compress image (Canvas API)
       ↓
Show preview + stats
       ↓
Upload to /api/upload
       ↓
Save to Supabase Storage
       ↓
Return public URL
       ↓
Save URL to database
```

### Compression Process

1. **Load Image**: FileReader reads file as DataURL
2. **Create Canvas**: Canvas with new dimensions (maintain aspect ratio)
3. **Draw Image**: Draw resized image with high quality smoothing
4. **Convert**: Canvas to Blob with specified quality
5. **Create File**: New File object from Blob

## 🔐 Security

- ✅ Admin session verification
- ✅ File type validation (JPG, PNG, WebP only)
- ✅ File size limit (10MB)
- ✅ Randomized filenames
- ✅ Public bucket (read-only for public)
- ✅ Upload/delete only for authenticated admins

## 🐛 Troubleshooting

### Error: "Failed to upload image"

**Solution**:
1. Check Supabase Storage bucket `images` exists
2. Check bucket is set to **Public**
3. Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### Images not loading

**Solution**:
1. Verify bucket is **Public**
2. Check URL format: `https://[project].supabase.co/storage/v1/object/public/images/...`
3. Check browser console for CORS errors

### Compression too aggressive / Images blurry

**Solution**:
```typescript
// Increase quality
quality: 0.90  // or 0.95 for highest quality

// Keep larger dimensions
maxWidth: 2560,
maxHeight: 1440,
```

### File size still too large

**Solution**:
```typescript
// Lower quality
quality: 0.70  // or 0.60

// Use WebP format (30% smaller)
mimeType: 'image/webp',
```

## 📱 Mobile Considerations

- Works on mobile browsers
- Handles device photos (HEIC converted to JPEG)
- Compresses before upload (saves mobile data)
- Optimized for slow connections

## 🚧 Future Enhancements

- [ ] Multiple image upload
- [ ] Drag & drop support
- [ ] Image cropping tool
- [ ] Auto thumbnail generation
- [ ] Progress bar for large files
- [ ] Batch compression
- [ ] WebP format support

## 📚 Resources

- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Image Compression Best Practices](https://web.dev/fast/#optimize-your-images)

## 💡 Tips

1. **Batch Upload**: Upload multiple photos at once (future feature)
2. **WebP Format**: Use WebP for 30% smaller files (change mimeType)
3. **Lazy Loading**: Implement lazy loading for gallery (improves performance)
4. **CDN**: Consider using CDN for faster image delivery
5. **Thumbnails**: Generate thumbnails for list views (saves bandwidth)

---

**Created by**: BSI Team  
**Last Updated**: February 13, 2026
