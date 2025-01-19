"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { generateContent, analyzeUrl, improveContent, extractMetadata, checkGrammar, optimizeSEO, translateContent, analyzeContent } from '../services/openai';
import { 
  FaPencilAlt, 
  FaMagic, 
  FaLink, 
  FaGlobe, 
  FaChartLine, 
  FaLanguage, 
  FaBullhorn, 
  FaCheck,
  FaSpinner,
  FaCopy,
  FaSearch,
  FaRobot,
  FaTimes
} from 'react-icons/fa';
import { SiGrammarly, SiOpenai } from 'react-icons/si';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PasscodeModal from '../components/PasscodeModal';

interface AnalysisResult {
  content: string;
  metadata?: {
    title: string;
    description: string;
    keywords: string;
    h1Tags: string[];
  };
}

export default function ContentCopilot() {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [targetKeywords, setTargetKeywords] = useState('');

  const contentTypes = [
    { id: 'blog', name: 'Blog Post', icon: <FaPencilAlt /> },
    { id: 'social', name: 'Social Media', icon: <FaBullhorn /> },
    { id: 'seo', name: 'SEO Content', icon: <FaChartLine /> },
    { id: 'marketing', name: 'Marketing Copy', icon: <FaMagic /> }
  ];

  const aiTools = [
    {
      name: "Grammar Check",
      icon: <SiGrammarly className="w-6 h-6" />,
      description: "Advanced grammar and style checking"
    },
    {
      name: "SEO Optimizer",
      icon: <FaChartLine className="w-6 h-6" />,
      description: "Optimize content for search engines"
    },
    {
      name: "Translator",
      icon: <FaLanguage className="w-6 h-6" />,
      description: "Translate to multiple languages"
    },
    {
      name: "Content Analyzer",
      icon: <FaSearch className="w-6 h-6" />,
      description: "Analyze content quality and readability"
    }
  ];

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError('');
      const generatedContent = await generateContent(prompt, contentType);
      setResult(generatedContent || '');
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!validateUrl(url)) {
      setIsValidUrl(false);
      setError('Please enter a valid URL');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setIsValidUrl(true);
      
      // First get metadata
      const metadata = await extractMetadata(url);
      
      // Then get the analysis
      const analysis = await analyzeUrl(url);

      if (!analysis || !metadata) {
        throw new Error('Failed to get analysis or metadata');
      }

      // Update the analysis result state
      setAnalysisResult({
        content: analysis,
        metadata: {
          title: metadata.title || 'No title found',
          description: metadata.description || 'No description found',
          keywords: metadata.keywords || 'No keywords found',
          h1Tags: metadata.h1Tags || []
        }
      });

      // Clear any previous errors
      setError('');
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze URL. Please check the URL and try again.');
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprove = async () => {
    try {
      setIsLoading(true);
      setError('');
      const improved = await improveContent(prompt);
      setResult(improved || '');
    } catch (err) {
      setError('Failed to improve content. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolClick = async (toolName: string) => {
    setSelectedTool(toolName);
    setError('');
    
    if (!result) {
      setError('Please generate or input content first');
      return;
    }

    setIsLoading(true);
    try {
      let toolResult: string;
      switch (toolName) {
        case 'Grammar Check':
          toolResult = await checkGrammar(result) ?? '';
          break;
        case 'SEO Optimizer':
          toolResult = await optimizeSEO(result, targetKeywords) ?? '';
          break;
        case 'Translator':
          toolResult = await translateContent(result, targetLanguage) ?? '';
          break;
        case 'Content Analyzer':
          toolResult = await analyzeContent(result) ?? '';
          break;
        default:
          toolResult = '';
      }
      setResult(toolResult);
    } catch (err) {
      setError(`Failed to process with ${toolName}. Please try again.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle passcode authentication
  const handleAuthentication = () => {
    setIsAuthenticated(true);
  };

  // Check session on mount
  useEffect(() => {
    if (session) {
      setIsAuthenticated(true);
    }
  }, [session]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {!isAuthenticated && <PasscodeModal onAuthenticate={handleAuthentication} />}
      <Nav />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              AI-Powered Content Writing
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Your Creative Assistant
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transform your ideas into engaging content with our advanced AI writing tools.
              Analyze, optimize, and create content that resonates with your audience.
            </p>
          </motion.div>

          {/* Main Content Area */}
          <div className="mt-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
              {[
                { id: 'write', name: 'Write Content', icon: <FaPencilAlt /> },
                { id: 'analyze', name: 'Analyze URL', icon: <FaGlobe /> },
                { id: 'improve', name: 'Improve Content', icon: <FaMagic /> }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === tab.id
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Content Type Selection */}
            {activeTab === 'write' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {contentTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => setContentType(type.id)}
                    className={`p-4 rounded-xl border ${
                      contentType === type.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 hover:border-purple-500/50'
                    } text-white text-center`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-sm">{type.name}</div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="space-y-4">
              {activeTab === 'analyze' && (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setIsValidUrl(true);
                      }}
                      placeholder="Enter website URL to analyze..."
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        !isValidUrl ? 'border-red-500' : 'border-white/20'
                      } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500`}
                    />
                    <motion.button
                      onClick={handleAnalyze}
                      disabled={isLoading || !url}
                      className="absolute right-2 top-2 px-4 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <FaSpinner className="w-5 h-5 animate-spin" />
                      ) : (
                        'Analyze'
                      )}
                    </motion.button>
                  </div>

                  {/* Analysis Results */}
                  {analysisResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 rounded-xl p-6 space-y-4"
                    >
                      {/* Metadata Section */}
                      {analysisResult.metadata && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-white">Page Metadata</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-gray-300">
                                <span className="text-purple-400">Title:</span> {analysisResult.metadata.title || 'No title found'}
                              </p>
                              <p className="text-gray-300">
                                <span className="text-purple-400">Description:</span> {analysisResult.metadata.description || 'No description found'}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-gray-300">
                                <span className="text-purple-400">Keywords:</span> {analysisResult.metadata.keywords || 'No keywords found'}
                              </p>
                              <div className="text-gray-300">
                                <span className="text-purple-400">H1 Tags:</span>
                                <ul className="list-disc list-inside">
                                  {(analysisResult.metadata.h1Tags || []).length > 0 ? (
                                    analysisResult.metadata.h1Tags.map((tag, i) => (
                                      <li key={i}>{tag}</li>
                                    ))
                                  ) : (
                                    <li>No H1 tags found</li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Analysis Content */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">Content Analysis</h3>
                        <div className="whitespace-pre-wrap text-gray-300">
                          {analysisResult.content}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <motion.button
                          onClick={() => navigator.clipboard.writeText(analysisResult.content)}
                          className="px-4 py-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 transition-colors text-white flex items-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FaCopy className="w-4 h-4" />
                          Copy Analysis
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      activeTab === 'write'
                        ? "Describe what you want to write about..."
                        : activeTab === 'improve'
                        ? "Paste your content here to improve..."
                        : "Analysis results will appear here..."
                    }
                    rows={8}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                  />
                  <motion.button
                    onClick={activeTab === 'write' ? handleGenerate : activeTab === 'improve' ? handleImprove : undefined}
                    disabled={isLoading || !prompt}
                    className="mt-4 w-full py-3 px-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <FaSpinner className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {activeTab === 'write' ? 'Generate' : 'Improve'}
                        <FaMagic className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Result Area */}
                <div className="relative bg-gray-900/50 rounded-xl p-4">
                  <div className="h-[300px] overflow-y-auto custom-scrollbar">
                    {result ? (
                      <ReactMarkdown
                        className="prose prose-invert max-w-none"
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-4" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-white mb-3" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-medium text-white mb-2" {...props} />,
                          p: ({node, ...props}) => <p className="text-gray-300 mb-4" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-300 mb-4" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-300 mb-4" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          blockquote: ({node, ...props}) => (
                            <blockquote className="border-l-4 border-purple-500 pl-4 my-4 text-gray-400 italic" {...props} />
                          ),
                          code: ({node, inline, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                language={match[1]}
                                style={atomDark}
                                className="rounded-lg !bg-gray-800/50"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-gray-800/50 rounded px-1 py-0.5 text-purple-400" {...props}>
                                {children}
                              </code>
                            );
                          },
                          a: ({node, ...props}) => (
                            <a className="text-purple-400 hover:text-purple-300 underline" {...props} />
                          ),
                          hr: ({node, ...props}) => <hr className="border-gray-700 my-4" {...props} />,
                          table: ({node, ...props}) => (
                            <div className="overflow-x-auto mb-4">
                              <table className="min-w-full divide-y divide-gray-700" {...props} />
                            </div>
                          ),
                          th: ({node, ...props}) => (
                            <th className="px-4 py-2 bg-gray-800/50 text-left text-gray-300" {...props} />
                          ),
                          td: ({node, ...props}) => (
                            <td className="px-4 py-2 border-t border-gray-700 text-gray-300" {...props} />
                          ),
                        }}
                      >
                        {result}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-gray-400 italic">Generated content will appear here...</p>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <motion.button
                      onClick={() => navigator.clipboard.writeText(result)}
                      className="p-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 transition-colors group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Copy to clipboard"
                    >
                      <FaCopy className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                    </motion.button>
                    <motion.button
                      onClick={() => setResult('')}
                      className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Clear content"
                    >
                      <FaTimes className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Tools Grid */}
            <div className="mt-8">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white mb-2">AI Tools</h3>
                {selectedTool === 'Translator' && (
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white mb-4"
                  >
                    {['Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean'].map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                )}
                {selectedTool === 'SEO Optimizer' && (
                  <input
                    type="text"
                    value={targetKeywords}
                    onChange={(e) => setTargetKeywords(e.target.value)}
                    placeholder="Enter target keywords (optional)"
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white mb-4"
                  />
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {aiTools.map((tool, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleToolClick(tool.name)}
                    className={`p-4 rounded-xl border ${
                      selectedTool === tool.name
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 hover:border-purple-500/50'
                    } text-white`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                  >
                    <div className="text-2xl mb-2">{tool.icon}</div>
                    <div className="text-sm font-medium mb-1">{tool.name}</div>
                    <div className="text-xs text-gray-400">{tool.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 
