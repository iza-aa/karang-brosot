'use client';

import Image from 'next/image';
import { EnvelopeIcon, PhoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="relative bg-white/30 dark:bg-black/30 backdrop-blur-xl border-t border-[var(--color-blue-uii)] dark:border-white/10 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 scale-110">
        <Image
          src="/kpg-footer.png"
          alt="Karang Brosot"
          fill
          className="object-cover opacity-20 dark:opacity-10"
          priority
        />
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Column 1: Info BSI */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 relative flex-shrink-0 flex items-center justify-center">
                <Image
                  src="/taruna-logo.png"
                  alt="Logo Karang Brosot"
                  width={50}
                  height={50}
                  className="object-contain mb-2"
                />
              </div>
              <div>
                <h3 className="text-[var(--color-blue-uii)] dark:text-white font-bold text-lg">
                  Pedukuhan Karang Brosot
                </h3>
                <p className="text-[var(--color-blue-uii)]/90 dark:text-white/90 text-sm">
                  Kecamatan xxx, Kabupaten xxx
                </p>
              </div>
            </div>

            <div className="text-[var(--color-blue-uii)]/80 dark:text-white/80 text-sm space-y-2">
              <p>Pedukuhan Karang Brosot</p>
              <p>Karang, Brosot, Kec. Galur, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55661</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 pt-4">
              <a 
                href="tel:+622748898444"
                className="flex items-center gap-3 text-[var(--color-blue-uii)] dark:text-white hover:text-[var(--color-blue-uii)]/70 dark:hover:text-white/70 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-blue-uii)]/20 dark:bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[var(--color-blue-uii)]/30 dark:group-hover:bg-white/30 transition-all">
                  <PhoneIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs opacity-70">Telepon</p>
                  <p className="text-sm font-medium">+62 xxx xxxx xxxx</p>
                </div>
              </a>

              <a 
                href="https://wa.me/6281244414414"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[var(--color-blue-uii)] dark:text-white hover:text-[var(--color-blue-uii)]/70 dark:hover:text-white/70 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-blue-uii)]/20 dark:bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[var(--color-blue-uii)]/30 dark:group-hover:bg-white/30 transition-all">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs opacity-70">WhatsApp</p>
                  <p className="text-sm font-medium">08xx xxxx xxxx</p>
                </div>
              </a>

              <a 
                href="mailto:itsupport@uii.ac.id"
                className="flex items-center gap-3 text-[var(--color-blue-uii)] dark:text-white hover:text-[var(--color-blue-uii)]/70 dark:hover:text-white/70 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-blue-uii)]/20 dark:bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[var(--color-blue-uii)]/30 dark:group-hover:bg-white/30 transition-all">
                  <EnvelopeIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs opacity-70">Email</p>
                  <p className="text-sm font-medium">pedukuhan.karangbrosot@xxx.go.id</p>
                </div>
              </a>
            </div>
          </div>

          {/* Column 2: Social Media */}
          <div className="space-y-4">
            <h3 className="text-[var(--color-blue-uii)] dark:text-white font-bold text-lg">
              Media Sosial Kami
            </h3>

            <div className="space-y-3">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-2xl bg-[var(--color-blue-uii)]/10 dark:bg-white/10 backdrop-blur-md border border-[var(--color-blue-uii)]/20 dark:border-white/20 hover:bg-[var(--color-blue-uii)]/20 dark:hover:bg-white/20 hover:border-[var(--color-blue-uii)] dark:hover:border-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-blue-uii)]/20 dark:bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--color-blue-uii)] dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[var(--color-blue-uii)] dark:text-white font-semibold">Instagram</p>
                    <p className="text-[var(--color-blue-uii)]/70 dark:text-white/70 text-sm">@tarunabhakti_karang</p>
                  </div>
                </div>
              </a>

              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-2xl bg-[var(--color-blue-uii)]/10 dark:bg-white/10 backdrop-blur-md border border-[var(--color-blue-uii)]/20 dark:border-white/20 hover:bg-[var(--color-blue-uii)]/20 dark:hover:bg-white/20 hover:border-[var(--color-blue-uii)] dark:hover:border-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-blue-uii)]/20 dark:bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--color-blue-uii)] dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[var(--color-blue-uii)] dark:text-white font-semibold">TikTok</p>
                    <p className="text-[var(--color-blue-uii)]/70 dark:text-white/70 text-sm">@taruna.bhakti9karang</p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Column 3: Location Map */}
          <div className="space-y-4">
            <h3 className="text-[var(--color-blue-uii)] dark:text-white font-bold text-lg">Lokasi Kami</h3>
            
            <div className="rounded-2xl overflow-hidden border border-[var(--color-blue-uii)]/20 dark:border-white/20 bg-[var(--color-blue-uii)]/10 dark:bg-white/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11800.174401167385!2d110.22058185133159!3d-7.946461200905694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7afddc57e0f921%3A0x5ac9b57cc80dfd84!2sKarang%2C%20Brosot%2C%20Kec.%20Galur%2C%20Kabupaten%20Kulon%20Progo%2C%20Daerah%20Istimewa%20Yogyakarta!5e0!3m2!1sid!2sid!4v1770410090430!5m2!1sid!2sid"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-[var(--color-blue-uii)]/20 dark:border-white/20 bg-white/20 dark:bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
           <Image src="/logo-uii.png" width={32} height={32} alt="Logo Universitas Islam Indonesia" />
            <p className="text-[var(--color-blue-uii)] dark:text-white text-sm text-left">
            © Pedukuhan Karang Brosot - KKN 2026 Universitas Islam Indonesia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}