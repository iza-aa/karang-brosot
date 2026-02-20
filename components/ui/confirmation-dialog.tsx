'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ButtonSave from './button-save';
import ButtonCancel from './button-cancel';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: ReactNode;
  loading?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  type = 'warning',
  icon,
  loading = false,
}: ConfirmationDialogProps) {
  
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: TrashIcon,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      confirmBg: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      icon: ExclamationTriangleIcon,
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
    },
    info: {
      icon: XMarkIcon,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      confirmBg: 'bg-blue-500 hover:bg-blue-600',
    },
  };

  const config = typeConfig[type];
  const IconComponent = (icon ? icon : config.icon) as React.ComponentType<{ className?: string }>;

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="
            bg-white dark:bg-gray-800 
            rounded-xl shadow-2xl 
            max-w-md w-full 
            pointer-events-auto
            overflow-hidden
          "
        >
          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center
                ${config.iconBg}
              `}>
                <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">
              {title}
            </h3>

            {/* Message */}
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
              {message}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <ButtonCancel onClick={onClose} />
              
              <motion.button
                onClick={handleConfirm}
                disabled={loading}
                className={`
                  px-6 py-2 rounded-lg text-white font-semibold
                  transition-all duration-200 shadow-md hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${config.confirmBg}
                `}
                whileHover={!loading ? { scale: 1.05 } : {}}
                whileTap={!loading ? { scale: 0.95 } : {}}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" cy="12" r="10" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="none"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  confirmLabel
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// Hook untuk easier usage
export function useConfirmDialog() {
  return {
    confirm: (props: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>) => {
      return new Promise<boolean>((resolve) => {
        // Implementasi menggunakan state management atau portal
        // Untuk sekarang, return manual implementation needed
        resolve(window.confirm(props.message as string));
      });
    }
  };
}
