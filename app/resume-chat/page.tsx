"use client";

import { useState, useRef, useEffect } from 'react';
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaUser, FaPaperPlane, FaRegTrashAlt, FaCopy, FaLock, FaShieldAlt } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import LoadingDots from '../components/LoadingDots';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function ResumeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showPasscodeModal, setShowPasscodeModal] = useState(true);
  const [passcode, setPasscode] = useState(['', '', '', '']);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');

  const CORRECT_PASSCODE = '2606';

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const authenticated = sessionStorage.getItem('isAuthenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
      setShowPasscodeModal(false);
    }
  }, []);

  const handlePasscodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newPasscode = [...passcode];
      newPasscode[index] = value;
      setPasscode(newPasscode);

      if (value !== '' && index < 3) {
        const nextInput = document.getElementById(`passcode-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handlePasscodeSubmit = () => {
    const enteredPasscode = passcode.join('');
    if (enteredPasscode === CORRECT_PASSCODE) {
      setIsAuthenticated(true);
      setShowPasscodeModal(false);
      sessionStorage.setItem('isAuthenticated', 'true');
      setPasscodeError('');
    } else {
      setPasscodeError('Invalid passcode. Please try again.');
      setPasscode(['', '', '', '']);
      document.getElementById('passcode-0')?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/resume-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages
        }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav />
      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-emerald-50 via-white to-transparent dark:from-gray-800 dark:via-gray-900 py-8">
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Resume AI Assistant
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Chat with our AI to get help with your resume
            </p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 h-[600px] flex flex-col">
              {/* Messages Container */}
              <div 
                ref={chatContainerRef}
                className="flex-grow overflow-y-auto p-4 space-y-4 scroll-smooth"
              >
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                      {message.role === 'assistant' ? (
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-2">
                          <FaRobot className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
                          <FaUser className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className={`flex-grow relative group ${
                      message.role === 'assistant' 
                        ? 'bg-gray-50 dark:bg-gray-700' 
                        : 'bg-blue-50 dark:bg-blue-900/30'
                    } rounded-2xl p-4`}>
                      <ReactMarkdown
                        className="prose prose-lg dark:prose-invert max-w-none"
                        components={{
                          code: ({node, inline, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                language={match[1]}
                                style={atomDark}
                                PreTag="div"
                                className="rounded-lg my-4"
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
                        {message.content}
                      </ReactMarkdown>
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy to clipboard"
                      >
                        <FaCopy className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                      <FaRobot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
                      <LoadingDots color="gray-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="flex gap-4">
                  <div className="relative flex-grow">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about resume writing, formatting, or career advice... (Enter to send, Shift + Enter for new line)"
                      className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-emerald-500 focus:ring-emerald-500 resize-none py-3 px-4 pr-12"
                      style={{ minHeight: '44px' }}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 bottom-2 p-2 text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPaperPlane className="w-4 h-4" />
                    </button>
                  </div>
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={clearChat}
                      className="p-3 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Clear chat"
                    >
                      <FaRegTrashAlt className="w-4 h-4" />
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {showPasscodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all animate-fadeIn">
            <div className="text-center">
              <div className="mb-6 relative">
                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full"></div>
                </div>
                <FaShieldAlt className="w-12 h-12 mx-auto text-blue-500 relative z-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enter Passcode</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please enter your 4-digit passcode to access the resume chat
              </p>
              
              <div className="flex justify-center gap-3 mb-6">
                {passcode.map((digit, index) => (
                  <input
                    key={index}
                    id={`passcode-${index}`}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePasscodeChange(index, e.target.value)}
                    className="w-12 h-12 text-center text-2xl font-bold rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && index > 0) {
                        const prevInput = document.getElementById(`passcode-${index - 1}`);
                        prevInput?.focus();
                      }
                    }}
                  />
                ))}
              </div>

              {passcodeError && (
                <div className="text-red-500 mb-4 animate-shake">
                  {passcodeError}
                </div>
              )}

              <button
                onClick={handlePasscodeSubmit}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FaLock className="w-4 h-4" />
                Unlock Access
              </button>
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div>
          {/* Your existing JSX */}
        </div>
      )}
    </div>
  );
} 