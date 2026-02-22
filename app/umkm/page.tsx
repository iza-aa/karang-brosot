'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/card';
import ButtonActionPlus from '@/components/ui/button-action-plus';
import { useAdmin } from '@/lib/admin-context';
import AddUmkmModal, { UmkmFormData, UmkmData } from '@/components/modals/add-umkm-modal';

export default function UmkmPage() {
  const { isAdmin } = useAdmin();
  const [umkmList, setUmkmList] = useState<UmkmData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUmkm, setEditingUmkm] = useState<UmkmData | null>(null);

  useEffect(() => {
    fetchUmkm();
  }, []);

  const fetchUmkm = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/umkm');
      const result = await response.json();
      setUmkmList(result.data || []);
    } catch (error) {
      console.error('Error fetching UMKM:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUmkm(null);
    setIsModalOpen(true);
  };

  const handleEdit = (umkm: UmkmData) => {
    setEditingUmkm(umkm);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus UMKM ini?')) return;

    try {
      const response = await fetch(`/api/umkm?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      alert('UMKM berhasil dihapus!');
      await fetchUmkm();
    } catch (error) {
      console.error('Error deleting UMKM:', error);
      alert('Gagal menghapus UMKM');
    }
  };

  const handleSave = async (data: UmkmFormData) => {
    try {
      const url = '/api/umkm';
      const method = editingUmkm ? 'PUT' : 'POST';
      
      const body: any = {
        nama_usaha: data.nama_usaha,
        kategori: data.kategori,
        deskripsi: data.deskripsi,
        nama_pemilik: data.nama_pemilik,
        nomor_telepon: data.nomor_telepon,
        email: data.email,
        alamat: data.alamat,
        foto_url: data.foto_url,
        foto_path: data.foto_path,
        whatsapp: data.whatsapp,
        instagram: data.instagram,
        jam_operasional: data.jam_operasional,
        harga_range: data.harga_range,
        tahun_berdiri: data.tahun_berdiri ? parseInt(data.tahun_berdiri) : null,
        is_featured: data.is_featured,
      };

      if (editingUmkm) {
        body.id = editingUmkm.id;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save');

      alert(editingUmkm ? 'UMKM berhasil diupdate!' : 'UMKM berhasil ditambahkan!');
      setIsModalOpen(false);
      setEditingUmkm(null);
      await fetchUmkm();
    } catch (error) {
      console.error('Error saving UMKM:', error);
      alert('Gagal menyimpan UMKM');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            UMKM Padukuhan
          </h1>
          <p className="text-gray-900 dark:text-white text-lg">
            Dukung usaha lokal di sekitar kita
          </p>
        </div>

        {/* Add Button for Admin */}
        {isAdmin && (
          <div className="flex justify-end mb-6">
            <ButtonActionPlus
              addLabel="Tambah UMKM"
              onAdd={handleAdd}
            />
          </div>
        )}

        {/* Content - Table */}
        <div className="mt-8">
          {loading ? (
            <div className="text-center text-gray-900 dark:text-white py-12">
              Loading...
            </div>
          ) : umkmList.length === 0 ? (
            <div className="text-center text-gray-900 dark:text-white py-12">
              Belum ada data UMKM
            </div>
          ) : (
            <Card variant="thick" padding="none" enableTilt={false}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Nama Usaha
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Kategori
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Pemilik
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Kontak
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Alamat
                      </th>
                      {isAdmin && (
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          Aksi
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {umkmList.map((umkm) => (
                      <tr 
                        key={umkm.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {umkm.foto_url && (
                              <img 
                                src={umkm.foto_url} 
                                alt={umkm.nama_usaha}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {umkm.nama_usaha}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                            {umkm.kategori}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {umkm.nama_pemilik}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-sm">
                            {umkm.whatsapp && (
                              <a
                                href={`https://wa.me/${umkm.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                WhatsApp
                              </a>
                            )}
                            {umkm.nomor_telepon && (
                              <a
                                href={`tel:${umkm.nomor_telepon}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {umkm.nomor_telepon}
                              </a>
                            )}
                            {umkm.instagram && (
                              <a
                                href={`https://instagram.com/${umkm.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                                @{umkm.instagram.replace('@', '')}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs">
                          <div className="line-clamp-2">{umkm.alamat || '-'}</div>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(umkm)}
                                className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(umkm.id)}
                                className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddUmkmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUmkm(null);
        }}
        onSave={handleSave}
        initialData={editingUmkm}
      />
    </div>
  );
}
