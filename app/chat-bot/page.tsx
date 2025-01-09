"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { FaRobot, FaUser, FaPaperPlane, FaRegTrashAlt, FaCopy, FaBrain, FaCircle, FaCode, FaDatabase, FaNetworkWired } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import LoadingDots from '../components/LoadingDots';
import ModelSwitch from '../components/ModelSwitch';
import AILoader from '../components/AILoader';
import PasscodeModal from '../components/PasscodeModal';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [backgroundCircles, setBackgroundCircles] = useState<Array<{
    x: number;
    y: number;
    duration: number;
  }>>([]);
  const [animatedElements, setAnimatedElements] = useState<Array<{
    type: 'neuron' | 'connection' | 'data' | 'chat';
    x: number;
    y: number;
    delay: number;
    speed: number;
    size?: number;
  }>>([]);

  useEffect(() => {
    // This code will only run on the client side
    if (typeof window !== 'undefined') {
      // Example client-side logic
      const handleResize = () => {
        console.log('Window resized:', window.innerWidth);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup function to remove the event listener
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

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

  useEffect(() => {
    // Clear authentication on component mount
    sessionStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  }, []);

  const handleAuthentication = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true');
  };

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
        // Also scroll the main window to bottom
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 100); // Small delay to ensure content is rendered
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
    scrollToBottom();

    try {
      const response = await fetch('/api/chat-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages.slice(-5).filter(m => m.id !== 'welcome'),
          isAdvanced: isAdvancedModel
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      scrollToBottom();
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      }]);
      scrollToBottom();
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

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => {
      const messageIndex = prev.findIndex(m => m.id === messageId);
      if (messageIndex === -1) return prev;

      // If deleting a user message, also delete the following assistant response
      if (prev[messageIndex].role === 'user' && messageIndex + 1 < prev.length && prev[messageIndex + 1].role === 'assistant') {
        return prev.filter((_, i) => i !== messageIndex && i !== messageIndex + 1);
      }

      // If deleting an assistant message, also delete the preceding user message
      if (prev[messageIndex].role === 'assistant' && messageIndex > 0 && prev[messageIndex - 1].role === 'user') {
        return prev.filter((_, i) => i !== messageIndex && i !== messageIndex - 1);
      }

      return prev.filter(m => m.id !== messageId);
    });
  };

  // Initialize background animations after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const circles = Array(5).fill(0).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        duration: Math.random() * 10 + 20
      }));
      setBackgroundCircles(circles);
    }
  }, []);

  // Initialize animated elements after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const elements = [
        // Neurons (brain nodes) - Increased count and speed
        ...Array(10).fill(0).map(() => ({
          type: 'neuron' as const,
          x: Math.random() * window.innerWidth,
          y: Math.random() * (window.innerHeight / 2),
          delay: Math.random(),
          speed: 2 + Math.random() * 2 // Faster animation
        })),
        // Neural connections - Added more
        ...Array(8).fill(0).map(() => ({
          type: 'connection' as const,
          x: Math.random() * window.innerWidth,
          y: Math.random() * (window.innerHeight / 2),
          delay: Math.random(),
          speed: 3 + Math.random() * 2
        })),
        // Data particles - Added more with varying sizes
        ...Array(12).fill(0).map(() => ({
          type: 'data' as const,
          x: Math.random() * window.innerWidth,
          y: Math.random() * (window.innerHeight / 2),
          delay: Math.random(),
          speed: 1.5 + Math.random() * 1.5,
          size: 2 + Math.random() * 4
        })),
        // Chat bubbles animation
        ...Array(6).fill(0).map(() => ({
          type: 'chat' as const,
          x: Math.random() * window.innerWidth,
          y: window.innerHeight * 0.7 + Math.random() * (window.innerHeight * 0.3),
          delay: Math.random() * 2,
          speed: 2 + Math.random() * 2
        }))
      ];
      setAnimatedElements(elements);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-gray-900">
      {!isAuthenticated && <PasscodeModal onAuthenticate={handleAuthentication} />}
      <Nav />
      <main className="flex-grow flex flex-col pt-16">
        {/* Enhanced AI-themed Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-50/20 to-transparent dark:from-violet-900/10"></div>
          
          {/* Neural Network Animation */}
          {animatedElements.map((element, i) => (
            <motion.div
              key={i}
              className={`absolute ${
                element.type === 'neuron' 
                  ? 'w-4 h-4 bg-purple-500/20 rounded-full'
                  : element.type === 'connection'
                  ? 'w-32 h-px bg-gradient-to-r from-purple-500/10 to-indigo-500/10'
                  : element.type === 'chat'
                  ? 'w-8 h-8 border-2 border-purple-500/20 rounded-xl'
                  : `w-${element.size} h-${element.size} bg-blue-400/30 rounded-full`
              }`}
              initial={{ 
                x: element.x,
                y: element.y,
                opacity: 0,
                scale: element.type === 'neuron' ? 0.5 : 1
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: element.type === 'neuron' 
                  ? [0.5, 1, 0.5] 
                  : element.type === 'chat'
                  ? [0.8, 1.1, 0.8]
                  : 1,
                y: element.type === 'chat'
                  ? [element.y, element.y - 50, element.y]
                  : [element.y, element.y - 30, element.y],
                rotate: element.type === 'connection' ? [0, 45, 0] : 0
              }}
              transition={{
                duration: element.speed,
                delay: element.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Floating Icons with increased animation speed */}
          <div className="absolute right-0 top-0 w-1/4 h-full opacity-10">
            {[FaBrain, FaCode, FaDatabase, FaNetworkWired, FaRobot, FaUser].map((Icon, index) => (
              <motion.div
                key={index}
                className="absolute"
                style={{
                  top: `${(100 / 6) * index}%`,
                  right: `${20 + Math.random() * 20}%`
                }}
                animate={{
                  y: [-15, 15, -15],
                  rotate: [-8, 8, -8],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  duration: 3, // Faster animation
                  delay: index * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Icon className="w-12 h-12 text-purple-500/50" />
              </motion.div>
            ))}
          </div>

          {/* Enhanced Grid Pattern */}
          <div className="absolute inset-0 bg-[url('/ai-grid.svg')] bg-repeat opacity-[0.02] neural-network" />
        </div>

        {/* Chat Container - Adjusted spacing and padding for mobile */}
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-24 sm:mb-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 min-h-[calc(100vh-8rem)] flex flex-col relative overflow-hidden"
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
                    className="flex items-start gap-4 group relative"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
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
                      
                      {/* Message Actions */}
                      <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyToClipboard(message.content)}
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                        title="Copy to clipboard"
                      >
                          <FaCopy className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                        </button>
                        {message.id !== 'welcome' && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete message"
                          >
                            <FaRegTrashAlt className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400" />
                      </button>
                        )}
                      </div>
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

        {/* Model Switch - Repositioned for mobile */}
        <div className="fixed bottom-24 sm:bottom-20 right-4 z-30">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 border border-gray-200 dark:border-gray-700">
            <ModelSwitch onChange={handleModelChange} />
        </div>
        </div>

        {/* Input Area - Adjusted for mobile */}
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

      {/* AI Processing Circles */}
      {/* Top Right Circle */}
      <div className="fixed top-20 right-4 pointer-events-none z-20">
        <div className="relative w-24 h-24">
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-purple-500/30"
          />
          {/* Middle rotating ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-2 border-indigo-500/40"
          />
          {/* Inner pulsing circle */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-4 rounded-full bg-gradient-to-r from-violet-600/50 to-indigo-600/50 backdrop-blur-sm"
          >
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  rotate: [0, 180, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <FaBrain className="w-6 h-6 text-white/80" />
              </motion.div>
            </div>
          </motion.div>
          
          {/* Particle effects */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/60 rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [0, (Math.cos(i * 60) * 50)],
                y: [0, (Math.sin(i * 60) * 50)],
                opacity: [0, 1, 0],
                scale: [1, 1.5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Left Circle */}
      <div className="fixed bottom-32 left-4 pointer-events-none z-20">
        <div className="relative w-20 h-20">
          {/* Outer ring with data flow effect */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-blue-400/60 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 45}deg) translateY(-10px)`
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>

          {/* Inner circle with pulse effect */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-600/50 to-cyan-600/50 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <FaRobot className="w-5 h-5 text-white/80" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 