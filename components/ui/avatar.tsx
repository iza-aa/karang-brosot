'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBadge?: boolean;
  badgeColor?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

export default function Avatar({ 
  src, 
  name, 
  size = 'md', 
  className = '',
  showBadge = false,
  badgeColor = 'bg-green-500',
  onClick
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Get initials from name (max 2 chars)
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const showImage = src && !imageError;

  return (
    <motion.div
      className={`relative inline-block ${onClick ? 'cursor-pointer' : ''}`}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
    >
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          overflow-hidden
          flex items-center justify-center
          font-semibold
          transition-all duration-200
          ${showImage 
            ? 'bg-gray-200 dark:bg-gray-700' 
            : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
          }
          ${className}
        `}
      >
        {showImage ? (
          <Image
            src={src}
            alt={name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {/* Status Badge */}
      {showBadge && (
        <span
          className={`
            absolute bottom-0 right-0
            ${size === 'xs' || size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}
            ${badgeColor}
            rounded-full
            ring-2 ring-white dark:ring-gray-900
          `}
        />
      )}
    </motion.div>
  );
}
