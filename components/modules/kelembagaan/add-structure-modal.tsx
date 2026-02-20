'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type { AddOrgStructureForm } from '@/types';
import ModalLayout from '@/components/modals/modal-layout';
import ButtonCancel from '@/components/ui/button-cancel';
import ButtonSave from '@/components/ui/button-save';

interface AddStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddOrgStructureForm) => Promise<void> | void;
}

export default function AddStructureModal({ isOpen, onClose, onSave }: AddStructureModalProps) {
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddOrgStructureForm>({
    defaultValues: {
      name: '',
      description: '',
      color: '#03337B',
      icon: '',
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      setSaving(true);
      await onSave({
        name: values.name,
        description: values.description || undefined,
        color: values.color,
        icon: values.icon || undefined,
      });
      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  });

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} title="Tambah Struktur" size="md" scrollActive={true}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Nama Struktur</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            placeholder="Mis: BPD, LPMK, Karang Taruna"
            {...register('name', { required: 'Nama wajib diisi' })}
          />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Deskripsi (opsional)</label>
          <textarea
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-[110px]"
            placeholder="Keterangan singkat"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Warna</label>
            <input
              type="color"
              className="h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1"
              {...register('color', { required: 'Warna wajib diisi' })}
            />
            {errors.color && <p className="text-sm text-red-600 mt-1">{errors.color.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Icon (opsional)</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              placeholder="Mis: building, users"
              {...register('icon')}
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <ButtonCancel onClick={onClose} />
          <ButtonSave onClick={submit} disabled={saving} />
        </div>
      </form>
    </ModalLayout>
  );
}
