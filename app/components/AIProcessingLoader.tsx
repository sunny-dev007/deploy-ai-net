import { motion } from 'framer-motion';
import { FaBrain } from 'react-icons/fa';

export default function AIProcessingLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.div
        className="relative w-20 h-20 mb-4"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-full blur-xl"></div>
        <div className="relative flex items-center justify-center w-full h-full">
          <FaBrain className="w-12 h-12 text-blue-500 dark:text-blue-400" />
        </div>
      </motion.div>
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          AI Processing
        </h3>
        <div className="flex items-center justify-center space-x-1">
          <motion.div
            className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Analyzing and generating response...
        </p>
      </div>
    </div>
  );
} 