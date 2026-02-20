'use client';

import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import ButtonSave from './button-save';
import ButtonCancel from './button-cancel';
import { useAdmin } from '@/lib/admin-context';

interface ButtonActionPlusProps {
  // Add button props
  addLabel?: string;
  onAdd?: () => void;
  showIcon?: boolean; // Show/hide icon (true = Plus, false = Pencil)
  
  // Save/Cancel props (muncul saat mode edit/add)
  showSaveCancel?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  
  // Admin control
  adminOnly?: boolean;
}

export default function ButtonActionPlus({ 
  addLabel = 'Tambah',
  onAdd,
  showIcon = true, // Default true (Plus icon)
  showSaveCancel = false,
  onSave,
  onCancel,
  adminOnly = true,
}: ButtonActionPlusProps) {
  const { isAdmin } = useAdmin();

  // If adminOnly is true and user is not admin, don't render
  if (adminOnly && !isAdmin) {
    return null;
  }
  
  return (
    <motion.div 
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Tambah Button - hanya muncul jika tidak dalam mode save/cancel */}
      {!showSaveCancel && onAdd && (
        <motion.button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-blue-uii)] hover:bg-blue-600 text-white transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={addLabel}
        >
          {showIcon ? (
            <PlusIcon className="w-5 h-5" />
          ) : (
            <PencilIcon className="w-5 h-5" />
          )}
          <span>{addLabel}</span>
        </motion.button>
      )}

      {/* Save & Cancel Buttons - muncul saat mode edit/add */}
      {showSaveCancel && (
        <>
          {onCancel && <ButtonCancel onClick={onCancel} />}
          {onSave && <ButtonSave onClick={onSave} />}
        </>
      )}
    </motion.div>
  );
}