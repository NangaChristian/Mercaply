import { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center p-1 bg-surface rounded-xl w-fit', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors duration-280 z-10',
              isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-background rounded-lg shadow-sm -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
