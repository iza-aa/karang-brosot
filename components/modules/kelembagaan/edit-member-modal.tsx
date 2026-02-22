'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { OrgTreeNode } from '@/types';
import ModalLayout from '@/components/modals/modal-layout';
import ButtonCancel from '@/components/ui/button-cancel';
import ButtonSave from '@/components/ui/button-save';
import { compressImage, validateImageFile, getFileSizeKB } from '@/lib/image-compressor';

type EditMemberValues = {
  name: string;
  position: string;
  role: string;
};

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: OrgTreeNode | null;
  onSave: (memberId: string, values: EditMemberValues, photoFile?: File) => Promise<void> | void;
}

export default function EditMemberModal({ isOpen, onClose, member, onSave }: EditMemberModalProps) {
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | undefined>(undefined);
  const [compressionInfo, setCompressionInfo] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditMemberValues>({
    defaultValues: {
      name: member?.name ?? '',
      position: member?.position ?? '',
      role: member?.role ?? '',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: member?.name ?? '',
      position: member?.position ?? '',
      role: member?.role ?? '',
    });
    setPhotoFile(undefined);
    setCompressionInfo('');
  }, [isOpen, member, reset]);

  const submit = handleSubmit(async (values) => {
    if (!member) return;

    try {
      setSaving(true);
      await onSave(
        member.id,
        {
          name: values.name,
          position: values.position,
          role: values.role,
        },
        photoFile
      );
      onClose();
    } finally {
      setSaving(false);
    }
  });

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} title="Edit Anggota" size="lg" scrollActive={true}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Nama</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              {...register('name', { required: 'Nama wajib diisi' })}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Jabatan</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              {...register('position', { required: 'Jabatan wajib diisi' })}
            />
            {errors.position && <p className="text-sm text-red-600 mt-1">{errors.position.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Peran</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Mis: Ketua, Sekretaris, Anggota"
            {...register('role', { required: 'Peran wajib diisi' })}
          />
          {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Ganti Foto (opsional)</label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-sm"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) {
                setPhotoFile(undefined);
                setCompressionInfo('');
                return;
              }

              try {
                // Validate file
                validateImageFile(file, 10); // Max 10MB

                const originalSize = getFileSizeKB(file);
                setCompressionInfo(`Original: ${originalSize}KB - Compressing...`);

                // Compress image
                const compressedFile = await compressImage(file, {
                  maxWidth: 800,
                  maxHeight: 800,
                  quality: 0.85,
                });

                const compressedSize = getFileSizeKB(compressedFile);

                // Use compressed only if it's actually smaller
                let finalFile = compressedFile;
                let infoMessage = '';

                if (compressedSize < originalSize) {
                  const savings = Math.round(((originalSize - compressedSize) / originalSize) * 100);
                  infoMessage = `Original: ${originalSize}KB → Compressed: ${compressedSize}KB (${savings}% lebih kecil) ✅`;
                } else {
                  // Compressed file is larger, use original
                  finalFile = file;
                  infoMessage = `${originalSize}KB (Sudah optimal)`;
                }

                setCompressionInfo(infoMessage);
                setPhotoFile(finalFile);
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Gagal memproses gambar';
                setCompressionInfo(`❌ ${errorMessage}`);
                setPhotoFile(undefined);
              }
            }}
          />
          {compressionInfo && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{compressionInfo}</p>
          )}
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <ButtonCancel onClick={onClose} />
          <ButtonSave onClick={submit} disabled={saving} />
        </div>
      </form>
    </ModalLayout>
  );
}
