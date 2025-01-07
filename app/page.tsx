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

        {/* AI Assistant Tools Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-5" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                AI-Powered Assistant Suite
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Intelligent tools designed for both technical and non-technical professionals
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Content Creation Assistant */}
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
              >
                <div className="relative h-48 mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 to-rose-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaPencilAlt className="w-16 h-16 text-white opacity-75" />
                  </div>
                  <div className="absolute inset-0 bg-[url('/wave-pattern.svg')] opacity-20" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Content Creation Assistant
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Generate blog posts, marketing copy, and social media content with AI assistance
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <FaCheck className="w-4 h-4 text-green-500 mr-2" />
                    SEO-optimized content
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <FaCheck className="w-4 h-4 text-green-500 mr-2" />
                    Multiple tone options
                  </li>
                </ul>
              </motion.div>

              {/* Code Assistant */}
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
              >
                <div className="relative h-48 mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaCode className="w-16 h-16 text-white opacity-75" />
                  </div>
                  <div className="absolute inset-0 bg-[url('/code-pattern.svg')] opacity-20" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Intelligent Code Assistant
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Write, debug, and optimize code across multiple programming languages
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <FaCheck className="w-4 h-4 text-green-500 mr-2" />
                    Code completion
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <FaCheck className="w-4 h-4 text-green-500 mr-2" />
                    Bug detection
                  </li>
                </ul>
              </motion.div>

              {/* Business Intelligence */}
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
              >
                <div className="relative h-48 mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-violet-500 to-purple-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaChartLine className="w-16 h-16 text-white opacity-75" />
                  </div>
                  <div className="absolute inset-0 bg-[url('/analytics-pattern.svg')] opacity-20" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Business Intelligence
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Transform data into actionable insights with AI-powered analytics
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <FaCheck className="w-4 h-4 text-green-500 mr-2" />
                    Market analysis
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <FaCheck className="w-4 h-4 text-green-500 mr-2" />
                    Trend prediction
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* AI Copilot Section - Updated Grid */}
        <section className="py-24 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
          {/* Background animations remain the same */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute inset-0 opacity-10"
              animate={{
                background: [
                  'radial-gradient(circle at 0% 0%, #4F46E5 0%, transparent 50%)',
                  'radial-gradient(circle at 100% 100%, #4F46E5 0%, transparent 50%)',
                  'radial-gradient(circle at 0% 0%, #4F46E5 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            
            {/* Floating Code Snippets */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-indigo-300/20 text-xs font-mono"
                initial={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                {`const ai = new AI();`}
              </motion.div>
            ))}
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-bold text-white mb-4"
              >
                AI Copilot Suite
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl text-indigo-200"
              >
                Intelligent assistants for every professional need
              </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* First Row */}
              <div className="space-y-8">
                {/* Code Copilot - Keep existing but adjust height */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 relative overflow-hidden h-[600px]"
                >
                  {/* Background Code Pattern Animation */}
                  <div className="absolute inset-0 opacity-5">
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-xs font-mono whitespace-nowrap"
                        initial={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: Math.random() * 3 + 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        {`const optimize = (code) => AI.enhance(code);`}
                      </motion.div>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-xl opacity-50" />
                        <div className="relative p-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500">
                          <FaCode className="w-8 h-8 text-white" />
                        </div>
                  </div>
                  <div>
                        <h3 className="text-2xl font-bold text-white">AI Code Copilot</h3>
                        <p className="text-indigo-200">Your Intelligent Programming Partner</p>
                      </div>
                    </div>

                    {/* Interactive Code Window */}
                    <div className="mb-8 bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
                      {/* Code Editor Tabs */}
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
                        {['Review', 'Optimize', 'Test'].map((tab, i) => (
                          <motion.div
                            key={tab}
                            className="px-3 py-1 rounded-md text-sm text-indigo-200 bg-white/5"
                            animate={{
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              delay: i * 0.3,
                              repeat: Infinity,
                            }}
                          >
                            {tab}
                          </motion.div>
                        ))}
                      </div>

                      {/* Animated Code Content */}
                      <div className="p-4 font-mono text-sm">
                        <motion.div
                          animate={{
                            opacity: [1, 0.7, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-2 h-2 rounded-full bg-green-400"
                            />
                            <span className="text-green-400">// Optimizing code...</span>
                          </div>
                          <div className="text-blue-400">function optimizePerformance() {'{'}</div>
                          <motion.div
                            animate={{
                              x: [0, 5, 0],
                              opacity: [1, 0.7, 1],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="pl-4 text-indigo-300"
                          >
                            const enhancedCode = AI.analyze(code);
                          </motion.div>
                          <motion.div
                            animate={{
                              x: [0, 5, 0],
                              opacity: [1, 0.7, 1],
                            }}
                            transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
                            className="pl-4 text-indigo-300"
                          >
                            return AI.optimize(enhancedCode);
                          </motion.div>
                          <div className="text-blue-400">{'}'}</div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {[
                        { icon: <FaCheck />, text: "Smart code generation" },
                        { icon: <FaBug />, text: "Real-time debugging" },
                        { icon: <FaMagic />, text: "Code optimization" },
                        { icon: <FaCode />, text: "Multi-language support" }
                      ].map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2 text-indigo-100"
                        >
                          <span className="text-green-400">{feature.icon}</span>
                          <span>{feature.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Updated CTA Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/code"
                        className="group flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium transition-all hover:from-orange-600 hover:to-red-600 hover:shadow-lg hover:shadow-orange-500/25"
                      >
                        Try Code Copilot
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <FaArrowRight className="w-4 h-4" />
                        </motion.span>
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>

                {/* NEW: Content Copilot */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 relative overflow-hidden h-[600px]"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-xs font-mono whitespace-nowrap"
                        initial={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: Math.random() * 3 + 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        {`content.generate('blog-post');`}
                      </motion.div>
                    ))}
                  </div>

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-50" />
                        <div className="relative p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500">
                          <FaPencilAlt className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">AI Content Copilot</h3>
                        <p className="text-indigo-200">Your Creative Writing Assistant</p>
                      </div>
                    </div>

                    {/* Interactive Content Window */}
                    <div className="mb-8 bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
                      {/* Content Editor Tabs */}
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
                        {['Write', 'Edit', 'SEO'].map((tab, i) => (
                          <motion.div
                            key={tab}
                            className="px-3 py-1 rounded-md text-sm text-indigo-200 bg-white/5"
                            animate={{
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              delay: i * 0.3,
                              repeat: Infinity,
                            }}
                          >
                            {tab}
                          </motion.div>
                        ))}
                      </div>

                      {/* Content Generation Animation */}
                      <div className="p-4 font-mono text-sm">
                        <motion.div
                          animate={{
                            opacity: [1, 0.7, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-2 h-2 rounded-full bg-green-400"
                            />
                            <span className="text-green-400">// Generating content...</span>
                          </div>
                          <motion.div
                            animate={{
                              opacity: [0, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          >
                            <div className="text-indigo-300">
                              Creating engaging blog post...
                            </div>
                            <div className="text-indigo-300">
                              Optimizing for SEO...
                            </div>
                            <div className="text-indigo-300">
                              Enhancing readability...
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {[
                        { icon: <FaPencilAlt />, text: "Blog Writing" },
                        { icon: <FaBullhorn />, text: "Social Media" },
                        { icon: <FaSearchDollar />, text: "SEO Optimization" },
                        { icon: <FaLanguage />, text: "Multi-language" }
                      ].map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2 text-indigo-100"
                        >
                          <span className="text-green-400">{feature.icon}</span>
                          <span>{feature.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/content"
                        className="group flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium transition-all hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-500/25"
                      >
                        Try Content Copilot
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                  <FaArrowRight className="w-4 h-4" />
                        </motion.span>
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Second Row */}
              <div className="space-y-8">
                {/* DevOps Copilot - Keep existing but adjust height */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 relative overflow-hidden h-[600px]"
                >
                  {/* Background DevOps Pattern Animation */}
                  <div className="absolute inset-0 opacity-5">
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-xs font-mono whitespace-nowrap"
                        initial={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: Math.random() * 3 + 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        {`kubectl apply -f deployment.yaml`}
                      </motion.div>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur-xl opacity-50" />
                        <div className="relative p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500">
                    <FaCogs className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">AI-DevOps Copilot</h3>
                        <p className="text-indigo-200">Your DevOps Automation Partner</p>
                      </div>
                    </div>

                    {/* Interactive DevOps Window */}
                    <div className="mb-8 bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
                      {/* DevOps Console Tabs */}
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
                        {['Pipeline', 'Deploy', 'Monitor'].map((tab, i) => (
                          <motion.div
                            key={tab}
                            className="px-3 py-1 rounded-md text-sm text-indigo-200 bg-white/5"
                            animate={{
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              delay: i * 0.3,
                              repeat: Infinity,
                            }}
                          >
                            {tab}
                          </motion.div>
                        ))}
                      </div>

                      {/* Animated DevOps Content */}
                      <div className="p-4 font-mono text-sm">
                        <motion.div
                          animate={{
                            opacity: [1, 0.7, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-2 h-2 rounded-full bg-green-400"
                            />
                            <span className="text-green-400">// Deploying infrastructure...</span>
                          </div>
                          <div className="text-blue-400">pipeline {'{'}</div>
                          <motion.div
                            animate={{
                              x: [0, 5, 0],
                              opacity: [1, 0.7, 1],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="pl-4 text-indigo-300"
                          >
                            stage('Build') {'{'}
                          </motion.div>
                          <motion.div
                            animate={{
                              x: [0, 5, 0],
                              opacity: [1, 0.7, 1],
                            }}
                            transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
                            className="pl-8 text-indigo-300"
                          >
                            docker.build("app:latest")
                          </motion.div>
                          <div className="pl-4 text-blue-400">{'}'}</div>
                          <div className="text-blue-400">{'}'}</div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {[
                        { icon: <FaCogs />, text: "Infrastructure as Code" },
                        { icon: <FaCloud />, text: "Cloud Automation" },
                        { icon: <FaLock />, text: "Security Scanning" },
                        { icon: <FaChartLine />, text: "Performance Monitoring" }
                      ].map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2 text-indigo-100"
                        >
                          <span className="text-green-400">{feature.icon}</span>
                          <span>{feature.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Updated CTA Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/devops"
                        className="group flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium transition-all hover:from-purple-600 hover:to-indigo-600 hover:shadow-lg hover:shadow-purple-500/25"
                      >
                        Explore DevOps Tools
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <FaArrowRight className="w-4 h-4" />
                        </motion.span>
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>

                {/* NEW: Analytics Copilot */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 relative overflow-hidden h-[600px]"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-xs font-mono whitespace-nowrap"
                        initial={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: Math.random() * 3 + 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        {`analytics.analyze(data);`}
                      </motion.div>
                    ))}
                  </div>

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl blur-xl opacity-50" />
                        <div className="relative p-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500">
                          <FaChartLine className="w-8 h-8 text-white" />
                        </div>
                  </div>
                  <div>
                        <h3 className="text-2xl font-bold text-white">AI Analytics Copilot</h3>
                        <p className="text-indigo-200">Your Business Analytics Partner</p>
                      </div>
                    </div>

                    {/* Interactive Analytics Window */}
                    <div className="mb-8 bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
                      {/* Analytics Console Tabs */}
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
                        {['Dashboard', 'Reports', 'Predictions'].map((tab, i) => (
                          <motion.div
                            key={tab}
                            className="px-3 py-1 rounded-md text-sm text-indigo-200 bg-white/5"
                            animate={{
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              delay: i * 0.3,
                              repeat: Infinity,
                            }}
                          >
                            {tab}
                          </motion.div>
                        ))}
                      </div>

                      {/* Animated Analytics Content */}
                      <div className="p-4 font-mono text-sm">
                        <motion.div
                          animate={{
                            opacity: [1, 0.7, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-2 h-2 rounded-full bg-green-400"
                            />
                            <span className="text-green-400">// Analyzing data...</span>
                          </div>
                          <motion.div
                            animate={{
                              opacity: [0, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          >
                            <div className="text-indigo-300">
                              Analyzing data...
                            </div>
                            <div className="text-indigo-300">
                              Generating reports...
                            </div>
                            <div className="text-indigo-300">
                              Predicting trends...
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {[
                        { icon: <FaChartLine />, text: "Market Analysis" },
                        { icon: <FaSearchDollar />, text: "Revenue Prediction" },
                        { icon: <FaUser />, text: "Customer Segmentation" },
                        { icon: <FaCogs />, text: "Infrastructure Monitoring" }
                      ].map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2 text-indigo-100"
                        >
                          <span className="text-green-400">{feature.icon}</span>
                          <span>{feature.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/analytics"
                        className="group flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium transition-all hover:from-violet-600 hover:to-purple-600 hover:shadow-lg hover:shadow-violet-500/25"
                      >
                        Explore Analytics Tools
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <FaArrowRight className="w-4 h-4" />
                        </motion.span>
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
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
