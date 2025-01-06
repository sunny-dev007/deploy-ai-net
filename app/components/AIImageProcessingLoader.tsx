import { motion } from 'framer-motion';
import { FaPaintBrush, FaImage, FaMagic } from 'react-icons/fa';

export default function AIImageProcessingLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.div
        className="relative w-24 h-24 mb-4"
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
        {/* Animated background circles */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Main icon container */}
        <div className="relative flex items-center justify-center w-full h-full">
          <motion.div
            className="absolute"
            animate={{
              opacity: [1, 0, 1],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <FaPaintBrush className="w-12 h-12 text-purple-500 dark:text-purple-400" />
          </motion.div>
          <motion.div
            className="absolute"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <FaImage className="w-12 h-12 text-blue-500 dark:text-blue-400" />
          </motion.div>
        </div>
      </motion.div>

      <div className="space-y-2 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Creating Your Image
        </h3>
        <div className="flex items-center justify-center space-x-1">
          <motion.div
            className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"
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
          AI is crafting your masterpiece...
        </p>
      </div>
    </div>
  );
} 