"use client";

import Image from "next/image";
import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { useState } from "react";
import { FaRobot, FaImage, FaKeyboard, FaBrain, FaChevronDown, FaChevronUp, FaPencilAlt, FaCode, FaCheck, FaArrowRight, FaCogs, FaFileAlt, FaChartLine, FaCloud, FaUser, FaEnvelope, FaBug, FaMagic, FaLock, FaBullhorn, FaSearchDollar, FaLanguage } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Card data
const aiTools = [
  {
    title: "AI Image Generation",
    icon: <FaImage className="w-8 h-8" />,
    description: "Transform your ideas into stunning visuals using DALL·E 2. Create unique, AI-generated images from text descriptions.",
    longDescription: "Our AI image generation tool powered by DALL·E 2 allows you to create stunning, unique images from simple text descriptions. Perfect for artists, designers, and creative professionals who need quick, unique visuals. Generate everything from abstract art to realistic scenes in seconds.",
    gradient: "from-blue-500 to-purple-500",
    link: "/generate"
  },
  {
    title: "AI Text Assistant",
    icon: <FaKeyboard className="w-8 h-8" />,
    description: "Enhance your writing with AI-powered suggestions, corrections, and creative ideas.",
    longDescription: "Get intelligent writing assistance for any type of content. Our AI text assistant helps with grammar, style, tone adjustments, and even creative suggestions. Perfect for content creators, students, and professionals looking to improve their writing.",
    gradient: "from-green-500 to-teal-500",
    link: "/text"
  },
  {
    title: "AI Resume Builder",
    icon: <FaFileAlt className="w-8 h-8" />,
    description: "Create professional resumes tailored to your industry with AI assistance.",
    longDescription: "Our AI-powered resume builder helps you create compelling, ATS-friendly resumes. Get personalized content suggestions, professional formatting, and industry-specific templates. Perfect for job seekers looking to stand out.",
    gradient: "from-emerald-500 to-teal-500",
    link: "/resume"
  },
  {
    title: "AI Chatbot",
    icon: <FaRobot className="w-8 h-8" />,
    description: "Engage in intelligent conversations with our AI assistant for help with any task.",
    longDescription: "Experience natural, context-aware conversations with our advanced AI chatbot. Get help with writing, analysis, problem-solving, and more. Our AI maintains conversation context and provides detailed, relevant responses.",
    gradient: "from-violet-500 to-purple-500",
    link: "/chat-bot"
  }
];

