"use client";

import Image from "next/image";
import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { useState } from "react";
import { FaRobot, FaImage, FaKeyboard, FaBrain, FaChevronDown, FaChevronUp, FaPencilAlt, FaCode, FaCheck, FaArrowRight, FaCogs, FaFileAlt } from 'react-icons/fa';
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
        <div className="relative bg-gradient-to-b from-blue-50 via-white to-transparent dark:from-gray-900 dark:via-gray-800 pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight"
              >
                Next-Gen AI Tools for
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {" "}Creative Minds
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
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

        {/* Stats Section */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-8 rounded-2xl bg-blue-50 dark:bg-gray-700"
              >
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">1M+</div>
                <div className="mt-2 text-gray-600 dark:text-gray-300">Images Generated</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-8 rounded-2xl bg-purple-50 dark:bg-gray-700"
              >
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">50K+</div>
                <div className="mt-2 text-gray-600 dark:text-gray-300">Happy Users</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-8 rounded-2xl bg-green-50 dark:bg-gray-700"
              >
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">99%</div>
                <div className="mt-2 text-gray-600 dark:text-gray-300">Satisfaction Rate</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* AI Chat Conversation Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* AI Code Copilot Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500">
                    <FaCode className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">AI Code Copilot</h3>
                    <p className="text-gray-500 dark:text-gray-400">Your Intelligent Programming Partner</p>
                  </div>
                </div>
                <ul className="space-y-4 mb-6">
                  <li className="flex items-center gap-3">
                    <FaCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">Smart code generation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">Automated debugging assistance</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">Code optimization suggestions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">Multi-language support</span>
                  </li>
                </ul>
                <a
                  href="/code"
                  className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:underline"
                >
                  Try Code Copilot
                  <FaArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* DevOps Copilot Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500">
                    <FaCogs className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">AI-DevOps Copilot</h3>
                    <p className="text-gray-500 dark:text-gray-400">Your DevOps Automation Partner</p>
                  </div>
                </div>
                <ul className="space-y-4 mb-6">
                  <li className="flex items-center gap-3">
                    <FaCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">Infrastructure as Code assistance</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">CI/CD pipeline optimization</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">Docker & Kubernetes expertise</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">Security best practices</span>
                  </li>
                </ul>
                <a
                  href="/devops"
                  className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Explore DevOps Tools
                  <FaArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
