"use client";

import type { JSX } from 'react';
import { useState } from 'react';
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from 'framer-motion';
import { FaCogs, FaDocker, FaGitAlt, FaCloud, FaShieldAlt, FaTerminal, FaRocket, FaCode } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import LoadingDots from '../components/LoadingDots';

type Tool = {
  id: string;
  title: string;
  icon: JSX.Element;
  description: string;
  placeholder: string;
  gradient: string;
};

const devopsTools: Tool[] = [
  {
    id: 'infrastructure',
    title: 'Infrastructure as Code',
    icon: <FaCloud className="w-6 h-6" />,
    description: 'Generate Terraform, CloudFormation, or Ansible code',
    placeholder: 'Describe your infrastructure needs...',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'docker',
    title: 'Docker & Kubernetes',
    icon: <FaDocker className="w-6 h-6" />,
    description: 'Create Dockerfiles and K8s manifests',
    placeholder: 'Describe your containerization requirements...',
    gradient: 'from-cyan-500 to-teal-500'
  },
  {
    id: 'cicd',
    title: 'CI/CD Pipeline',
    icon: <FaRocket className="w-6 h-6" />,
    description: 'Generate pipeline configurations',
    placeholder: 'Describe your pipeline needs...',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'security',
    title: 'Security & Compliance',
    icon: <FaShieldAlt className="w-6 h-6" />,
    description: 'Security best practices and configurations',
    placeholder: 'Describe your security requirements...',
    gradient: 'from-red-500 to-orange-500'
  }
];

export default function DevOpsCopilot() {
  const [selectedTool, setSelectedTool] = useState<Tool>(devopsTools[0]);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/devops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tool: selectedTool.id,
          prompt: input 
        }),
      });

      const data = await response.json();
      setOutput(data.response);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-gray-900">
      <Nav />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-purple-50 via-white to-transparent dark:from-gray-800 dark:via-gray-900 pt-24 pb-12">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl"
              >
                AI-Powered DevOps Copilot
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-xl text-gray-600 dark:text-gray-300"
              >
                Streamline your DevOps workflow with intelligent automation
              </motion.p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Tools Selection */}
            <div className="space-y-4">
              {devopsTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                    selectedTool.id === tool.id
                      ? `bg-gradient-to-r ${tool.gradient} text-white shadow-lg`
                      : 'bg-white dark:bg-gray-800 hover:shadow-md'
                  }`}
                >
                  {tool.icon}
                  <div className="text-left">
                    <div className="font-semibold">{tool.title}</div>
                    <div className={`text-sm ${
                      selectedTool.id === tool.id
                        ? 'text-white/80'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {tool.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Input and Output */}
            <div className="lg:col-span-3 space-y-6">
              {/* Input Section */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <form onSubmit={handleSubmit}>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={selectedTool.placeholder}
                    rows={6}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isGenerating || !input.trim()}
                      className={`px-6 py-2 rounded-lg bg-gradient-to-r ${selectedTool.gradient} text-white font-medium
                        disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg`}
                    >
                      {isGenerating ? (
                        <LoadingDots color="white" />
                      ) : (
                        'Generate'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Output Section */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaTerminal className="w-5 h-5" />
                  Generated Output
                </h2>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code: ({node, inline, className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            language={match[1]}
                            style={atomDark}
                            PreTag="div"
                            className="rounded-lg"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-gray-100 dark:bg-gray-800 rounded px-1" {...props}>
                            {children}
                          </code>
                        )
                      },
                    }}
                  >
                    {output || "Generated code will appear here..."}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 