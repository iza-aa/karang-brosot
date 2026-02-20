'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/header/header';
import ThemeToggle from '@/components/ui/theme-toggle';
import Footer from '@/components/layout/footer/footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Halaman yang tidak menampilkan Header dan Footer
  const hideLayout = pathname === '/login' || pathname.startsWith('/admin/login');

  // Halaman yang tetap pakai Header tapi tanpa Footer
  const hideFooter = pathname === '/kelembagaan';

  if (hideLayout) {
    return (
      <>
        <ThemeToggle />
        {children}
      </>
    );
  }

  return (
    <>
      <Header />
      <ThemeToggle />
      <div className="min-h-screen pt-10">
        {children}
      </div>
      {!hideFooter && <Footer />}
    </>
  );
}
