"use client";

import { motion } from 'framer-motion';

export default function AILoader() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative">
        {/* Pulsing background */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-violet-500/20 dark:bg-violet-400/20 rounded-full blur-xl"
        />
        
        {/* Neural network animation */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-full h-full border-4 border-violet-500/40 dark:border-violet-400/40 rounded-full"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.8, 0.3],
                rotate: 360
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
          
          {/* Center dot */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-4 h-4 bg-violet-500 dark:bg-violet-400 rounded-full"
          />
          
          {/* Orbiting dots */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute w-2 h-2 bg-violet-500 dark:bg-violet-400 rounded-full"
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 3,
                delay: i * 0.25,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                transformOrigin: "center",
                left: "calc(50% - 4px)",
                top: "calc(50% - 4px)",
                transform: `rotate(${i * 90}deg) translateY(-20px)`
              }}
            />
          ))}
        </div>
      </div>
      <div className="ml-4 flex flex-col">
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-medium text-violet-600 dark:text-violet-400"
        >
          AI Processing
        </motion.span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Generating response...
        </span>
      </div>
    </div>
  );
} 