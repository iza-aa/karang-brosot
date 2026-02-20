'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function HeroSection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  // Text slides up and fades out as user scrolls
  const textY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);

  return (
    <section ref={targetRef} className="h-[64vh] md:h-[63.5vh] flex items-center justify-center relative overflow-hidden pt-35">

      {/* Hero Content - Animated */}
      <motion.div 
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 text-center px-4"
      >
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
          Pedukuhan Karang Brosot
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg">
          Kecamatan Galur, Kabupaten Kulon Progo
        </p>
        <div className="flex justify-center gap-4">
          <div className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <p className="text-white font-medium">Daerah Istimewa Yogyakarta</p>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity: textOpacity }}
        className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 z-10 animate-bounce"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  );
}
