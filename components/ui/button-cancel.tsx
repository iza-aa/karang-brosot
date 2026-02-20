'use client';

import { motion } from 'framer-motion';

interface ButtonCancelProps {
  onClick: () => void;
}

export default function ButtonCancel({ onClick }: ButtonCancelProps) {
  return (
    <motion.button
      onClick={onClick}
      className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Batal"
    >
      Batal
    </motion.button>
  );
}
