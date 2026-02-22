'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Card from '@/components/ui/card';

const navItems = [
  { name: 'Profil', href: '/profil' },
  { name: 'Kelembagaan', href: '/kelembagaan' },
  { name: 'UMKM', href: '/umkm' },
  { name: 'Peta & Fasilitas', href: '/peta-fasilitas' },
];

export default function DesktopNavbar() {
  const pathname = usePathname();
  const [showJavanese, setShowJavanese] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowJavanese((prev) => !prev);
    }, 10000); // Toggle setiap 20 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card 
        variant="chrome" 
        padding="none" 
        enableTilt={false} // Navbar tidak perlu tilt
        className="px-6 py-3"
      >
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/profil" className="flex items-center group">
            <span className={`font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors ${showJavanese ? 'mb-2 ml-2' : 'ml-1'}`}>
              {showJavanese ? '꧋ꦱꦸꦒꦼꦁꦫꦮꦸꦃ꧉!' : 'Selamat datang!'}
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-lg
                    text-sm font-medium
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-white/80 dark:bg-black/40 text-[var(--color-blue-uii)] dark:text-[var(--color-blue-dark-uii)] shadow-sm' 
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-white/40 dark:hover:bg-black/20'
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </Card>
      </div>
    </nav>
  );
}