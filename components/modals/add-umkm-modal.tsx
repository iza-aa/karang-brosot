'use client';

import { useState, useEffect } from 'react';
import ModalLayout from './modal-layout';
import ButtonActionPlus from '@/components/ui/button-action-plus';
import { compressImage, validateImageFile, getFileSizeKB } from '@/lib/image-compressor';

interface AddUmkmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UmkmFormData) => void;
  initialData?: UmkmData | null;
}

export interface UmkmData {
  id: string;
  nama_usaha: string;
  kategori: string;
  deskripsi: string | null;
  nama_pemilik: string;
  nomor_telepon: string | null;
  email: string | null;
  alamat: string | null;
  foto_url: string | null;
  foto_path: string | null;
  whatsapp: string | null;
  instagram: string | null;
  jam_operasional: string | null;
  harga_range: string | null;
  tahun_berdiri: number | null;
  is_featured: boolean;
}

export interface UmkmFormData {
  nama_usaha: string;
  kategori: string;
  deskripsi: string;
  nama_pemilik: string;
  nomor_telepon: string;
  email: string;
  alamat: string;
  whatsapp: string;
  instagram: string;
  jam_operasional: string;
  harga_range: string;
  tahun_berdiri: string;
  is_featured: boolean;
  foto_url?: string;
  foto_path?: string;
}

