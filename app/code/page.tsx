"use client";

import { useState, useEffect, useRef } from 'react';
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { motion } from 'framer-motion';
import { FaCode, FaPlay, FaDownload, FaCopy, FaLightbulb, FaBug, FaRobot } from 'react-icons/fa';
import LoadingDots from '../components/LoadingDots';
import AIProcessingLoader from '../components/AIProcessingLoader';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PasscodeModal from '../components/PasscodeModal';

type CodeMode = 'generate' | 'explain' | 'debug' | 'optimize' | 'convert' | 'document';

type CodeProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const codeModes = [
  {
    id: 'generate',
    icon: <FaCode />,
    title: 'Generate',
    description: 'Generate code from description',
    gradient: 'from-blue-500 to-purple-500',
    placeholder: 'Describe the code you want to generate...'
  },
  {
    id: 'explain',
    icon: <FaLightbulb />,
    title: 'Explain',
    description: 'Get code explanations',
    gradient: 'from-green-500 to-teal-500',
    placeholder: 'Paste code to explain...'
  },
  {
    id: 'debug',
    icon: <FaBug />,
    title: 'Debug',
    description: 'Find and fix issues',
    gradient: 'from-red-500 to-pink-500',
    placeholder: 'Paste code to debug...'
  },
  {
    id: 'optimize',
    icon: <FaPlay />,
    title: 'Optimize',
    description: 'Improve code performance',
    gradient: 'from-yellow-500 to-orange-500',
    placeholder: 'Paste code to optimize...'
  },
  {
    id: 'convert',
    icon: <FaRobot />,
    title: 'Convert',
    description: 'Convert between languages',
    gradient: 'from-purple-500 to-indigo-500',
    placeholder: 'Paste code to convert...'
  },
  {
    id: 'document',
    icon: <FaDownload />,
    title: 'Document',
    description: 'Generate documentation',
    gradient: 'from-pink-500 to-rose-500',
    placeholder: 'Paste code to document...'
  }
];

export default function CodeCopilot() {
  const [selectedMode, setSelectedMode] = useState<CodeMode>('generate');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [streamedOutput, setStreamedOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Clear authentication on component mount
    sessionStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  }, []);

  const handleAuthentication = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true');
  };

  // Streaming effect for code output
  const streamResponse = (response: string) => {
    setIsStreaming(true);
    let index = 0;
    setStreamedOutput('');

    const stream = () => {
      if (index < response.length) {
        const chunk = response.slice(index, index + 5);
        setStreamedOutput(prev => prev + chunk);
        index += 5;
        streamTimeout.current = setTimeout(stream, 5);
      } else {
        setIsStreaming(false);
      }
    };

    stream();
  };

  useEffect(() => {
    return () => {
      if (streamTimeout.current) {
        clearTimeout(streamTimeout.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');
    setOutput('');
    setStreamedOutput('');

    try {
      const response = await fetch('/api/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: selectedMode,
          code: input,
        }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setOutput(data.result);
        streamResponse(data.result);
      }
    } catch (err) {
      setError('Failed to process code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentMode = codeModes.find(mode => mode.id === selectedMode)!;

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-gray-900">
      {!isAuthenticated && <PasscodeModal onAuthenticate={handleAuthentication} />}
      <Nav />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-blue-50 via-white to-transparent dark:from-gray-800 dark:via-gray-900 pt-32 pb-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/code-pattern.svg')] bg-center opacity-5"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl mb-6">
                AI Code Copilot
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Your intelligent coding assistant. Generate, explain, debug, and optimize code with AI.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Mode Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {codeModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id as CodeMode)}
                className={`p-4 rounded-xl border transition-all ${
                  selectedMode === mode.id
                    ? `bg-gradient-to-r ${mode.gradient} text-white border-transparent`
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <span className="text-xl">{mode.icon}</span>
                  <span className="font-medium">{mode.title}</span>
                  <span className="text-xs opacity-75">{mode.description}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Code
                  </label>
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      rows={5}
                      className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-4 font-mono"
                      placeholder={currentMode.placeholder}
                      required
                    />
                    <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                      {input.length} characters
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !input.trim()}
                  className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-white bg-gradient-to-r ${currentMode.gradient} transition-all
                    ${isGenerating || !input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                >
                  {isGenerating ? (
                    <>
                      <LoadingDots color="white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {currentMode.icon}
                      {currentMode.title} Code
                    </>
                  )}
                </button>

                {error && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}
              </form>
            </div>

            {/* Output Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col h-[350px]">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2 flex-shrink-0">
                  {currentMode.icon}
                  Generated Result
                  {isStreaming && <LoadingDots color="gray-400" />}
                </h2>
                <div className="flex-1 min-h-0">
                  <div className="relative h-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto custom-scrollbar">
                    {isGenerating ? (
                      <AIProcessingLoader />
                    ) : (
                      <>
                        <ReactMarkdown
                          className="prose prose-lg dark:prose-invert max-w-none font-mono"
                          components={{
                            code: ({ className, children, ...props }: CodeProps) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match;
                              
                              return !isInline ? (
                                <SyntaxHighlighter
                                  {...props}
                                  style={atomDark}
                                  language={match?.[1] || 'text'}
                                  PreTag="div"
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {streamedOutput}
                        </ReactMarkdown>
                        {output && !isStreaming && (
                          <button
                            onClick={() => navigator.clipboard.writeText(output)}
                            className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
                            title="Copy to clipboard"
                          >
                            <FaCopy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
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