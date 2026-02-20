'use client';

import { useState } from 'react';
import ModalLayout from './modal-layout';
import ButtonActionPlus from '@/components/ui/button-action-plus';

interface EditInfoboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InfoboxData) => void;
  initialData?: InfoboxData | null;
}

export interface InfoboxData {
  luasWilayah: string;
  kartuKeluarga: string;
  totalPenduduk: string;
  rtRw: string;
  fasilitasUmum: string;
  fasilitasUmumDetail?: string;
  organisasiAktif: string;
  organisasiAktifDetail?: string;
}

export default function EditInfoboxModal({ isOpen, onClose, onSave, initialData }: EditInfoboxModalProps) {
  // Initialize state with initialData or defaults
  const getInitialFormData = (): InfoboxData => {
    if (initialData) {
      return {
        luasWilayah: initialData.luasWilayah || '',
        kartuKeluarga: initialData.kartuKeluarga || '',
        totalPenduduk: initialData.totalPenduduk || '',
        rtRw: initialData.rtRw || '',
        fasilitasUmum: initialData.fasilitasUmum || '',
        fasilitasUmumDetail: initialData.fasilitasUmumDetail || '',
        organisasiAktif: initialData.organisasiAktif || '',
        organisasiAktifDetail: initialData.organisasiAktifDetail || '',
      };
    }
    return {
      luasWilayah: '1,234 km²',
      kartuKeluarga: '34',
      totalPenduduk: '190',
      rtRw: '30 / 22',
      fasilitasUmum: '5',
      fasilitasUmumDetail: 'Masjid, Mushola, Balai, dan Poskamling',
      organisasiAktif: '3',
      organisasiAktifDetail: 'Taruna Bakti, PKK, dan Kelompok Tani',
    };
  };

  const [formData, setFormData] = useState<InfoboxData>(getInitialFormData());

  const handleInputChange = (field: keyof InfoboxData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Validate all fields
    if (!formData.luasWilayah || !formData.kartuKeluarga || !formData.totalPenduduk || 
        !formData.rtRw || !formData.fasilitasUmum || !formData.organisasiAktif) {
      alert('Mohon lengkapi semua field!');
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Statistik Desa"
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Luas Wilayah */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Luas Wilayah <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.luasWilayah}
              onChange={(e) => handleInputChange('luasWilayah', e.target.value)}
              placeholder="e.g., 1,234 km²"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Kartu Keluarga */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Kartu Keluarga <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.kartuKeluarga}
              onChange={(e) => handleInputChange('kartuKeluarga', e.target.value)}
              placeholder="e.g., 34"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Total Penduduk */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Total Penduduk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.totalPenduduk}
              onChange={(e) => handleInputChange('totalPenduduk', e.target.value)}
              placeholder="e.g., 190"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* RT / RW */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              RT / RW <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.rtRw}
              onChange={(e) => handleInputChange('rtRw', e.target.value)}
              placeholder="e.g., 30 / 22"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Fasilitas Umum */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Fasilitas Umum <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fasilitasUmum}
              onChange={(e) => handleInputChange('fasilitasUmum', e.target.value)}
              placeholder="e.g., 5"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Organisasi Aktif */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Organisasi Aktif <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.organisasiAktif}
              onChange={(e) => handleInputChange('organisasiAktif', e.target.value)}
              placeholder="e.g., 3"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        {/* Detail Fields - Full Width */}
        <div className="space-y-4">
          {/* Fasilitas Umum Detail */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Detail Fasilitas Umum
            </label>
            <input
              type="text"
              value={formData.fasilitasUmumDetail || ''}
              onChange={(e) => handleInputChange('fasilitasUmumDetail', e.target.value)}
              placeholder="e.g., Masjid, Mushola, Balai, dan Poskamling"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Organisasi Aktif Detail */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Detail Organisasi Aktif
            </label>
            <input
              type="text"
              value={formData.organisasiAktifDetail || ''}
              onChange={(e) => handleInputChange('organisasiAktifDetail', e.target.value)}
              placeholder="e.g., Taruna Bakti, PKK, dan Kelompok Tani"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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