export default function AddUmkmModal({ isOpen, onClose, onSave, initialData }: AddUmkmModalProps) {
  const [formData, setFormData] = useState<UmkmFormData>({
    nama_usaha: '',
    kategori: '',
    deskripsi: '',
    nama_pemilik: '',
    nomor_telepon: '',
    email: '',
    alamat: '',
    whatsapp: '',
    instagram: '',
    jam_operasional: '',
    harga_range: '',
    tahun_berdiri: '',
    is_featured: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string>('');

  // Update form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        nama_usaha: initialData.nama_usaha,
        kategori: initialData.kategori,
        deskripsi: initialData.deskripsi || '',
        nama_pemilik: initialData.nama_pemilik,
        nomor_telepon: initialData.nomor_telepon || '',
        email: initialData.email || '',
        alamat: initialData.alamat || '',
        whatsapp: initialData.whatsapp || '',
        instagram: initialData.instagram || '',
        jam_operasional: initialData.jam_operasional || '',
        harga_range: initialData.harga_range || '',
        tahun_berdiri: initialData.tahun_berdiri?.toString() || '',
        is_featured: initialData.is_featured,
        foto_url: initialData.foto_url || '',
        foto_path: initialData.foto_path || '',
      });
      setImageFile(null);
      setCompressionInfo('');
    } else if (isOpen && !initialData) {
      // Reset for new entry
      setFormData({
        nama_usaha: '',
        kategori: '',
        deskripsi: '',
        nama_pemilik: '',
        nomor_telepon: '',
        email: '',
        alamat: '',
        whatsapp: '',
        instagram: '',
        jam_operasional: '',
        harga_range: '',
        tahun_berdiri: '',
        is_featured: false,
      });
      setImageFile(null);
      setCompressionInfo('');
    }
  }, [isOpen, initialData]);

  const handleInputChange = (field: keyof UmkmFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateImageFile(file, 10); // Max 10MB

      const originalSize = getFileSizeKB(file);
      setCompressionInfo(`Original: ${originalSize}KB - Compressing...`);

      const compressedFile = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
      });

      const compressedSize = getFileSizeKB(compressedFile);
      
      let finalFile = compressedFile;
      let infoMessage = '';
      
      if (compressedSize < originalSize) {
        const savings = Math.round(((originalSize - compressedSize) / originalSize) * 100);
        infoMessage = `Original: ${originalSize}KB → Compressed: ${compressedSize}KB (${savings}% smaller) ✅`;
      } else {
        finalFile = file;
        infoMessage = `${originalSize}KB (No compression needed - already optimized)`;
      }
      
      setCompressionInfo(infoMessage);
      setImageFile(finalFile);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to process image');
      }
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.nama_usaha || !formData.nama_pemilik || !formData.kategori) {
      alert('Nama usaha, kategori, dan nama pemilik wajib diisi!');
      return;
    }

    try {
      setUploading(true);

      let foto_url = formData.foto_url || '';
      let foto_path = formData.foto_path || '';
      
      // Upload image if new file selected
      if (imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', imageFile);
        formDataUpload.append('folder', 'umkm');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const result = await response.json();
        foto_url = result.data.url;
        foto_path = result.data.path;
      }

      onSave({
        ...formData,
        foto_url,
        foto_path,
      });
      
      handleClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('Gagal menyimpan UMKM');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nama_usaha: '',
      kategori: '',
      deskripsi: '',
      nama_pemilik: '',
      nomor_telepon: '',
      email: '',
      alamat: '',
      whatsapp: '',
      instagram: '',
      jam_operasional: '',
      harga_range: '',
      tahun_berdiri: '',
      is_featured: false,
    });
    setImageFile(null);
    setCompressionInfo('');
    setUploading(false);
    onClose();
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? 'Edit UMKM' : 'Tambah UMKM'}
      size="xl"
      scrollActive={true}
    >
      <div className="space-y-6">
        {/* Kategori & Nama Usaha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.kategori}
              onChange={(e) => handleInputChange('kategori', e.target.value)}
              placeholder="Contoh: Kuliner, Kerajinan, Peternakan, dll"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Wajib diisi. Contoh: Kuliner, Kerajinan, Jasa, dll
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nama Usaha <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nama_usaha}
              onChange={(e) => handleInputChange('nama_usaha', e.target.value)}
              placeholder="Nama UMKM"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Deskripsi
          </label>
          <textarea
            value={formData.deskripsi}
            onChange={(e) => handleInputChange('deskripsi', e.target.value)}
            placeholder="Deskripsi singkat tentang usaha"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Nama Pemilik & No Telepon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nama Pemilik <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nama_pemilik}
              onChange={(e) => handleInputChange('nama_pemilik', e.target.value)}
              placeholder="Nama pemilik"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nomor Telepon
            </label>
            <input
              type="tel"
              value={formData.nomor_telepon}
              onChange={(e) => handleInputChange('nomor_telepon', e.target.value)}
              placeholder="081234567890"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Email & WhatsApp */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              WhatsApp
            </label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              placeholder="081234567890"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Alamat */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Alamat
          </label>
          <textarea
            value={formData.alamat}
            onChange={(e) => handleInputChange('alamat', e.target.value)}
            placeholder="Alamat lengkap usaha"
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Instagram, Jam Operasional, Harga Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Instagram
            </label>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              placeholder="@username"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Jam Operasional
            </label>
            <input
              type="text"
              value={formData.jam_operasional}
              onChange={(e) => handleInputChange('jam_operasional', e.target.value)}
              placeholder="08:00 - 20:00"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tahun Berdiri
            </label>
            <input
              type="number"
              value={formData.tahun_berdiri}
              onChange={(e) => handleInputChange('tahun_berdiri', e.target.value)}
              placeholder="2020"
              min="1900"
              max="2100"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Harga Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Range Harga
          </label>
          <input
            type="text"
            value={formData.harga_range}
            onChange={(e) => handleInputChange('harga_range', e.target.value)}
            placeholder="Rp 10.000 - Rp 50.000"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Upload Foto */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Upload Foto {initialData && '(Opsional - Biarkan kosong untuk tetap pakai foto lama)'}
          </label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Maksimal 10MB. Format: JPG, PNG, WebP. Gambar akan otomatis dikompres.
          </p>
          {compressionInfo && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              {compressionInfo}
            </p>
          )}
          {(imageFile || formData.foto_url) && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
              <img 
                src={imageFile ? URL.createObjectURL(imageFile) : formData.foto_url} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
          {uploading ? (
            <p className="text-sm text-blue-600 dark:text-blue-400">Uploading...</p>
          ) : (
            <ButtonActionPlus
              showSaveCancel={true}
              onSave={handleSave}
              onCancel={handleClose}
            />
          )}
        </div>
      </div>
    </ModalLayout>
  );
}
