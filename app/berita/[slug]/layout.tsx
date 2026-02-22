'use client';

import ThemeToggle from '@/components/ui/theme-toggle';

export default function BeritaDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeToggle />
      {children}
    </>
  );
}