function FeatureCard({ tool }: { tool: typeof aiTools[0] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
    >
      <div className={`h-2 bg-gradient-to-r ${tool.gradient}`} />
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.gradient} text-white`}>
            {tool.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {tool.title}
          </h3>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          {isExpanded ? tool.longDescription : tool.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isExpanded ? (
              <>Read Less <FaChevronUp className="ml-1" /></>
            ) : (
              <>Read More <FaChevronDown className="ml-1" /></>
            )}
          </button>
          <Link
            href={tool.link}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Try Now →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-indigo-900 via-purple-900 to-transparent dark:from-gray-900 dark:via-gray-800 pt-32 pb-20 overflow-hidden">
          {/* Animated background patterns */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/neural-pattern.svg')] bg-center opacity-10" />
            <div className="absolute inset-0">
              {/* Add floating elements */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: Math.random() * 10 + 5 + 'px',
                    height: Math.random() * 10 + 5 + 'px',
                    background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, 255, 0.3)`,
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-3xl" />
          </div>

          {/* Neural network animation */}
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-20">
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                backgroundImage: 'url("/neural-network.svg")',
                backgroundSize: '200% 200%',
              }}
            />
          </div>

          {/* Hero content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8 flex justify-center"
              >
                <div className="relative w-24 h-24">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-purple-500/30"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border-4 border-indigo-500/30"
                  />
                  <div className="absolute inset-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                    <FaBrain className="w-8 h-8 text-white" />
                  </div>
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl sm:text-6xl font-extrabold text-white leading-tight"
              >
                Next-Gen AI Tools for
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  {" "}Creative Minds
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 text-xl sm:text-2xl text-gray-100 dark:text-gray-200 max-w-3xl mx-auto"
              >
                Unlock the power of artificial intelligence with our suite of creative tools. 
                Transform your ideas into reality with just a few clicks.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 flex gap-4 justify-center"
              >
                <Link
                  href="/generate"
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                </Link>
                <a
                  href="#features"
                  className="px-8 py-4 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Learn More
                </a>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Powerful AI Tools at Your Fingertips
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Explore our suite of AI-powered tools designed to enhance your creativity and productivity
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {aiTools.map((tool, index) => (
                <FeatureCard key={index} tool={tool} />
              ))}
            </div>
          </div>
        </section>

        {/* AI Copilot Suite Section */}
        <section className="py-24 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 relative overflow-hidden">
          {/* Background Effect */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/neural-pattern.svg')] opacity-5" />
            {/* Animated particles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/10"
                style={{
                  width: Math.random() * 4 + 2 + 'px',
                  height: Math.random() * 4 + 2 + 'px',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                AI Copilot Suite
              </h2>
              <p className="text-xl text-gray-300">
                Intelligent assistants for every professional need
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 1. Developer Copilot */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative group h-[420px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative h-full bg-gray-900/80 backdrop-blur-xl rounded-xl border border-orange-500/20 p-6 flex flex-col">
                  {/* Animation Container */}
                  <div className="h-32 mb-4 rounded-lg bg-black/50 p-4 relative overflow-hidden">
                    {/* Typing Code Animation */}
                    <motion.div
                      animate={{
                        opacity: [1, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        times: [0, 0.5, 1],
                      }}
                      className="text-xs font-mono text-orange-300/70 space-y-1"
                    >
                      {[
                        'async function develop() {',
                        '  const code = await AI.suggest();',
                        '  return optimize(code);',
                        '}'
                      ].map((line, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.2 }}
                        >
                          {line}
                        </motion.div>
                      ))}
                    </motion.div>
                    {/* Cursor Animation */}
                    <motion.div
                      className="absolute bottom-4 left-4 w-2 h-4 bg-orange-400/70"
                      animate={{
                        opacity: [1, 0, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-orange-400 mb-2">Developer Copilot</h3>
                  <p className="text-gray-300 text-sm mb-4 flex-grow">
                    AI-powered code suggestions, documentation generation, and development workflow optimization.
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <FaCheck className="w-4 h-4 text-blue-400 mr-2" />
                      <span>Smart code completion</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <FaCheck className="w-4 h-4 text-blue-400 mr-2" />
                      <span>Auto documentation</span>
                    </div>
                  </div>

                  {/* Updated Button with Link */}
                  <Link href="/code">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-orange-500/25"
                    >
                      Try Developer Copilot
                      <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>

              {/* 2. DevSecOps Copilot */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative group h-[420px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative h-full bg-gray-900/80 backdrop-blur-xl rounded-xl border border-emerald-500/20 p-6 flex flex-col">
                  {/* Animation Container */}
                  <div className="h-32 mb-4 rounded-lg bg-black/50 p-4 relative overflow-hidden">
                    {/* Pipeline Animation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* CI/CD Pipeline Flow */}
                      <div className="relative w-full h-16">
                        {/* Pipeline Stages */}
                        {['Build', 'Test', 'Deploy'].map((stage, i) => (
                          <motion.div
                            key={i}
                            className="absolute top-1/2 -translate-y-1/2"
                            style={{ left: `${i * 35 + 10}%` }}
                          >
                            {/* Stage Container */}
                            <motion.div
                              className="w-16 h-16 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center"
                              animate={{
                                scale: [1, 1.1, 1],
                                borderColor: ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0.2)']
                              }}
                              transition={{
                                duration: 2,
                                delay: i * 0.5,
                                repeat: Infinity,
                              }}
                            >
                              {/* Stage Icon */}
                              <motion.div
                                className="text-emerald-400 mb-1"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{
                                  duration: 2,
                                  delay: i * 0.5,
                                  repeat: Infinity,
                                }}
                              >
                                {i === 0 ? <FaCogs className="w-5 h-5" /> : 
                                 i === 1 ? <FaBug className="w-5 h-5" /> : 
                                          <FaCloud className="w-5 h-5" />}
                              </motion.div>
                              {/* Stage Name */}
                              <span className="text-xs text-emerald-400/70">{stage}</span>
                            </motion.div>

                            {/* Connecting Lines */}
                            {i < 2 && (
                              <motion.div
                                className="absolute top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-emerald-500/50 to-emerald-500/20"
                                style={{
                                  left: '100%',
                                  width: '80px',
                                }}
                              >
                                {/* Moving Dot */}
                                <motion.div
                                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400"
                                  animate={{
                                    x: [0, 80, 0],
                                  }}
                                  transition={{
                                    duration: 2,
                                    delay: i * 0.5,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                />
                              </motion.div>
                            )}
                          </motion.div>
                        ))}

                        {/* Security Shield Overlay */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{
                            opacity: [0.1, 0.3, 0.1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <FaLock className="w-24 h-24 text-emerald-400/10" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Scanning Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/5 to-transparent"
                      animate={{
                        y: [-100, 100],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">DevSecOps Copilot</h3>
                  <p className="text-gray-300 text-sm mb-4 flex-grow">
                    Automated security scanning, compliance checks, and infrastructure monitoring for secure deployments.
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <FaCheck className="w-4 h-4 text-emerald-400 mr-2" />
                      <span>Security scanning</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <FaCheck className="w-4 h-4 text-emerald-400 mr-2" />
                      <span>Compliance automation</span>
                    </div>
                  </div>

                  {/* Updated Button with Link */}
                  <Link href="/devops">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-emerald-500/25"
                    >
                      Try DevSecOps Copilot
                      <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>

              {/* 3. Content Writing Copilot */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative group h-[420px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative h-full bg-gray-900/80 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6 flex flex-col">
                  {/* Animation Container */}
                  <div className="h-32 mb-4 rounded-lg bg-black/50 p-4 relative overflow-hidden">
                    {/* Typing Text Animation */}
                    <motion.div
                      className="absolute inset-0 flex flex-col justify-center"
                    >
                      {[
                        { width: '80%', delay: 0 },
                        { width: '60%', delay: 0.5 },
                        { width: '70%', delay: 1 }
                      ].map((line, i) => (
                        <motion.div
                          key={i}
                          className="h-2 rounded-full bg-purple-500/20 mb-2"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: line.width,
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            delay: line.delay,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                      
                      {/* Animated Cursor */}
                      <motion.div
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-1 h-4 bg-purple-400"
                        animate={{
                          opacity: [1, 0, 1]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity
                        }}
                      />

                      {/* Floating Icons */}
                      {[FaPencilAlt, FaBullhorn, FaLanguage].map((Icon, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{
                            top: `${20 + i * 30}%`,
                            right: '10%'
                          }}
                          animate={{
                            y: [-5, 5, -5],
                            opacity: [0.3, 0.7, 0.3]
                          }}
                          transition={{
                            duration: 3,
                            delay: i * 0.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Icon className="w-4 h-4 text-purple-400/50" />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  <h3 className="text-lg font-semibold text-purple-400 mb-2">Content Writing Copilot</h3>
                  <p className="text-gray-300 text-sm mb-4 flex-grow">
                    AI-powered content creation assistant for blogs, social media, and marketing materials.
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <FaCheck className="w-4 h-4 text-purple-400 mr-2" />
                      <span>SEO-optimized writing</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <FaCheck className="w-4 h-4 text-purple-400 mr-2" />
                      <span>Multi-format content</span>
                    </div>
                  </div>

                  {/* Button with Link */}
                  <Link href="/content">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-purple-500/25"
                    >
                      Try Content Copilot
                      <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>

              {/* 4. Report Analysis Copilot */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative group h-[420px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative h-full bg-gray-900/80 backdrop-blur-xl rounded-xl border border-blue-500/20 p-6 flex flex-col">
                  {/* Animation Container */}
                  <div className="h-32 mb-4 rounded-lg bg-black/50 p-4 relative overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute bottom-4 w-6 bg-blue-500/40 rounded-t-lg"
                        style={{ left: `${i * 30 + 10}%` }}
                        animate={{
                          height: ['40px', '60px', '40px'],
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.3,
                          repeat: Infinity,
                        }}
                      />
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Report Analysis Copilot</h3>
                  <p className="text-gray-300 text-sm mb-4 flex-grow">
                    Automated analysis and summarization of complex reports and data structures.
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <FaCheck className="w-4 h-4 text-blue-400 mr-2" />
                      <span>Smart data processing</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <FaCheck className="w-4 h-4 text-blue-400 mr-2" />
                      <span>Automated insights</span>
                    </div>
                  </div>

                  {/* Button */}
                  <Link href="/report">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/25"
                  >
                    Try Report Analysis Copilot
                    <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* AI Agents Section */}
        <section className="py-24 bg-gradient-to-tr from-indigo-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="absolute inset-0 bg-[url('/neural-pattern.svg')] opacity-5"
          />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
                <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
                >
                AI Agents Suite
                </motion.h2>
                <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600 dark:text-gray-300"
                >
                Intelligent agents that work autonomously to boost your productivity
                </motion.p>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Report Analysis Agent */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                  <div className="h-40 mb-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 relative overflow-hidden">
                    {/* Animated Charts */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute bottom-4 w-8 bg-blue-500/20 rounded-t-lg"
                        style={{ left: `${i * 30 + 10}%` }}
                        animate={{
                          height: ['60px', '100px', '60px'],
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.3,
                          repeat: Infinity,
                        }}
                      />
                    ))}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Report Analysis Agent</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Automatically analyze and summarize complex reports and data
                  </p>
                </div>
              </motion.div>

              {/* In-Depth Meeting Agent */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                  <div className="h-40 mb-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 relative overflow-hidden">
                    {/* Meeting Participants Animation */}
                    <div className="flex justify-center items-center h-full">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-12 h-12 rounded-full bg-purple-500/20 absolute"
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 360],
                          }}
                          transition={{
                            duration: 4,
                            delay: i * 0.5,
                            repeat: Infinity,
                          }}
                          style={{
                            left: `${i * 20 + 25}%`,
                          }}
                        >
                          <FaUser className="w-full h-full p-2 text-purple-400/70" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">In-Depth Meeting Agent</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Record, transcribe, and extract key insights from meetings
                  </p>
                </div>
              </motion.div>

              {/* Review Email Agent */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                  <div className="h-40 mb-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4 relative overflow-hidden">
                    {/* Email Animation */}
                    <motion.div
                      animate={{
                        x: [-100, 400],
                        y: [0, -20, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                      className="absolute top-1/2 -translate-y-1/2"
                    >
                      <div className="w-16 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <FaEnvelope className="w-8 h-8 text-emerald-400/70" />
                      </div>
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Review Email Agent</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Smart email analysis and response suggestions
                  </p>
              </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Floating Cards Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Floating cards */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    y: [-20, 20, -20],
                    rotate: [5, -5, 5],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl backdrop-blur-xl transform -rotate-6"
                />
                <motion.div
                  animate={{
                    y: [20, -20, 20],
                    rotate: [-5, 5, -5],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                  className="w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl backdrop-blur-xl transform rotate-6 ml-8"
                />
              </div>

              {/* Content */}
              <div className="relative text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                  Powered by Advanced AI Technology
                </h2>
                <div className="grid grid-cols-3 gap-8">
                  {/* Add technology highlights here */}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
