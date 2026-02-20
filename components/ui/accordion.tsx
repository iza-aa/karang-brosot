'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface AccordionItem {
  id: string;
  title: string | ReactNode;
  content: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export default function Accordion({ 
  items, 
  allowMultiple = false,
  className = '' 
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(
    items.filter(item => item.defaultOpen).map(item => item.id)
  );

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems(prev =>
        prev.includes(id)
          ? prev.filter(itemId => itemId !== id)
          : [...prev, id]
      );
    } else {
      setOpenItems(prev =>
        prev.includes(id) ? [] : [id]
      );
    }
  };

  const isOpen = (id: string) => openItems.includes(id);

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden
                     bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
                     transition-all duration-200
                     hover:shadow-md"
        >
          {/* Header */}
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full flex items-center justify-between p-4 text-left
                       hover:bg-gray-50 dark:hover:bg-gray-800/80 
                       transition-colors duration-200"
          >
            <div className="flex items-center gap-3 flex-1">
              {item.icon && (
                <span className="flex-shrink-0 text-gray-600 dark:text-gray-400">
                  {item.icon}
                </span>
              )}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {item.title}
              </span>
            </div>
            
            <motion.div
              animate={{ rotate: isOpen(item.id) ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            </motion.div>
          </button>

          {/* Content */}
          <AnimatePresence initial={false}>
            {isOpen(item.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// Single Accordion Item Component (for custom usage)
interface SingleAccordionProps {
  title: string | ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionItem({
  title,
  children,
  icon,
  defaultOpen = false,
  className = ''
}: SingleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`
        border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden
        bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
        transition-all duration-200
        hover:shadow-md
        ${className}
      `}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left
                   hover:bg-gray-50 dark:hover:bg-gray-800/80 
                   transition-colors duration-200"
      >
        <div className="flex items-center gap-3 flex-1">
          {icon && (
            <span className="flex-shrink-0 text-gray-600 dark:text-gray-400">
              {icon}
            </span>
          )}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </span>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
