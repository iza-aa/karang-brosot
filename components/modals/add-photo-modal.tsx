'use client';

import { useState } from 'react';
import ModalLayout from './modal-layout';
import ButtonActionPlus from '@/components/ui/button-action-plus';
import { compressImage, validateImageFile, getFileSizeKB } from '@/lib/image-compressor';

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddPhotoFormData) => void;
}

export interface AddPhotoFormData {
  image: string;
  imagePath?: string;
  imageFile?: File;
}

export default function AddPhotoModal({ isOpen, onClose, onSave }: AddPhotoModalProps) {
  const [image, setImage] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string>('');

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
      setImage(imageUrl);
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
    if (!imageFile) {
      alert('Mohon unggah foto terlebih dahulu!');
      return;
    }

    try {
      setUploading(true);

      // Upload to Supabase Storage
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('folder', 'gallery');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();

      // Pass the uploaded image URL to parent
      onSave({ 
        image: result.data.url,
        imagePath: result.data.path,
      });
      
      handleClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Gagal mengupload foto');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setImage('');
    setImageFile(null);
    setCompressionInfo('');
    setUploading(false);
    onClose();
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={handleClose}
      title="Tambah Foto"
      size="md"
    >
      <div className="space-y-6">
        {/* Upload Image */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Upload Foto <span className="text-red-500">*</span>
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
          {image && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
              <img 
                src={image} 
                alt="Preview" 
                className="w-full h-64 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
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