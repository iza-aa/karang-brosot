// components/modules/profil/news-section.tsx
'use client';

import Card from '@/components/ui/card';
import ButtonActionPlus from '@/components/ui/button-action-plus';
import { useAdmin } from '@/lib/admin-context';
import { useState, useMemo } from 'react';
import AddNewsEventModal, { NewsEventFormData } from '@/components/modals/add-news-event-modal';
import type { Database } from '@/lib/supabase';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

type NewsEvent = Database['public']['Tables']['news_events']['Row'];

interface NewsSectionProps {
  news: NewsEvent[];
  loading: boolean;
  onRefetch: () => Promise<void>;
}

export default function NewsSection({ news, loading, onRefetch }: NewsSectionProps) {
  const { isAdmin } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Calculate pagination
  const totalPages = Math.ceil(news.length / itemsPerPage);
  const paginatedNews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return news.slice(startIndex, endIndex);
  }, [news, currentPage]);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handleEdit = (newsId: string) => {
    console.log('Edit news:', newsId);
    // TODO: Implement edit functionality with modal
  };

  const handleDelete = async (newsId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus berita ini?')) return;
    
    try {
      const response = await fetch(`/api/news?id=${newsId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete news');
      
      // Refresh data
      await onRefetch();
      alert('Berita berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Gagal menghapus berita');
    }
  };

  const handleAddNews = () => {
    setIsModalOpen(true);
  };

  const handleSaveNews = async (data: NewsEventFormData) => {
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          content: data.description || '',
          description: data.description,
          category: data.category,
          image_url: data.image,
          image_path: data.imagePath,
          event_date: data.date || null,
          is_published: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to add news');
      
      // Refresh data
      await onRefetch();
      setIsModalOpen(false);
      alert('Berita berhasil ditambahkan!');
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Gagal menambahkan berita');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    return category === 'BERITA' ? 'bg-blue-500' : 'bg-orange-500';
  };

  return (
    <section>
      <Card variant="ultraThin" enableTilt={false} rounded={false} border={false} >
        <div className="space-y-8 container mx-auto px-4 py-12">
          {/* Header with Add Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-bold dark:text-white text-black">Berita Terkini</h2>
            {isAdmin && (
              <ButtonActionPlus
                addLabel="Tambah Berita"
                onAdd={handleAddNews}
              />
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                Loading...
              </div>
            ) : news.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                Belum ada berita
              </div>
            ) : (
              paginatedNews.map((item) => (
                <Card 
                  variant='thick' 
                  padding='none' 
                  enableTilt={false} 
                  hover={false} 
                  border={false}
                  key={item.id}
                  className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative"
                  enableAdminControls={isAdmin}
                  onEdit={() => handleEdit(item.id)}
                  onDelete={() => handleDelete(item.id)}
                >
                  {/* Image Section */}
                  <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`${getCategoryColor(item.category)} text-white text-xs font-semibold px-4 py-2 rounded-full`}>
                        {item.category}
                      </span>
                    </div>
                    
                    {/* Image */}
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span>No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6 space-y-4">
                    {/* Date & Time */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 font-medium">
                      <p>{formatDate(item.created_at)}</p>
                      {item.event_date && (
                        <p className="text-xs">{formatDate(item.event_date)}</p>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                      {item.description || item.content.substring(0, 150) + '...'}
                    </p>

                    {/* Button */}
                    <button className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200">
                      Baca Artikel
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && news.length > itemsPerPage && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((pageNum, index) => (
                    <PaginationItem key={index}>
                      {pageNum === '...' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum as number);
                          }}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </Card>

      {/* Add News/Event Modal */}
      <AddNewsEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNews}
      />
    </section>
  );
}
