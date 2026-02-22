// app/berita/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { Database } from '@/lib/supabase';

type NewsEvent = Database['public']['Tables']['news_events']['Row'];

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [news, setNews] = useState<NewsEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/news?slug=${slug}`);
        if (!response.ok) throw new Error('Berita tidak ditemukan');
        
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setNews(data.data[0]);
        } else {
          throw new Error('Berita tidak ditemukan');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchNews();
    }
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getCategoryColor = (category: string) => {
    return category === 'BERITA' ? 'bg-blue-500' : 'bg-orange-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Berita tidak ditemukan'}</p>
          <button
            onClick={() => router.push('/profil')}
            className="text-blue-900 hover:underline flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Halaman Profil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Back Button - Fixed at top */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={() => router.push('/profil')}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali ke Profil</span>
        </button>
      </div>

      {/* Hero Image - Full Width */}
      {news.image_url && (
        <div className="relative w-full h-[50vh] md:h-[60vh] bg-gray-200 dark:bg-gray-700">
          <img
            src={news.image_url}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient Overlay at Bottom */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-white dark:from-gray-900 to-transparent"></div>
        </div>
      )}

      {/* Content Section - Full Width with centered content */}
      <div className="relative bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 space-y-6">
          {/* Badge Category */}
          <div>
            <span className={`${getCategoryColor(news.category)} text-white text-sm font-semibold px-6 py-2.5 rounded-full inline-block`}>
              {news.category}
            </span>
          </div>
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(news.created_at)}</span>
            </div>
            {news.event_date && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Tanggal Acara: {formatDate(news.event_date)}</span>
              </div>
            )}
            {news.event_location && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{news.event_location}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            {news.title}
          </h1>

          {/* Main Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div 
              className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </div>

          {/* Event Details */}
          {(news.event_time_start || news.event_time_end) && (
            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Detail Acara
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                {news.event_time_start && (
                  <p>
                    <strong>Waktu Mulai:</strong> {news.event_time_start}
                  </p>
                )}
                {news.event_time_end && (
                  <p>
                    <strong>Waktu Selesai:</strong> {news.event_time_end}
                  </p>
                )}
                {news.event_location && (
                  <p>
                    <strong>Lokasi:</strong> {news.event_location}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-300 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Diterbitkan pada {formatDate(news.published_at || news.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
