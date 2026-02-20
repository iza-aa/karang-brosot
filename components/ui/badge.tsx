'use client';

import { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface BadgeProps {
  children: ReactNode;
  variant?: 'solid' | 'outline' | 'soft';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'full';
  className?: string;
  icon?: ReactNode;
  onRemove?: () => void;
  pulse?: boolean;
}

const colorClasses = {
  solid: {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    red: 'bg-red-500 text-white',
    purple: 'bg-purple-500 text-white',
    gray: 'bg-gray-500 text-white',
    orange: 'bg-orange-500 text-white',
  },
  outline: {
    blue: 'border-2 border-blue-500 text-blue-500',
    green: 'border-2 border-green-500 text-green-500',
    yellow: 'border-2 border-yellow-500 text-yellow-500',
    red: 'border-2 border-red-500 text-red-500',
    purple: 'border-2 border-purple-500 text-purple-500',
    gray: 'border-2 border-gray-500 text-gray-500',
    orange: 'border-2 border-orange-500 text-orange-500',
  },
  soft: {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const roundedClasses = {
  sm: 'rounded',
  md: 'rounded-md',
  full: 'rounded-full',
};

export default function Badge({
  children,
  variant = 'solid',
  color = 'blue',
  size = 'md',
  rounded = 'full',
  className = '',
  icon,
  onRemove,
  pulse = false,
}: BadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-1.5
        font-medium
        transition-all duration-200
        ${colorClasses[variant][color]}
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Remove badge"
        >
          <XMarkIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.span>
  );
}
