'use client';

import { PencilIcon, EyeIcon, EyeSlashIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface ButtonActionProps {
  isVisible?: boolean;
  onEdit?: () => void;
  onToggleVisibility?: () => void;
  onDelete?: () => void;
}

export default function ButtonAction({ 
  isVisible, 
  onEdit, 
  onToggleVisibility,
  onDelete
}: ButtonActionProps) {
  return (
    <motion.div 
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Edit Button */}
      {onEdit && (
        <motion.button
          onClick={onEdit}
          className="p-2 rounded-lg bg-[var(--color-blue-uii)] hover:bg-blue-600 text-white transition-all duration-200 shadow-md hover:shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Edit"
        >
          <PencilIcon className="w-5 h-5" />
        </motion.button>
      )}

      {/* Visibility Toggle Button */}
      {onToggleVisibility && (
        <motion.button
          onClick={onToggleVisibility}
          className={`p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
            isVisible 
              ? 'text-black' 
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
          style={isVisible ? {
            backgroundColor: 'white',
          } : {}}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isVisible ? 'Sembunyikan' : 'Tampilkan'}
        >
          {isVisible ? (
            <EyeIcon className="w-5 h-5" style={{ color: 'black' }} />
          ) : (
            <EyeSlashIcon className="w-5 h-5" />
          )}
        </motion.button>
      )}

      {/* Delete Button */}
      {onDelete && (
        <motion.button
          onClick={onDelete}
          className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-md hover:shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Hapus"
        >
          <TrashIcon className="w-5 h-5" />
        </motion.button>
      )}
    </motion.div>
  );
}
