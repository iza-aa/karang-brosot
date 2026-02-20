// app/profil/page.tsx
'use client';

import { useState } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card";
import HeroSection from "@/components/modules/profil/hero-section";
import ContentCard from "@/components/modules/profil/content-card";
import ImageGalerySection from '@/components/modules/profil/image-galery-section';
import NewsSection from '@/components/modules/profil/news-section';
import ButtonActionPlus from '@/components/ui/button-action-plus';
import EditInfoboxModal, { type InfoboxData } from '@/components/modals/edit-infobox-modal';
import EditAboutModal, { type AboutData } from '@/components/modals/edit-about-modal';
import { useAdmin } from '@/lib/admin-context';
import { useInfoboxStats, useAboutContents, useGalleryPhotos, useNews } from '@/lib/hooks/useData';

export default function ProfilPage() {
  const { isAdmin } = useAdmin();
  const { data: infoboxData, loading: infoboxLoading, refetch: refetchInfobox } = useInfoboxStats();
  const { data: aboutData, loading: aboutLoading, refetch: refetchAbout } = useAboutContents();
  const { data: galleryData, loading: galleryLoading, refetch: refetchGallery } = useGalleryPhotos();
  const { data: newsData, loading: newsLoading, refetch: refetchNews } = useNews();
  const [isInfoboxModalOpen, setIsInfoboxModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const handleSaveInfobox = async (data: InfoboxData) => {
    try {
      const response = await fetch('/api/infobox', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          luas_wilayah: data.luasWilayah,
          kartu_keluarga: data.kartuKeluarga,
          total_penduduk: data.totalPenduduk,
          rt_rw: data.rtRw,
          fasilitas_umum: data.fasilitasUmum,
          fasilitas_umum_detail: data.fasilitasUmumDetail,
          organisasi_aktif: data.organisasiAktif,
          organisasi_aktif_detail: data.organisasiAktifDetail,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');
      
      // Refresh data
      await refetchInfobox();
      alert('Data berhasil diupdate!');
    } catch (error) {
      console.error('Error saving infobox:', error);
      alert('Gagal menyimpan data');
    }
  };

  const handleSaveAbout = async (data: AboutData) => {
    try {
      const response = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [
            {
              card_type: 'ultra_thin',
              title: data.ultraThinTitle,
              description: data.ultraThinDescription,
              content: data.ultraThinContent,
            },
            {
              card_type: 'thin',
              title: data.thinTitle,
              description: data.thinDescription,
              content: data.thinContent,
            },
            {
              card_type: 'regular',
              title: data.regularTitle,
              description: data.regularDescription,
              content: data.regularContent,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error('Failed to update');
      
      // Refresh data
      await refetchAbout();
      alert('Konten berhasil diupdate!');
    } catch (error) {
      console.error('Error saving about:', error);
      alert('Gagal menyimpan konten');
    }
  };

  return (
    <>
      <HeroSection />
      
      <ContentCard>
        <div className="max-w-8xl mx-auto space-y-3 mt-20">
          
          {/* Infobox Section */}
          <section>
            {/* Header with Edit Button - Only show for admin */}
            {isAdmin && (
              <div className="flex items-center mb-3 justify-end">
                <ButtonActionPlus
                  addLabel="Edit Infobox"
                  onAdd={() => setIsInfoboxModalOpen(true)}
                  showIcon={false}
                />
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-3">
              <Card variant="thin" className="text-center" hover>
                <div className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
                  {infoboxLoading ? '...' : infoboxData?.luas_wilayah || '0 km²'}
                </div>
                <CardTitle>Luas Wilayah</CardTitle>
                <CardDescription>
                  {infoboxData?.fasilitas_umum_detail || 'Total luas pemukiman'}
                </CardDescription>
              </Card>

              <Card variant="thin" className="text-center" hover>
                <div className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
                  {infoboxLoading ? '...' : infoboxData?.kartu_keluarga || '0'}
                </div>
                <CardTitle>Kartu Keluarga</CardTitle>
                <CardDescription>Total kartu keluarga yang terdaftar</CardDescription>
              </Card>

              <Card variant="thin" className="text-center" hover>
                <div className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
                  {infoboxLoading ? '...' : infoboxData?.total_penduduk || '0'}
                </div>
                <CardTitle>Total Penduduk</CardTitle>
                <CardDescription>Total warga yang terdaftar</CardDescription>
              </Card>

              <Card variant="thin" className="text-center" hover>
                <div className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
                  {infoboxLoading ? '...' : infoboxData?.rt_rw || '0 / 0'}
                </div>
                <CardTitle>RT / RW</CardTitle>
                <CardDescription>Data tahun 2026</CardDescription>
              </Card>

              <Card variant="thin" className="text-center" hover>
                <div className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
                  {infoboxLoading ? '...' : infoboxData?.fasilitas_umum || '0'}
                </div>
                <CardTitle>Fasilitas Umum</CardTitle>
                <CardDescription>
                  {infoboxData?.fasilitas_umum_detail || 'Masjid, Mushola, Balai, dan Poskamling'}
                </CardDescription>
              </Card>

              <Card variant="thin" className="text-center" hover>
                <div className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
                  {infoboxLoading ? '...' : infoboxData?.organisasi_aktif || '0'}
                </div>
                <CardTitle>Organisasi Aktif</CardTitle>
                <CardDescription>
                  {infoboxData?.organisasi_aktif_detail || 'Taruna Bakti, PKK, dan Kelompok Tani'}
                </CardDescription>
              </Card>
            </div>
          </section>

          {/* About Section */}
          <section>
            {/* Header with Edit Button - Only show for admin */}
            {isAdmin && (
              <div className="flex items-center mb-3 justify-end">
                <ButtonActionPlus
                  addLabel="Edit Konten"
                  onAdd={() => setIsAboutModalOpen(true)}
                  showIcon={false}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-3">
              <Card variant="ultraThin">
                <CardHeader>
                  <CardTitle>
                    {aboutLoading ? '...' : (aboutData?.find(d => d.card_type === 'ultra_thin')?.title || 'Ultra Thin')}
                  </CardTitle>
                  <CardDescription>
                    {aboutLoading ? '...' : (aboutData?.find(d => d.card_type === 'ultra_thin')?.description || 'Paling ringan')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {aboutLoading ? '...' : (aboutData?.find(d => d.card_type === 'ultra_thin')?.content || 'Blur 20px - seperti Control Center iOS')}
                  </p>
                </CardContent>
              </Card>

              <Card variant="thin" hover>
                <CardHeader>
                  <CardTitle>
                    {aboutLoading ? '...' : (aboutData?.find(d => d.card_type === 'thin')?.title || 'Thin')}
                  </CardTitle>
                  <CardDescription>
                    {aboutLoading ? '...' : (aboutData?.find(d => d.card_type === 'thin')?.description || 'Blur sedang')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {aboutLoading ? '...' : (aboutData?.find(d => d.card_type === 'thin')?.content || 'Blur 30px - dengan hover effect')}
                  </p>
                </CardContent>
              </Card>

              <Card variant="regular">
                <CardHeader>
                  <CardTitle>
                    {aboutLoading ? '...' : (aboutData?.find(d => d.card_type === 'regular')?.title || 'Regular')}
                  </CardTitle>
                  <CardDescription>
                    {aboutLoading ? '...' : (aboutData?.find(d => d.card_type === 'regular')?.description || 'Default iOS')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {aboutLoading ? '...' : (aboutData?.find(d => d.card_type === 'regular')?.content || 'Blur 40px - widget iOS standard')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </ContentCard>

      <ImageGalerySection 
        photos={galleryData || []} 
        loading={galleryLoading}
        onRefetch={refetchGallery}
      />
      <NewsSection 
        news={newsData || []} 
        loading={newsLoading}
        onRefetch={refetchNews}
      />

      {/* Modals */}
      <EditInfoboxModal
        isOpen={isInfoboxModalOpen}
        onClose={() => setIsInfoboxModalOpen(false)}
        onSave={handleSaveInfobox}
        initialData={infoboxData ? {
          luasWilayah: infoboxData.luas_wilayah,
          kartuKeluarga: infoboxData.kartu_keluarga,
          totalPenduduk: infoboxData.total_penduduk,
          rtRw: infoboxData.rt_rw,
          fasilitasUmum: infoboxData.fasilitas_umum,
          fasilitasUmumDetail: infoboxData.fasilitas_umum_detail || '',
          organisasiAktif: infoboxData.organisasi_aktif,
          organisasiAktifDetail: infoboxData.organisasi_aktif_detail || '',
        } : null}
      />

      <EditAboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onSave={handleSaveAbout}
        initialData={aboutData ? {
          ultraThinTitle: aboutData.find(d => d.card_type === 'ultra_thin')?.title || '',
          ultraThinDescription: aboutData.find(d => d.card_type === 'ultra_thin')?.description || '',
          ultraThinContent: aboutData.find(d => d.card_type === 'ultra_thin')?.content || '',
          thinTitle: aboutData.find(d => d.card_type === 'thin')?.title || '',
          thinDescription: aboutData.find(d => d.card_type === 'thin')?.description || '',
          thinContent: aboutData.find(d => d.card_type === 'thin')?.content || '',
          regularTitle: aboutData.find(d => d.card_type === 'regular')?.title || '',
          regularDescription: aboutData.find(d => d.card_type === 'regular')?.description || '',
          regularContent: aboutData.find(d => d.card_type === 'regular')?.content || '',
        } : null}
      />
    </>
  );
}