'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Card from '@/components/ui/card';

const navItems = [
  { name: 'Profil', href: '/profil' },
  { name: 'Kelembagaan', href: '/kelembagaan' },
  { name: 'Peta & Fasilitas', href: '/peta-fasilitas' },
];

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
    const [showJavanese, setShowJavanese] = useState(true);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setShowJavanese((prev) => !prev);
      }, 10000); // Toggle setiap 20 detik
  
      return () => clearInterval(interval);
    }, []); 

  return (
    <>
      {/* Top Bar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 p-4">
        <Card 
          variant="chrome" 
          padding="none"
          enableTilt={false}
          className="px-4 py-3"
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/profil" className="flex items-center group">
              <span className={`font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors ${showJavanese ? 'mb-2 ml-2' : 'ml-1'}`}>
                {showJavanese ? '꧋ꦱꦸꦒꦼꦁꦫꦮꦸꦃ꧉!' : 'Selamat datang!'}
              </span>
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-black/20 transition-colors"
              aria-label="Toggle menu"
            >
              <span className={`w-5 h-0.5 bg-zinc-900 dark:bg-white transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-5 h-0.5 bg-zinc-900 dark:bg-white transition-all ${isOpen ? 'opacity-0' : ''}`} />
              <span className={`w-5 h-0.5 bg-zinc-900 dark:bg-white transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </Card>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden fixed top-20 left-0 right-0 z-40 p-4">
          <Card 
            variant="chrome" 
            padding="sm"
            enableTilt={false}
            className="animate-in slide-in-from-top-5 duration-200"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      px-4 py-3 rounded-lg
                      font-medium text-left
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-white/80 dark:bg-black/40 text-blue-600 dark:text-blue-400' 
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-white/40 dark:hover:bg-black/20'
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}