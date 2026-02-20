'use client';

import { motion } from 'framer-motion';

interface ButtonSaveProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function ButtonSave({ onClick, disabled = false }: ButtonSaveProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      title="Simpan"
    >
      Simpan
    </motion.button>
  );
}
