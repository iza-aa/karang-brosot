import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout/layout-wrapper";
import { AdminProvider } from "@/lib/admin-context";
import { ToastProvider } from "@/components/ui/toast";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Pedukuhan Karang Brosot",
  description: "Website Profil Pedukuhan dengan WebGIS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scrollbar-hide">
      <body
        className={`${plusJakarta.variable} antialiased scrollbar-hide`}
      >
        {/* Fixed Background - TIDAK SCROLL */}
        <div className="fixed inset-0 bg-gradient-to-br from-[var(--color-blue-uii)] to-white dark:from-[var(--color-blue-dark-uii)] dark:to-[var(--color-yellow-dark-uii)] transition-colors -z-10" />
        
        <ToastProvider>
          <AdminProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AdminProvider>
        </ToastProvider>
      </body>
    </html>
  );
}