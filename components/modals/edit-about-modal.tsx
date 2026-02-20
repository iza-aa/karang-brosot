'use client';

import { useState } from 'react';
import ModalLayout from './modal-layout';
import ButtonActionPlus from '@/components/ui/button-action-plus';

interface EditAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AboutData) => void;
  initialData?: AboutData | null;
}

export interface AboutData {
  // Ultra Thin Card
  ultraThinTitle: string;
  ultraThinDescription: string;
  ultraThinContent: string;
  // Thin Card
  thinTitle: string;
  thinDescription: string;
  thinContent: string;
  // Regular Card
  regularTitle: string;
  regularDescription: string;
  regularContent: string;
}

export default function EditAboutModal({ isOpen, onClose, onSave, initialData }: EditAboutModalProps) {
  // Initialize state with initialData or defaults
  const getInitialFormData = (): AboutData => {
    if (initialData) {
      return {
        ultraThinTitle: initialData.ultraThinTitle || '',
        ultraThinDescription: initialData.ultraThinDescription || '',
        ultraThinContent: initialData.ultraThinContent || '',
        thinTitle: initialData.thinTitle || '',
        thinDescription: initialData.thinDescription || '',
        thinContent: initialData.thinContent || '',
        regularTitle: initialData.regularTitle || '',
        regularDescription: initialData.regularDescription || '',
        regularContent: initialData.regularContent || '',
      };
    }
    return {
      ultraThinTitle: 'Sejarah Singkat',
      ultraThinDescription: 'Perjalanan panjang Desa Karang Brosot',
      ultraThinContent: 'Desa Karang Brosot didirikan pada tahun 1800-an sebagai permukiman nelayan tradisional. Nama "Karang Brosot" berasal dari bahasa Jawa yang bermakna "karang yang runtuh"...',
      thinTitle: 'Visi & Misi',
      thinDescription: 'Tujuan dan arah pembangunan desa',
      thinContent: 'Visi: Mewujudkan Desa Karang Brosot sebagai desa maritim yang mandiri, sejahtera, dan berbudaya. Misi: 1) Meningkatkan kesejahteraan masyarakat...',
      regularTitle: 'Potensi Desa',
      regularDescription: 'Kekayaan dan peluang pengembangan',
      regularContent: 'Desa Karang Brosot memiliki potensi besar di sektor perikanan, pariwisata bahari, dan kerajinan tradisional. Dengan garis pantai sepanjang 5 km...',
    };
  };

  const [formData, setFormData] = useState<AboutData>(getInitialFormData());

  const handleInputChange = (field: keyof AboutData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Konten Tentang Desa"
      size="xl"
      scrollActive={true}
    >
      <div className="space-y-8">
        {/* Ultra Thin Card Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Card 1 - Ultra Thin
          </h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.ultraThinTitle}
              onChange={(e) => handleInputChange('ultraThinTitle', e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.ultraThinDescription}
              onChange={(e) => handleInputChange('ultraThinDescription', e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Konten <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.ultraThinContent}
              onChange={(e) => handleInputChange('ultraThinContent', e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>

        {/* Thin Card Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Card 2 - Thin
          </h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.thinTitle}
              onChange={(e) => handleInputChange('thinTitle', e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.thinDescription}
              onChange={(e) => handleInputChange('thinDescription', e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Konten <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.thinContent}
              onChange={(e) => handleInputChange('thinContent', e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>

        {/* Regular Card Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Card 3 - Regular
          </h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.regularTitle}
              onChange={(e) => handleInputChange('regularTitle', e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.regularDescription}
              onChange={(e) => handleInputChange('regularDescription', e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Konten <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.regularContent}
              onChange={(e) => handleInputChange('regularContent', e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <ButtonActionPlus
            showSaveCancel={true}
            onSave={handleSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </ModalLayout>
  );
}