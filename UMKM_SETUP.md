# UMKM Feature - Setup Guide

## Setup Database

Jalankan SQL file untuk membuat tabel UMKM:

```bash
# Di Supabase SQL Editor, jalankan:
database/14_umkm.sql
```

## Features

### Public Features
- ✅ Tampilan grid cards dengan kategori
- ✅ Filter tabs: Semua, Kuliner, Kerajinan, Peternakan
- ✅ Informasi lengkap UMKM (nama, pemilik, alamat, jam operasional, range harga)
- ✅ Contact buttons: WhatsApp, Telepon, Instagram
- ✅ Featured badge untuk UMKM unggulan
- ✅ Responsive design

### Admin Features (Login Required)
- ✅ Tambah UMKM baru
- ✅ Edit UMKM existing
- ✅ Hapus UMKM (soft delete)
- ✅ Upload foto dengan auto-compression
- ✅ Set Featured UMKM

## File Structure

```
database/
  └── 14_umkm.sql                    # Database schema & seed data

app/
  ├── api/umkm/route.ts              # API endpoints (GET, POST, PUT, DELETE)
  └── umkm/page.tsx                  # UMKM page with grid & tabs

components/
  └── modals/add-umkm-modal.tsx      # Modal for add/edit UMKM
```

## Database Schema

### Table: `umkm`

**Informasi Dasar:**
- `id` - UUID primary key
- `nama_usaha` - Nama UMKM
- `slug` - Auto-generated URL-friendly ID
- `kategori` - Enum: KULINER, KERAJINAN, PETERNAKAN
- `deskripsi` - Deskripsi singkat

**Informasi Pemilik:**
- `nama_pemilik` - Nama pemilik
- `nomor_telepon` - Nomor telepon
- `email` - Email (optional)
- `alamat` - Alamat lengkap

**Media:**
- `foto_url` - URL foto dari Supabase Storage
- `foto_path` - Path file di storage

**Kontak & Sosmed:**
- `whatsapp` - Nomor WhatsApp
- `instagram` - Handle Instagram

**Operasional:**
- `jam_operasional` - Jam buka (text)
- `harga_range` - Range harga (text)

**Metadata:**
- `is_active` - Status aktif/nonaktif (default: true)
- `is_featured` - Featured badge (default: false)
- `views_count` - Counter views
- `tahun_berdiri` - Tahun mulai usaha
- `created_at`, `updated_at`, `created_by`, `updated_by`

## API Endpoints

### GET /api/umkm
Fetch all active UMKM

**Query Parameters:**
- `kategori` - Filter by category (KULINER/KERAJINAN/PETERNAKAN)
- `slug` - Get specific UMKM by slug
- `id` - Get specific UMKM by ID

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nama_usaha": "Warung Bu Tini",
      "kategori": "KULINER",
      "nama_pemilik": "Tini Susanti",
      ...
    }
  ]
}
```

### POST /api/umkm (Admin Only)
Create new UMKM

**Body:**
```json
{
  "nama_usaha": "Warung Bu Tini",
  "kategori": "KULINER",
  "nama_pemilik": "Tini Susanti",
  "nomor_telepon": "081234567890",
  "deskripsi": "Nasi goreng enak",
  "alamat": "RT 01 RW 01",
  "foto_url": "https://...",
  "foto_path": "umkm/...",
  "whatsapp": "081234567890",
  "instagram": "@warungtini",
  "jam_operasional": "08:00 - 20:00",
  "harga_range": "Rp 10.000 - Rp 25.000",
  "tahun_berdiri": 2020,
  "is_featured": false
}
```

### PUT /api/umkm (Admin Only)
Update existing UMKM

**Body:** Same as POST with additional `id` field

### DELETE /api/umkm?id=uuid (Admin Only)
Soft delete UMKM (sets `is_active = false`)

## Storage Setup

Foto UMKM disimpan di Supabase Storage:
- **Bucket:** `photos`
- **Folder:** `umkm/`
- **Public access:** Enabled

## Usage

1. Login sebagai admin
2. Klik "Tambah UMKM"
3. Isi form dengan lengkap
4. Upload foto (optional)
5. Centang "Featured" jika ingin ditampilkan sebagai unggulan
6. Klik "Simpan"

## Notes

- Foto akan otomatis dikompres ke maksimal 1920x1080px dengan quality 85%
- Slug otomatis di-generate dari nama usaha
- Soft delete digunakan untuk menghapus (data tidak hilang permanent)
- Filter tabs untuk kemudahan navigasi per kategori
- Contact buttons otomatis muncul jika field tersedia

## Future Enhancements (Optional)

- [ ] Rating & review system
- [ ] Map integration untuk lokasi
- [ ] Multiple photos per UMKM
- [ ] Search functionality
- [ ] Sort by newest/featured
- [ ] Export data ke Excel/PDF
