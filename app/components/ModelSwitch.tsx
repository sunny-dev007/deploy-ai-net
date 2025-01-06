"use client";

import { useState, useEffect } from 'react';
import { FaBrain } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface ModelSwitchProps {
  onChange: (isAdvanced: boolean) => void;
}

export default function ModelSwitch({ onChange }: ModelSwitchProps) {
  const [isAdvanced, setIsAdvanced] = useState(false);

  const handleToggle = () => {
    setIsAdvanced(!isAdvanced);
    onChange(!isAdvanced);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-24 right-4 z-50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 flex items-center gap-3 border border-gray-200 dark:border-gray-700">
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none
            ${isAdvanced ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
          <span className="sr-only">Toggle AI Model</span>
          <motion.span
            layout
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform
              ${isAdvanced ? 'translate-x-7' : 'translate-x-1'}`}
          />
        </button>
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1">
            <FaBrain className={`w-4 h-4 ${isAdvanced ? 'text-violet-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isAdvanced ? 'Advanced' : 'Basic'}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isAdvanced ? 'Detailed responses' : 'Quick responses'}
          </span>
        </div>
      </div>
    </motion.div>
  );
} 