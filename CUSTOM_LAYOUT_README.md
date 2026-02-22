# Custom Org Chart Layout - Manual Drag & Drop

Fitur ini memungkinkan admin untuk mengatur posisi node pada organizational chart secara manual menggunakan drag and drop dengan bantuan grid canvas.

## 🎯 Fitur

### 1. **Dual Layout Mode**
- **Auto Layout**: Layout otomatis menggunakan D3.js (hierarki tradisional)
- **Manual Layout**: Canvas grid dengan drag & drop manual

### 2. **Canvas Grid**
- Grid visual untuk membantu alignment
- Snap-to-grid untuk posisi yang rapi
- Grid size: 20px
- Toggle grid on/off

### 3. **Drag & Drop**
- Drag node ke posisi manapun pada canvas
- Real-time position update
- Visual feedback saat dragging
- Mouse cursor berubah menjadi "move"

### 4. **Persistensi Data**
- Posisi custom disimpan ke database
- Setiap struktur dapat memiliki layout berbeda
- Reset ke auto layout kapan saja

## 📋 Setup Database

Jalankan migration file berikut:

```bash
psql -U postgres -d your_database -f database/12_add_custom_positions.sql
```

Atau jalankan di Supabase SQL Editor:

```sql
ALTER TABLE public.org_members 
ADD COLUMN IF NOT EXISTS custom_x NUMERIC,
ADD COLUMN IF NOT EXISTS custom_y NUMERIC,
ADD COLUMN IF NOT EXISTS use_custom_layout BOOLEAN DEFAULT FALSE;
```

## 🎨 Cara Penggunaan

### Untuk Admin:

1. **Masuk ke halaman Kelembagaan** (`/kelembagaan`)

2. **Pilih Layout Mode:**
   - Klik tombol "🔄 Auto Layout" untuk layout otomatis
   - Klik tombol "🎨 Manual Layout" untuk customize

3. **Customize Layout:**
   - Klik "🎨 Customize Layout" di kanan atas
   - Mode customize akan aktif
   - Grid akan muncul di background

4. **Drag Node:**
   - Click & hold pada node
   - Drag ke posisi yang diinginkan
   - Node akan snap ke grid
   - Release untuk drop

5. **Simpan Layout:**
   - Klik tombol "💾 Simpan" untuk menyimpan posisi
   - Konfirmasi akan muncul jika berhasil

6. **Reset Layout:**
   - Klik tombol "Reset" untuk kembali ke auto layout
   - Semua custom position akan dihapus
   - Konfirmasi diperlukan

7. **Toggle Grid:**
   - Centang/uncheck checkbox "Grid"
   - Grid dapat dimatikan untuk view yang lebih bersih

## 🔧 Komponen

### 1. `/components/modules/kelembagaan/org-chart-custom-layout.tsx`
Component utama untuk manual layout dengan fitur:
- Canvas rendering
- Drag & drop logic
- Grid system
- Position management
- Save/reset functionality

### 2. `/app/api/org-members/positions/route.ts`
API endpoints:
- `PATCH /api/org-members/positions` - Save positions (batch update)
- `POST /api/org-members/positions` - Reset layout

### 3. Database Schema
Kolom baru di `org_members`:
- `custom_x`: NUMERIC - koordinat X
- `custom_y`: NUMERIC - koordinat Y  
- `use_custom_layout`: BOOLEAN - flag untuk menggunakan custom layout

## 🎪 UI/UX Details

### Control Panel (Admin Only)
- **Layout Mode Toggle**: Switch antara Auto/Manual
- **Customize Button**: Masuk ke mode edit
- **Grid Toggle**: Show/hide grid
- **Reset Button**: Kembali ke auto layout
- **Cancel Button**: Keluar dari mode customize tanpa save
- **Save Button**: Simpan posisi custom

### Node Styling
- Width: 280px
- Height: 140px
- Rounded corners
- Shadow saat hover
- Opacity berubah saat dragging
- Border highlight

### Grid System
- Grid size: 20px x 20px
- Semi-transparent lines
- Snap-to-grid positioning
- Canvas size: 2000px x 2000px (scrollable)

### Info Panel
- Alert kuning saat mode customize aktif
- Instruksi singkat
- Icon 💡 untuk attention

## 📊 Data Flow

```
1. Load Members
   ↓
2. Check use_custom_layout & custom_x/y
   ↓
3. Initialize positions:
   - Custom: use saved x/y
   - Auto: calculate default grid positions
   ↓
4. User drags node
   ↓
5. Update local state (snap to grid)
   ↓
6. User clicks Save
   ↓
7. Batch update via API
   ↓
8. Save to database
   ↓
9. Confirmation
```

## 🚀 Advanced Features

### Snap to Grid
```typescript
const snapToGrid = (value: number) => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};
```

### Batch Position Update
```typescript
const positionsArray = Array.from(positions.values()).map((pos) => ({
  id: pos.id,
  custom_x: pos.x,
  custom_y: pos.y,
}));
```

### Recursive Node Rendering
```typescript
const renderAllNodes = (nodes: OrgTreeNode[]): JSX.Element[] => {
  const elements: JSX.Element[] = [];
  const traverse = (nodeList: OrgTreeNode[]) => {
    nodeList.forEach((node) => {
      elements.push(renderNode(node));
      if (node.children?.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(nodes);
  return elements;
};
```

## 🎯 Best Practices

1. **Gunakan Grid**: Aktifkan grid untuk alignment yang lebih baik
2. **Save Regularly**: Save posisi secara berkala
3. **Test di Auto Mode**: Cek dulu di auto mode sebelum customize
4. **Hierarchical Planning**: Rencanakan hierarki sebelum customize
5. **Consistent Spacing**: Jaga jarak antar node yang konsisten

## 🐛 Troubleshooting

### Posisi tidak tersimpan
- Pastikan admin sudah login
- Check browser console untuk errors
- Verify database permissions

### Node overlap
- Gunakan grid untuk spacing yang tepat
- Increase canvas size jika perlu
- Reset dan mulai dari awal

### Grid tidak muncul
- Check toggle grid checkbox
- Pastikan dalam mode customize
- Refresh browser jika perlu

## 🔮 Future Enhancements

Potensi improvement di masa depan:
- [ ] Zoom in/out canvas
- [ ] Multiple undo/redo
- [ ] Alignment guides (snap to other nodes)
- [ ] Connection lines antara parent-child
- [ ] Export layout as image
- [ ] Template layouts
- [ ] Keyboard shortcuts
- [ ] Multi-select & group move

## 📝 Notes

- Custom layout per struktur organisasi (independent)
- Data tersimpan di database, tidak di localStorage
- Compatible dengan existing D3 auto layout
- Tidak mempengaruhi tampilan non-admin
- Responsive di layar besar (optimal pada desktop)

## 🎨 Styling Variables

Gunakan CSS variables yang sudah ada:
```css
--color-blue-uii: Primary action color
```

Dark mode support: ✅
Mobile optimization: ⚠️ (Best on desktop)
