"use client";

import { useState, useRef, useEffect } from 'react';
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaUser, FaPaperPlane, FaRegTrashAlt, FaCopy, FaBrain, FaCircle } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import LoadingDots from '../components/LoadingDots';
import ModelSwitch from '../components/ModelSwitch';
import AILoader from '../components/AILoader';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAdvancedModel, setIsAdvancedModel] = useState(false);

  useEffect(() => {
    // Add initial greeting message
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your AI assistant. I can help you with various tasks including writing, analysis, coding, and more. How can I assist you today?",
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
      const response = await fetch('/api/chat-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages.filter(m => m.id !== 'welcome'),
          isAdvanced: isAdvancedModel
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
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI assistant. I can help you with various tasks including writing, analysis, coding, and more. How can I assist you today?",
      timestamp: new Date()
    }]);
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

  const handleModelChange = async (isAdvanced: boolean) => {
    setIsAdvancedModel(isAdvanced);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Switched to ${isAdvanced ? 'advanced' : 'basic'} mode. How can I help you?`,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav />
      <main className="flex-grow flex flex-col pt-16">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-50/20 to-transparent dark:from-violet-900/10"></div>
          {/* Floating Circles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight 
              }}
              animate={{
                x: [null, Math.random() * window.innerWidth],
                y: [null, Math.random() * window.innerHeight],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: Math.random() * 10 + 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Chat Container - Adjusted spacing without banner */}
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 min-h-[calc(100vh-8rem)] flex flex-col relative overflow-hidden mb-24"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('/ai-grid.svg')] bg-repeat opacity-[0.02]"></div>
              </div>

              {/* Messages Container */}
              <div 
                ref={chatContainerRef}
                className="flex-grow overflow-y-auto p-4 space-y-4 scroll-smooth relative z-10 custom-scrollbar"
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
                        <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-full p-2">
                          <FaRobot className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full p-2">
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
                        className="prose dark:prose-invert max-w-none"
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
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                      <FaRobot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-grow bg-gray-50 dark:bg-gray-700 rounded-2xl">
                      <AILoader />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Keep the corner decorations */}
        <div className="fixed top-0 right-0 p-4 pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 rounded-full border-4 border-purple-500/20 border-dashed"
          />
        </div>
        <div className="fixed bottom-0 left-0 p-4 pointer-events-none">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 rounded-full border-4 border-violet-500/10 border-dashed"
          />
        </div>

        {/* Fixed Input Area - Add z-index and proper spacing */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 z-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="flex items-end gap-3">
                <div className="relative flex-grow">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything... (Enter to send, Shift + Enter for new line)"
                    className="w-full rounded-2xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:border-violet-500 focus:ring-violet-500 resize-none py-3 px-4 pr-24 shadow-lg"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                  
                  {/* Buttons Container */}
                  <div className="absolute right-2 bottom-2 flex items-center gap-2">
                    {/* Clear Chat Button */}
                    {messages.length > 1 && (
                      <motion.button
                        type="button"
                        onClick={clearChat}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors duration-200"
                        title="Clear chat"
                      >
                        <FaRegTrashAlt className="w-4 h-4" />
                      </motion.button>
                    )}

                    {/* Send Button */}
                    <motion.button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-2 rounded-lg flex items-center justify-center transition-colors duration-200
                        ${!input.trim() || isLoading
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                          : 'bg-violet-500 dark:bg-violet-600 text-white hover:bg-violet-600 dark:hover:bg-violet-700'
                        }`}
                    >
                      <motion.div
                        animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <FaPaperPlane className="w-4 h-4" />
                      </motion.div>
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <ModelSwitch onChange={handleModelChange} />
    </div>
  );
} 