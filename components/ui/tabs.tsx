'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Card from '@/components/ui/card';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  color?: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onAddTab?: () => void;
  onRemoveTab?: (tabId: string) => void;
  addLabel?: string;
  showAdd?: boolean;
  showRemove?: boolean;
  variant?: 'default' | 'pills' | 'underline' | 'navbar';
  className?: string;
}

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  onAddTab,
  onRemoveTab,
  addLabel = 'Tambah',
  showAdd = false,
  showRemove = false,
  variant = 'underline',
  className = '',
}: TabsProps) {

  const baseTabClasses =
    variant === 'navbar'
      ? 'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2'
      : 'relative px-4 py-2.5 font-medium transition-all duration-200 flex items-center gap-2';
  
  const variantClasses = {
    default: {
      tab: 'rounded-t-lg',
      active: 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md',
      inactive: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
    },
    pills: {
      tab: 'rounded-full',
      active: 'bg-blue-500 text-white shadow-lg',
      inactive: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
    },
    underline: {
      tab: 'border-b-2 border-transparent',
      active: 'border-blue-500 text-blue-600 dark:text-blue-400 font-semibold',
      inactive: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300',
    },
    navbar: {
      tab: 'rounded-lg',
      active:
        'bg-white/80 dark:bg-black/40 text-[var(--color-blue-uii)] dark:text-[var(--color-blue-dark-uii)] shadow-sm',
      inactive: 'text-zinc-700 dark:text-zinc-300 hover:bg-white/40 dark:hover:bg-black/20',
    },
  };

  return (
    <div className={`flex items-center gap-2 overflow-x-auto scrollbar-hide ${className}`}>
      {/* Tabs */}
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <motion.div
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTabChange(tab.id);
              }
            }}
            className={`
              ${baseTabClasses}
              ${variantClasses[variant].tab}
              ${isActive ? variantClasses[variant].active : variantClasses[variant].inactive}
              group
              whitespace-nowrap
              cursor-pointer
            `}
            whileHover={variant === 'navbar' ? undefined : { scale: 1.02 }}
            whileTap={variant === 'navbar' ? undefined : { scale: 0.98 }}
            style={isActive && tab.color ? { 
              borderBottomColor: tab.color,
              color: tab.color 
            } : {}}
          >
            {/* Icon */}
            {tab.icon && (
              <span className="w-5 h-5 flex-shrink-0">
                {tab.icon}
              </span>
            )}
            
            {/* Label */}
            <span>{tab.label}</span>
            
            {/* Count Badge */}
            {tab.count !== undefined && (
              <span className={`
                px-2 py-0.5 text-xs rounded-full
                ${isActive 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }
              `}>
                {tab.count}
              </span>
            )}
            
            {/* Remove Button (Admin) - Absolute positioned to not take space */}
            {showRemove && onRemoveTab && tabs.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTab(tab.id);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveTab(tab.id);
                  }
                }}
                className={`
                  absolute -top-1 -right-1
                  w-5 h-5 rounded-full
                  flex items-center justify-center
                  opacity-0 group-hover:opacity-100
                  transition-all duration-200
                  bg-red-500 text-white
                  hover:bg-red-600 hover:scale-110
                  cursor-pointer
                  shadow-md
                `}
                title="Hapus tab"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </span>
            )}
            
            {/* Active Indicator */}
            {isActive && variant === 'pills' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-500 rounded-full -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.div>
        );
      })}
      
      {/* Add Tab Button */}
      {showAdd && onAddTab && (
        <motion.div
          onClick={onAddTab}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onAddTab();
            }
          }}
          className={`
            relative flex items-center gap-2 whitespace-nowrap cursor-pointer
            ${variant === 'navbar' ? 'px-3.5 py-1.5' : 'px-3.5 py-2'}
            ${variant === 'pills' ? 'rounded-full' : 'rounded-lg'}
            text-sm font-medium
            text-gray-600 dark:text-gray-400
            hover:text-blue-600 dark:hover:text-blue-400
            hover:bg-blue-50 dark:hover:bg-blue-900/20
            border-2 border-dashed border-gray-300 dark:border-gray-600
            hover:border-blue-400
            transition-all duration-200
          `}
          whileHover={variant === 'navbar' ? undefined : { scale: 1.05 }}
          whileTap={variant === 'navbar' ? undefined : { scale: 0.95 }}
          title={addLabel}
        >
          <PlusIcon className="w-5 h-5" />
          <span className="hidden sm:inline">{addLabel}</span>
        </motion.div>
      )}
    </div>
  );
}

// Floating Tabs Bar Component (Sticky)
interface FloatingTabsBarProps extends TabsProps {
  sticky?: boolean;
  stickyOffset?: number;
  placement?: 'top' | 'bottom';
  bottomOffset?: number;
  barClassName?: string;
}

export function FloatingTabsBar({ 
  sticky = true,
  stickyOffset = 64,
  placement = 'top',
  bottomOffset = 16,
  barClassName = '',
  className = '',
  ...tabsProps 
}: FloatingTabsBarProps) {
  const isBottom = placement === 'bottom';

  return (
    <div
      className={`
        ${!isBottom && sticky ? 'sticky' : ''}
        ${isBottom ? 'fixed inset-x-0' : ''}
        z-40
        ${barClassName}
      `}
      style={
        isBottom
          ? { bottom: `${bottomOffset}px` }
          : sticky
            ? { top: `${stickyOffset}px` }
            : {}
      }
    >
      <div className={isBottom ? 'pl-4 pr-23 md:pr-4 flex justify-center' : 'p-4 flex justify-center'}>
        <div className="w-fit max-w-4xl">
          <Card
            variant="chrome"
            padding="none"
            enableTilt={false}
            className={isBottom ? 'h-14 px-3' : 'px-4 py-3'}
          >
            <div className={isBottom ? 'h-14 flex items-center' : undefined}>
              <Tabs
                {...tabsProps}
                className={`${isBottom ? 'h-full' : ''} ${className}`.trim()}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
