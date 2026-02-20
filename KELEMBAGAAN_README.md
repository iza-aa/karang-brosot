# Kelembagaan Page - Organizational Chart

Halaman kelembagaan dengan hierarchy tree untuk struktur organisasi pedukuhan.

## Features Implemented ✅

### 1. **UI Components**
- ✅ Avatar - Circular avatar dengan fallback initials
- ✅ Badge - Colored badges untuk roles/status
- ✅ Loading Spinner - Loading states & skeleton loaders
- ✅ Accordion - Collapsible sections
- ✅ Tabs - Floating tabs bar dengan add/remove
- ✅ Toast Notifications - Success/error/warning/info toasts
- ✅ Confirmation Dialog - Delete confirmations

### 2. **Organization Structure (Tabs)**
- ✅ Dynamic tabs untuk berbagai struktur (Perangkat Desa, RT/RW, PKK, dll)
- ✅ Add new structure (Admin only)
- ✅ Delete structure (Admin only)
- ✅ Color-coded tabs
- ✅ Floating/sticky tabs bar

### 3. **Organization Members (Tree)**
- ✅ Hierarchical tree visualization
- ✅ Multi-level support (root → children → grandchildren, dll)
- ✅ Glassmorphism cards dengan different variants per level:
  - Level 0: Chrome variant (top leader)
  - Level 1: Thick variant
  - Level 2: Regular variant
  - Level 3+: Thin/UltraThin variant
- ✅ SVG connecting lines dengan gradient
- ✅ Expand/collapse children nodes
- ✅ Empty state dengan illustration

### 4. **Member Management (Admin)**
- ✅ Add member modal dengan photo upload
- ✅ Image compression (max 800px, 0.5MB)
- ✅ Edit member (hover actions)
- ✅ Delete member dengan confirmation
- ✅ Toggle visibility (show/hide)
- ✅ Add child/subordinate
- ✅ Auto-calculate hierarchy level

### 5. **Database**
- ✅ org_structures table - untuk tabs/struktur
- ✅ org_members table - untuk anggota dengan self-reference
- ✅ RLS policies - public view, admin manage
- ✅ Automatic level calculation trigger
- ✅ Cascade delete support
- ✅ Sample data

### 6. **API Routes**
- ✅ `/api/org-structures` - CRUD operations
- ✅ `/api/org-members` - CRUD operations
- ✅ Tree building logic
- ✅ Error handling

### 7. **Interactions & UX**
- ✅ Smooth animations dengan Framer Motion
- ✅ Card tilt effect on hover
- ✅ Toast notifications untuk feedback
- ✅ Loading states
- ✅ Responsive design (desktop & mobile ready)
- ✅ Dark mode support

## Database Setup

Run these SQL files in Supabase SQL Editor:

```bash
1. database/08_org_structures.sql
2. database/09_org_members.sql
```

This will create:
- Tables with RLS policies
- Indexes for performance
- Triggers for auto-updates
- Sample data (Perangkat Desa with members)

## Usage

### For Visitors (Public)
1. Navigate to `/kelembagaan`
2. Click tabs to switch between structures
3. View organizational chart
4. Click member cards for details
5. Expand/collapse hierarchy levels

### For Admins
1. Login as admin
2. Navigate to `/kelembagaan`
3. **Add Structure**: Click `[+]` button on tabs bar
4. **Add Member**: Click "Tambah Anggota" or "Tambah Bawahan"
5. **Edit Member**: Hover card → Click edit icon
6. **Delete**: Hover card → Click delete icon → Confirm
7. **Toggle Visibility**: Hover card → Click eye icon

## Component Structure

```
app/kelembagaan/
  └─ page.tsx (Main page with state management)

components/ui/
  ├─ avatar.tsx
  ├─ badge.tsx
  ├─ loading-spinner.tsx
  ├─ accordion.tsx
  ├─ tabs.tsx
  ├─ toast.tsx
  └─ confirmation-dialog.tsx

components/modules/kelembagaan/
  ├─ member-card.tsx (Reuses existing Card component)
  ├─ org-chart-tree.tsx (Recursive tree renderer)
  ├─ add-structure-modal.tsx
  └─ add-member-modal.tsx

app/api/
  ├─ org-structures/route.ts
  └─ org-members/route.ts
```

## Styling Features

- **Glassmorphism**: Backdrop blur effects on cards
- **Gradients**: Connecting lines dengan gradient colors
- **Animations**: Framer Motion untuk smooth transitions
- **Color-coded**: Tabs & badges dengan custom colors
- **Responsive**: Mobile-first design
- **Dark Mode**: Full dark mode support

## Future Enhancements (Optional)

1. Drag & drop untuk reorder members
2. Export to PDF/PNG
3. Member search & filter
4. Version history & rollback
5. Bulk import via CSV
6. Print-optimized view
7. Zoom & pan controls untuk large trees
8. Member detail modal
9. Edit member modal (currently console.log)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for photos)
- **State**: React Hooks

## Notes

- Image upload menggunakan existing `image-compressor.ts`
- Reuses existing `Card` component dengan glassmorphism
- Admin context dari `lib/admin-context.tsx`
- Toast provider di root layout
- RLS policies ensure security
