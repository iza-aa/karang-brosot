'use client';

import { useState } from 'react';
import ModalLayout from './modal-layout';
import ButtonActionPlus from '@/components/ui/button-action-plus';
import { compressImage, validateImageFile, getFileSizeKB } from '@/lib/image-compressor';

interface AddNewsEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewsEventFormData) => void;
}

export interface NewsEventFormData {
  category: 'BERITA' | 'ACARA';
  title: string;
  description: string;
  date: string;
  time?: string;
  image: string;
  imagePath?: string;
}

export default function AddNewsEventModal({ isOpen, onClose, onSave }: AddNewsEventModalProps) {
  const [formData, setFormData] = useState<NewsEventFormData>({
    category: 'BERITA',
    title: '',
    description: '',
    date: '',
    time: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string>('');

  const handleInputChange = (field: keyof NewsEventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file
      validateImageFile(file, 10); // Max 10MB

      const originalSize = getFileSizeKB(file);
      setCompressionInfo(`Original: ${originalSize}KB - Compressing...`);

      // Compress image
      const compressedFile = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
      });

      const compressedSize = getFileSizeKB(compressedFile);
      
      // Use compressed only if it's actually smaller
      let finalFile = compressedFile;
      let infoMessage = '';
      
      if (compressedSize < originalSize) {
        const savings = Math.round(((originalSize - compressedSize) / originalSize) * 100);
        infoMessage = `Original: ${originalSize}KB → Compressed: ${compressedSize}KB (${savings}% smaller) ✅`;
      } else {
        // Compressed file is larger, use original
        finalFile = file;
        infoMessage = `${originalSize}KB (No compression needed - already optimized)`;
      }
      
      setCompressionInfo(infoMessage);

      // Create preview URL
      const imageUrl = URL.createObjectURL(finalFile);
      handleInputChange('image', imageUrl);
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
    if (!formData.title || !formData.description || !formData.date) {
      alert('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }

    if (formData.category === 'ACARA' && !formData.time) {
      alert('Waktu harus diisi untuk kategori Acara!');
      return;
    }

    try {
      setUploading(true);

      // Upload image if exists
      let imageUrl = '';
      let imagePath = '';
      
      if (imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', imageFile);
        formDataUpload.append('folder', 'news');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const result = await response.json();
        imageUrl = result.data.url;
        imagePath = result.data.path;
      }

      onSave({
        ...formData,
        image: imageUrl,
        imagePath: imagePath,
      });
      
      handleClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('Gagal menyimpan berita');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      category: 'BERITA',
      title: '',
      description: '',
      date: '',
      time: '',
      image: '',
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
      title="Tambah Berita/Event"
      size="lg"
    >
      <div className="space-y-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Kategori <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          >
            <option value="BERITA">BERITA</option>
            <option value="ACARA">ACARA</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Judul <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Masukkan judul berita/event"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Deskripsi <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Masukkan deskripsi berita/event"
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            required
          />
        </div>

        {/* Date and Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Time - Only for ACARA */}
          {formData.category === 'ACARA' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Waktu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                placeholder="e.g., 09:00 - 12:00 WIB"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          )}
        </div>

        {/* Upload Image */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Upload Foto
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
          {formData.image && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
              <img 
                src={formData.image} 
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
