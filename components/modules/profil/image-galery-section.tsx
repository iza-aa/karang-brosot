// components/modules/profil/image-galery-section.tsx
'use client';

import Card from '@/components/ui/card';
import ButtonActionPlus from '@/components/ui/button-action-plus';
import { useAdmin } from '@/lib/admin-context';
import { useState } from 'react';
import AddPhotoModal, { AddPhotoFormData } from '@/components/modals/add-photo-modal';
import type { Database } from '@/lib/supabase';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

type GalleryPhoto = Database['public']['Tables']['gallery_photos']['Row'];

interface ImageGalerySectionProps {
  photos: GalleryPhoto[];
  loading: boolean;
  onRefetch: () => Promise<void>;
}

export default function ImageGalerySection({ photos, loading, onRefetch }: ImageGalerySectionProps) {
  const { isAdmin } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddPhoto = () => {
    setIsModalOpen(true);
  };

  const handleSavePhoto = async (data: AddPhotoFormData) => {
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Gallery Photo',
          image_url: data.image,
          image_path: data.imagePath,
          description: '',
        }),
      });

      if (!response.ok) throw new Error('Failed to add photo');
      
      // Refresh data
      await onRefetch();
      setIsModalOpen(false);
      alert('Foto berhasil ditambahkan!');
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Gagal menambahkan foto');
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto ini?')) return;
    
    try {
      const response = await fetch(`/api/gallery?id=${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete photo');
      
      // Refresh data
      await onRefetch();
      alert('Foto berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Gagal menghapus foto');
    }
  };

  return (
    <section>
      <Card variant="thick" enableTilt={false} rounded={false} border={false}>
        <div className="space-y-8 container mx-auto px-4 py-8">
          {/* Header with Add Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-bold dark:text-white text-black">Galeri Desa</h2>
            {isAdmin && (
              <ButtonActionPlus
                addLabel="Tambah Foto"
                onAdd={handleAddPhoto}
              />
            )}
          </div>

          {/* Gallery Carousel */}
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              Loading...
            </div>
          ) : !photos || photos.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Belum ada foto
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {photos.map((photo) => (
                  <CarouselItem key={photo.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card
                        variant="regular"
                        padding="none"
                        enableTilt={false}
                        hover={false}
                        className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative group"
                        enableAdminControls={isAdmin}
                        onDelete={() => handleDelete(photo.id)}
                      >
                        {/* Image */}
                        <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                          {photo.image_url ? (
                            <img 
                              src={photo.image_url} 
                              alt={photo.title || 'Gallery photo'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span>{photo.title || 'No Image'}</span>
                            </div>
                          )}
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                        </div>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4 md:-left-12" />
              <CarouselNext className="-right-4 md:-right-12" />
            </Carousel>
          )}
        </div>
      </Card>

      {/* Add Photo Modal */}
      <AddPhotoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePhoto}
      />
    </section>
  );
}