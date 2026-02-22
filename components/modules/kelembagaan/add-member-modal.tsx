'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { AddOrgMemberForm, OrgTreeNode } from '@/types';
import ModalLayout from '@/components/modals/modal-layout';
import ButtonCancel from '@/components/ui/button-cancel';
import ButtonSave from '@/components/ui/button-save';
import { compressImage, validateImageFile, getFileSizeKB } from '@/lib/image-compressor';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddOrgMemberForm, photoFile?: File) => Promise<void> | void;
  structureId: string;
  parentId?: string;
  parentMember?: OrgTreeNode | undefined;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSave,
  structureId,
  parentId,
  parentMember,
}: AddMemberModalProps) {
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | undefined>(undefined);
  const [compressionInfo, setCompressionInfo] = useState<string>('');

  const defaultValues = useMemo<Partial<AddOrgMemberForm>>(
    () => ({
      structure_id: structureId,
      parent_id: parentId ?? null,
      name: '',
      position: '',
      role: '',
      photo: null,
    }),
    [parentId, structureId]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddOrgMemberForm>({
    defaultValues: defaultValues as AddOrgMemberForm,
  });

  const submit = handleSubmit(async (values) => {
    try {
      setSaving(true);
      await onSave(
        {
          structure_id: structureId,
          parent_id: parentId ?? null,
          name: values.name,
          position: values.position,
          role: values.role,
          photo: null,
        } as any,
        photoFile
      );
      reset(defaultValues as AddOrgMemberForm);
      setPhotoFile(undefined);
      setCompressionInfo('');
      onClose();
    } finally {
      setSaving(false);
    }
  });

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} title="Tambah Anggota" size="lg" scrollActive={true}>
      <form onSubmit={submit} className="space-y-4">
        {parentMember && (
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-300">Induk</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">{parentMember.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{parentMember.position}</div>
          </div>
        )}

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
          <label className="block text-sm font-semibold text-blue-500 mb-2">Foto (opsional)</label>
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
