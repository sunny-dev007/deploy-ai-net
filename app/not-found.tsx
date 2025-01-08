'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaHome, FaSearch, FaRobot } from 'react-icons/fa';
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { useState, useEffect } from 'react';

export default function NotFound() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const robotVariants = {
    hover: {
      y: [0, -10, 0],
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const glowVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Generate particles only on client side
  const particles = isClient ? [...Array(20)].map((_, i) => ({
    id: i,
    x: Math.random() * windowSize.width,
    y: Math.random() * (windowSize.height - 100) + 100,
  })) : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-gray-900">
      <Nav />
      <main className="flex-grow flex items-center justify-center relative overflow-hidden pt-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-blue-50/20 via-purple-50/20 to-transparent 
                       dark:from-blue-900/10 dark:via-purple-900/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          {/* Floating particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 bg-blue-500/20 rounded-full"
              initial={{
                x: particle.x,
                y: particle.y,
              }}
              animate={{
                x: Math.random() * windowSize.width,
                y: Math.random() * (windowSize.height - 100) + 100,
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center px-4 py-8 max-w-2xl mx-auto"
        >
          {/* Adjusted positioning for the glowing circle */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-48 h-48 
                       bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
            variants={glowVariants}
            animate="animate"
          />

          {/* Robot Icon with adjusted margin */}
          <motion.div
            className="relative mb-12"
            variants={robotVariants}
            whileHover="hover"
          >
            <FaRobot className="w-24 h-24 mx-auto text-blue-500 dark:text-blue-400" />
          </motion.div>

          {/* Text Content */}
          <motion.h1 
            variants={itemVariants}
            className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent 
                       bg-clip-text mb-4"
          >
            404
          </motion.h1>
          
          <motion.h2 
            variants={itemVariants}
            className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4"
          >
            Oops! Page Not Found
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto"
          >
            The page you're looking for seems to have wandered off into the digital void. 
            Let's get you back on track!
          </motion.p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div variants={itemVariants}>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl
                          hover:bg-blue-600 transition-colors duration-200"
              >
                <FaHome className="w-4 h-4" />
                Back to Home
              </Link>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Link 
                href="/chat-bot"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl
                          hover:bg-purple-600 transition-colors duration-200"
              >
                <FaSearch className="w-4 h-4" />
                Ask AI Assistant
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
} 