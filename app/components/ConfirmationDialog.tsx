'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaExclamationTriangle, FaTimes, FaDatabase } from 'react-icons/fa';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  fileName?: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  fileName,
  isLoading = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: FaTrash,
          iconColor: 'text-red-500',
          iconBg: 'bg-red-500/10',
          confirmBg: 'bg-gradient-to-r from-red-500 to-red-600',
          confirmHover: 'hover:from-red-600 hover:to-red-700'
        };
      case 'warning':
        return {
          icon: FaExclamationTriangle,
          iconColor: 'text-yellow-500',
          iconBg: 'bg-yellow-500/10',
          confirmBg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          confirmHover: 'hover:from-yellow-600 hover:to-orange-600'
        };
      case 'info':
        return {
          icon: FaDatabase,
          iconColor: 'text-blue-500',
          iconBg: 'bg-blue-500/10',
          confirmBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          confirmHover: 'hover:from-blue-600 hover:to-blue-700'
        };
      default:
        return {
          icon: FaExclamationTriangle,
          iconColor: 'text-blue-500',
          iconBg: 'bg-blue-500/10',
          confirmBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          confirmHover: 'hover:from-blue-600 hover:to-blue-700'
        };
    }
  };

  const typeConfig = getTypeConfig();
  const IconComponent = typeConfig.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${typeConfig.iconBg} relative`}>
                  <div className="absolute inset-0 rounded-full animate-pulse bg-current opacity-10"></div>
                  <IconComponent className={`w-6 h-6 ${typeConfig.iconColor} relative z-10`} />
                </div>
                <motion.h3 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-bold text-gray-900 dark:text-white"
                >
                  {title}
                </motion.h3>
              </div>
              
              <motion.button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={isLoading}
              >
                <FaTimes className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </motion.button>
            </div>

            {/* Content */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                {message}
              </p>
              
              {fileName && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border-l-4 border-gray-300 dark:border-gray-600"
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">File:</span>{' '}
                    <span className="font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">
                      {fileName}
                    </span>
                  </p>
                </motion.div>
              )}

              {type === 'danger' && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <span className="font-medium">⚠️ Important:</span> This action cannot be undone. The file will be moved to trash and removed from search results.
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3"
            >
              <motion.button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {cancelText}
              </motion.button>
              
              <motion.button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 ${typeConfig.confirmBg} ${typeConfig.confirmHover} text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed`}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {confirmText}
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationDialog; 