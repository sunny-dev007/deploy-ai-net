"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-toastify';
import {
  FaCode,
  FaBook,
  FaVial,
  FaLightbulb,
  FaShieldAlt,
  FaCheckCircle,
  FaSpinner,
  FaCloudUploadAlt,
  FaCopy,
  FaDownload,
  FaSearch,
  FaChartBar,
  FaTrash
} from 'react-icons/fa';
import {
  FileText,
  TestTube,
  Shield,
  CheckCircle2,
  BookOpen,
  BarChart3,
  Upload,
  Code2,
  FileJson,
  Binary,
  GitBranch,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Send,
  Bot,
  User
} from 'lucide-react';

interface AnalysisFeature {
  id: string;
  icon: React.ReactElement;
  title: string;
  description: string;
  prompt: string;
  gradient: string;
}

interface CodeReviewSubFeature {
  id: string;
  icon: React.ReactElement;
  title: string;
  description: string;
  prompt: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const features: AnalysisFeature[] = [
  {
    id: 'documentation',
    icon: <FileText className="w-6 h-6" />,
    title: 'Technical Documentation',
    description: 'Generate comprehensive technical documentation',
    gradient: 'from-blue-500 to-indigo-500',
    prompt: `Please analyze the codebase and generate a comprehensive technical documentation including:
1. System Architecture Overview
2. Component Breakdown and Dependencies
3. Data Flow and State Management
4. API Documentation and Endpoints
5. Database Schema and Relationships
6. Authentication and Authorization Flow
7. Third-party Integrations
8. Deployment and Infrastructure
9. Performance Considerations
10. Known Limitations and Future Improvements`
  },
  {
    id: 'tests',
    icon: <TestTube className="w-6 h-6" />,
    title: 'Unit Tests',
    description: 'Generate comprehensive unit test cases',
    gradient: 'from-green-500 to-emerald-500',
    prompt: `Please analyze the codebase and generate comprehensive unit test cases including:
1. Test Strategy and Framework Selection
2. Test Coverage Goals
3. Mock and Stub Requirements
4. Edge Cases and Boundary Testing
5. Integration Test Scenarios
6. API Testing Approach
7. Performance Test Cases
8. Security Test Cases
9. Error Handling Tests
10. Regression Test Suite`
  },
  {
    id: 'usecases',
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Use Cases',
    description: 'Generate feature-based use cases',
    gradient: 'from-purple-500 to-pink-500',
    prompt: `Please analyze the codebase and generate comprehensive use cases including:
1. Feature Overview and Purpose
2. User Roles and Permissions
3. Primary Success Scenarios
4. Alternative Flows
5. Exception Flows
6. Pre and Post Conditions
7. Business Rules
8. Performance Requirements
9. Security Requirements
10. Integration Points`
  },
  {
    id: 'security',
    icon: <Shield className="w-6 h-6" />,
    title: 'Security Compliance',
    description: 'Analyze security standards and compliance',
    gradient: 'from-red-500 to-orange-500',
    prompt: `Please analyze the codebase for security compliance and compare with market standards:
1. OWASP Top 10 Compliance
2. Authentication Security
3. Authorization Implementation
4. Data Encryption Standards
5. API Security
6. Input Validation
7. Session Management
8. Error Handling Security
9. Dependency Vulnerabilities
10. Security Headers and Configurations`
  },
  {
    id: 'review',
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: 'Code Review',
    description: 'Review code standards and best practices',
    gradient: 'from-yellow-500 to-amber-500',
    prompt: `Please perform a comprehensive code review and analyze best practices:
1. Code Organization and Structure
2. Naming Conventions
3. Error Handling Patterns
4. Performance Optimizations
5. Memory Management
6. Coding Standards Compliance
7. Design Patterns Usage
8. Documentation Quality
9. Test Coverage
10. Maintainability Index`
  }
];

const codeReviewSubFeatures: CodeReviewSubFeature[] = [
  {
    id: 'feature-analysis',
    icon: <Code2 className="w-5 h-5" />,
    title: 'Feature Analysis',
    description: 'Analyze all features and their implementations',
    prompt: `Please analyze the codebase documents and provide a comprehensive feature analysis:
1. List all major features implemented in the application
2. For each feature, provide:
   - Feature description and purpose
   - Key components and their relationships
   - Implementation patterns used
   - Data flow and state management
   - Integration points with other features
3. Identify any potential improvements or missing features
4. Compare implementation with modern development standards

Please structure your response with clear sections for each feature and include relevant code examples.`
  },
  {
    id: 'endpoint-analysis',
    icon: <GitBranch className="w-5 h-5" />,
    title: 'API Endpoint Analysis',
    description: 'Review all API endpoints and their implementations',
    prompt: `Please analyze the codebase documents and provide a detailed API endpoint analysis:
1. List all API endpoints in the application
2. For each endpoint, detail:
   - HTTP method and full URL path
   - Request parameters and body structure
   - Response format and status codes
   - Authentication/Authorization requirements
   - Error handling implementation
3. Analyze the API design patterns
4. Compare with REST/GraphQL best practices
5. Provide recommendations for improvements

Please structure your response with clear sections for each endpoint and include request/response examples.`
  }
];

const CodeAnalyzer: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedFeature, setSelectedFeature] = useState<AnalysisFeature | null>(null);
  const [selectedSubFeature, setSelectedSubFeature] = useState<CodeReviewSubFeature | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [codebaseStatus, setCodebaseStatus] = useState<{
    uploaded: boolean;
    vectorized: boolean;
    lastUpdate: string | null;
    fileCount: number;
    vectorCount: number;
  }>({
    uploaded: false,
    vectorized: false,
    lastUpdate: null,
    fileCount: 0,
    vectorCount: 0
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [tokenCount, setTokenCount] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(1000); // Example limit
  const [remainingTokens, setRemainingTokens] = useState<number>(1000);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    // Fetch codebase status
    fetchCodebaseStatus();
  }, [status, router]);

  const fetchCodebaseStatus = async () => {
    try {
      const response = await fetch('/api/codebase-status');
      const data = await response.json();
      setCodebaseStatus(data);
    } catch (error) {
      console.error('Failed to fetch codebase status:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      setUploadProgress(0);
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload-codebase');
        
        xhr.upload.onprogress = (event) => {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(progress));
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            toast.success('Codebase uploaded successfully');
            fetchCodebaseStatus();
            resolve(xhr.response);
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Upload failed'));
        };

        xhr.send(formData);
      });
    } catch (error) {
      toast.error('Failed to upload codebase');
      console.error('Upload error:', error);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleAnalysis = async () => {
    if (!selectedFeature) return;

    setIsAnalyzing(true);
    setAnalysisResult('');

    try {
      const response = await fetch('/api/analyze-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature: selectedFeature.id,
          subFeature: selectedSubFeature?.id,
          prompt: selectedSubFeature?.prompt || selectedFeature.prompt
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setAnalysisResult(data.result);
    } catch (error) {
      toast.error('Analysis failed');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const estimatedTokens = Math.ceil(chatInput.length / 4);
    if (remainingTokens < estimatedTokens) {
      toast.error('Not enough tokens remaining');
      return;
    }

    const userMessage: Message = { role: 'user' as const, content: chatInput };
    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);
    setTokenCount(prev => prev + estimatedTokens);
    setRemainingTokens(prev => prev - estimatedTokens);

    try {
      const response = await fetch('/api/vector-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          messages: messages,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const responseTokens = Math.ceil(data.message.length / 4);
      setTokenCount(prev => prev + responseTokens);
      setRemainingTokens(prev => prev - responseTokens);
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, there was an error processing your request.' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const renderSubFeatures = () => {
    if (selectedFeature?.id !== 'review') return null;

    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Select Analysis Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {codeReviewSubFeatures.map((subFeature) => (
            <motion.button
              key={subFeature.id}
              onClick={() => setSelectedSubFeature(subFeature)}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border ${
                selectedSubFeature?.id === subFeature.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              } hover:border-blue-300 dark:hover:border-blue-700 transition-colors`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedSubFeature?.id === subFeature.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {subFeature.icon}
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {subFeature.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subFeature.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  const renderChatSection = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
      {/* Chat Header with Token Info */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Repository Chat Assistant
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ask questions about your codebase documentation
            </p>
          </div>
        </div>
        
        {/* Token Usage Display */}
        <div className="flex flex-col items-end">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {remainingTokens.toLocaleString()} / {dailyLimit.toLocaleString()} tokens
          </div>
          <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(remainingTokens / dailyLimit) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 rounded-xl mb-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <Bot className="w-12 h-12 text-gray-400" />
            <div className="max-w-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Start a Conversation
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ask questions about your repository's code, documentation, or architecture.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`group flex items-start gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Bot size={18} className="text-white" />
                </div>
              )}
              <div className="relative">
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white ml-4'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => {
                          // Check if children contains a code block
                          const hasCodeBlock = React.Children.toArray(children).some(
                            child => React.isValidElement(child) && child.type === 'code'
                          );
                          
                          // If there's a code block, render without p wrapper
                          return hasCodeBlock ? <>{children}</> : <p className="mb-2 last:mb-0">{children}</p>;
                        },
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        code: ({ node, inline, className, children, ...props }: any) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const language = match ? match[1] : '';
                          
                          if (!inline) {
                            return (
                              <div className="my-4">
                                <div className="relative group">
                                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => navigator.clipboard.writeText(String(children))}
                                      className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-200"
                                      title="Copy code"
                                    >
                                      <FaCopy size={14} />
                                    </button>
                                  </div>
                                  <SyntaxHighlighter
                                    language={language}
                                    style={vscDarkPlus}
                                    customStyle={{
                                      margin: 0,
                                      borderRadius: '0.5rem',
                                      padding: '1em',
                                      backgroundColor: '#1E1E1E'
                                    }}
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <code
                              className="bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Message Actions */}
                  <div className={`absolute ${message.role === 'user' ? 'left-0' : 'right-0'} top-0 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity py-1 px-2 bg-gray-800 rounded-lg text-xs text-white flex items-center gap-2`}>
                    <button
                      onClick={() => navigator.clipboard.writeText(message.content)}
                      className="hover:text-blue-400 transition-colors"
                      title="Copy message"
                    >
                      <FaCopy size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setMessages(prev => prev.filter((_, i) => i !== index));
                        // Recalculate tokens when message is deleted
                        setTokenCount(prev => Math.max(0, prev - (message.content.length / 4))); // Approximate token count
                        setRemainingTokens(prev => Math.min(dailyLimit, prev + (message.content.length / 4)));
                      }}
                      className="hover:text-red-400 transition-colors"
                      title="Delete message"
                    >
                      <FaTrash size={14} />
                    </button>
                    <span className="border-l border-gray-600 mx-1 h-4" />
                    <span title="Estimated tokens">
                      ~{Math.ceil(message.content.length / 4)} tokens
                    </span>
                  </div>
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-white" />
                </div>
              )}
            </div>
          ))
        )}
        {isChatLoading && (
          <div className="flex items-center gap-2 text-gray-500 p-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>

      {/* Chat Input with Token Warning */}
      <div className="space-y-2">
        <form onSubmit={handleChatSubmit} className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask about your repository..."
            className="w-full p-4 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isChatLoading || remainingTokens < 10}
          />
          <button
            type="submit"
            disabled={isChatLoading || !chatInput.trim() || remainingTokens < 10}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
        {remainingTokens < 100 && (
          <p className="text-sm text-amber-500 dark:text-amber-400">
            Warning: You are running low on tokens ({remainingTokens} remaining)
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/code-pattern.svg')] bg-center opacity-10"></div>
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl mb-4">
            AI Code Analyzer
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Upload your codebase and leverage AI to generate documentation, tests, and ensure best practices
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8 -mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Codebase Status</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {codebaseStatus.uploaded ? 'Uploaded' : 'Not Uploaded'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Binary className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Vector Status</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {codebaseStatus.vectorCount} vectors
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Code2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Files Analyzed</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {codebaseStatus.fileCount} files
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <GitBranch className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Last Update</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {codebaseStatus.lastUpdate ? new Date(codebaseStatus.lastUpdate).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mt-6">
            {/* Upload Progress and Status */}
            <div className="flex flex-col items-center space-y-4">
              <input
                type="file"
                id="codebase-upload"
                multiple
                accept=".zip,.pdf,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.cs"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {uploadProgress !== null ? (
                <div className="w-full max-w-md">
                  {/* Progress Bar */}
                  <div className="mb-2 flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                    <span>Uploading files...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <>
                  {codebaseStatus.uploaded ? (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="flex items-center space-x-2 text-green-500 dark:text-green-400">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-medium">Codebase Uploaded Successfully</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                        <span className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{codebaseStatus.fileCount} files</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Binary className="w-4 h-4" />
                          <span>{codebaseStatus.vectorCount} vectors</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <GitBranch className="w-4 h-4" />
                          <span>Last updated: {codebaseStatus.lastUpdate ? new Date(codebaseStatus.lastUpdate).toLocaleDateString() : 'Never'}</span>
                        </span>
                      </div>
                      <label
                        htmlFor="codebase-upload"
                        className="flex items-center px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload New Files
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor="codebase-upload"
                      className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer transition-colors"
                    >
                      <FaCloudUploadAlt className="w-5 h-5 mr-2" />
                      <span>Upload Codebase</span>
                    </label>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => (
            <motion.button
              key={feature.id}
              onClick={() => setSelectedFeature(feature)}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
                selectedFeature?.id === feature.id
                  ? `bg-gradient-to-r ${feature.gradient} text-white`
                  : 'hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-3 rounded-lg ${
                  selectedFeature?.id === feature.id
                    ? 'bg-white/20'
                    : `bg-gradient-to-r ${feature.gradient} bg-opacity-10`
                }`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm opacity-80">{feature.description}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Analysis Result Section */}
        {selectedFeature && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${selectedFeature.gradient}`}>
                  {selectedFeature.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedFeature.title} Analysis
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Analyzing codebase for {selectedFeature.description.toLowerCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleAnalysis}
                disabled={isAnalyzing || !codebaseStatus.vectorized}
                className={`px-6 py-3 rounded-xl text-white bg-gradient-to-r ${
                  selectedFeature.gradient
                } ${
                  isAnalyzing || !codebaseStatus.vectorized
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg'
                }`}
              >
                {isAnalyzing ? (
                  <div className="flex items-center space-x-2">
                    <FaSpinner className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <FaSearch className="w-5 h-5" />
                    <span>Start Analysis</span>
                  </div>
                )}
              </button>
            </div>

            {/* Analysis Output */}
            <div className="relative mt-6 bg-gray-50 dark:bg-gray-900 rounded-xl p-6 min-h-[400px]">
              {analysisResult ? (
                <>
                  <ReactMarkdown
                    className="prose prose-lg dark:prose-invert max-w-none"
                    components={{
                      code: ({ className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !match ? (
                          <code className="bg-gray-100 dark:bg-gray-800 rounded px-1" {...props}>
                            {children}
                          </code>
                        ) : (
                          <SyntaxHighlighter
                            language={match[1]}
                            style={vscDarkPlus}
                            PreTag="div"
                            className="rounded-lg my-4"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        );
                      },
                    }}
                  >
                    {analysisResult}
                  </ReactMarkdown>
                  <div className="absolute top-4 right-4 space-x-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(analysisResult)}
                      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                      title="Copy to clipboard"
                    >
                      <FaCopy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([analysisResult], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedFeature.id}-analysis.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                      title="Download analysis"
                    >
                      <FaDownload className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-12 h-12 mb-4" />
                  <p>Select a feature and start analysis to see results</p>
                </div>
              )}
            </div>
          </div>
        )}

        {renderSubFeatures()}

        {/* Right column: Chat Interface */}
        <div className="sticky top-8">
          {renderChatSection()}
        </div>
      </div>
    </div>
  );
};

export default CodeAnalyzer; 