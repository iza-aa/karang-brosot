'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ContentCardProps {
  children: ReactNode;
}

export default function ContentCard({ children }: ContentCardProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "start start"]
  });

  // Card slides up from bottom as user scrolls
  const cardY = useTransform(scrollYProgress, [0, 1], [400, 0]);

  return (
    <motion.div 
      ref={targetRef}
      style={{ y: cardY }}
      className="relative min-h-[70vh] bg-white/30 dark:bg-black/30 backdrop-blur-xl rounded-t-[40px] w-full"
    >
      <div className="container mx-auto px-4 py-12">
        {children}
      </div>
    </motion.div>
  );
}
