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

type CodeProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
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
  const [isMounted, setIsMounted] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

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
      
      // Create a temporary message for streaming
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(true);
      
      // Simulate streaming effect
      const fullResponse = data.response;
      let currentText = '';
      
      for (let i = 0; i < fullResponse.length; i++) {
        currentText += fullResponse[i];
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: currentText }
            : msg
        ));
        // Significantly decreased delay to 1ms for very fast typing speed
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      setIsStreaming(false);
      scrollToBottom();
    } catch (error) {
      console.error('Error:', error);
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

  // Use this effect to mark component as mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize background animations after mount
  useEffect(() => {
    if (!isMounted) return;

    const initializeAnimations = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const circles = Array(5).fill(0).map((_, index) => ({
        x: (windowWidth * (index + 1)) / 6,
        y: (windowHeight * (index + 1)) / 6,
        duration: 20 + (index * 2)
      }));
      setBackgroundCircles(circles);

      const elements = [
        // Neurons (brain nodes)
        ...Array(10).fill(0).map((_, index) => ({
          type: 'neuron' as const,
          x: (windowWidth * (index + 1)) / 11,
          y: (windowHeight * (index + 1)) / 11,
          delay: index * 0.1,
          speed: 2 + (index * 0.2)
        })),
        // Neural connections
        ...Array(8).fill(0).map((_, index) => ({
          type: 'connection' as const,
          x: (windowWidth * (index + 1)) / 9,
          y: (windowHeight * (index + 1)) / 9,
          delay: index * 0.15,
          speed: 2.5 + (index * 0.25)
        }))
      ];
      setAnimatedElements(elements);
    };

    initializeAnimations();

    const handleResize = () => {
      initializeAnimations();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMounted]);

  return (
    <div className="min-h-screen bg-[#1E1E1E] dark:bg-gray-900 relative">
      {!isAuthenticated && <PasscodeModal onAuthenticate={handleAuthentication} />}
      
      {/* Fixed Background Layer */}
      <div className="fixed inset-0 bg-[#1E1E1E] dark:bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/5 to-transparent dark:from-violet-900/5"></div>
        <div className="absolute inset-0 bg-[url('/ai-grid.svg')] bg-repeat opacity-[0.02] neural-network" />
      </div>

      <main className="relative flex-grow flex flex-col min-h-screen z-10">
        {/* Neural Network Animation - Now relative to main */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
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

          {/* Floating Icons */}
          <div className="absolute right-0 top-0 w-1/4 h-full opacity-10">
            {[FaBrain, FaCode, FaDatabase, FaNetworkWired, FaRobot, FaUser].map((Icon, index) => {
              const topPosition = (100 / 6) * index;
              const rightPosition = 20 + (index * 3);
              return (
                <motion.div
                  key={index}
                  className="absolute"
                  initial={{
                    top: `${topPosition}%`,
                    right: `${rightPosition}%`,
                    opacity: 0.3
                  }}
                  animate={{
                    y: [-15, 15, -15],
                    rotate: [-8, 8, -8],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    delay: index * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Icon className="w-12 h-12 text-purple-500/50" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Main Chat Container */}
        <div className="flex-grow flex flex-col h-full">
          <div className="flex-grow flex flex-col max-w-5xl mx-auto w-full px-2 sm:px-4">
            {/* Welcome Message */}
            <div className="text-center py-4 sm:py-6">
              <h1 className="text-xl sm:text-2xl font-semibold text-white">What can I help with?</h1>
            </div>

            {/* Messages Container */}
            <div 
              ref={chatContainerRef}
              className="flex-grow overflow-y-auto space-y-3 sm:space-y-4 scroll-smooth relative z-10 custom-scrollbar px-2 sm:px-4 pb-32 sm:pb-40"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-2 sm:gap-3 group relative ${
                    message.role === 'user' ? 'sm:justify-end' : 'sm:justify-start'
                  }`}
                >
                  {/* Icon only visible on desktop */}
                  <div className="hidden sm:flex w-7 h-7 rounded-full items-center justify-center flex-shrink-0">
                    {message.role === 'assistant' ? (
                      <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-full p-1.5">
                        <FaRobot className="w-3.5 h-3.5 text-white" />
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full p-1.5">
                        <FaUser className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className={`flex-grow relative group w-full sm:max-w-[90%] ${
                    message.role === 'assistant' 
                      ? 'bg-[#2D2D2D] dark:bg-gray-800 rounded-xl sm:rounded-tl-sm sm:rounded-tr-xl sm:rounded-br-xl sm:rounded-bl-xl' 
                      : 'bg-[#383838] dark:bg-gray-700 rounded-xl sm:rounded-tl-xl sm:rounded-tr-sm sm:rounded-br-xl sm:rounded-bl-xl'
                  } p-2 sm:p-3`}>
                    {/* Role indicator - Adjusted for mobile */}
                    <div className="flex items-center justify-between mb-1 sm:hidden">
                      <span className="text-xs text-gray-400 px-1">
                        {message.role === 'assistant' ? 'AI' : 'You'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-1 rounded-lg bg-[#4D4D4D] hover:bg-[#5D5D5D] transition-colors"
                          title="Copy to clipboard"
                        >
                          <FaCopy className="w-3 h-3 text-gray-300" />
                        </button>
                        {message.id !== 'welcome' && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="p-1 rounded-lg bg-[#4D4D4D] hover:bg-red-900/30 transition-colors"
                            title="Delete message"
                          >
                            <FaRegTrashAlt className="w-3 h-3 text-gray-300 hover:text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                    <ReactMarkdown
                      className="prose dark:prose-invert max-w-none text-sm sm:text-base text-gray-100 break-words"
                      components={{
                        code: ({ className, children, ...props }: CodeProps) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !match;
                          
                          return !isInline ? (
                            <div className="relative group">
                              <div className="absolute top-2 right-2 flex items-center gap-2">
                                <button
                                  onClick={() => copyToClipboard(String(children))}
                                  className="p-1.5 rounded-lg bg-[#4D4D4D] hover:bg-[#5D5D5D] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200"
                                  title="Copy code"
                                >
                                  <FaCopy className="w-3.5 h-3.5 text-gray-300" />
                                </button>
                              </div>
                              <SyntaxHighlighter
                                {...props}
                                style={atomDark}
                                language={match?.[1] || 'text'}
                                PreTag="div"
                                className="text-xs sm:text-sm !pt-8 sm:!pt-8 overflow-x-auto"
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
              {isLoading && !isStreaming && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                    <FaRobot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-grow bg-[#2D2D2D] dark:bg-gray-800 rounded-xl">
                    <AILoader />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area - Adjusted for mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#2D2D2D]/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-700 z-20 px-2 sm:px-4 py-3 sm:py-4">
              <div className="max-w-5xl mx-auto">
                <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3">
                  <div className="relative flex-grow">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Message ChatGPT..."
                      className="w-full rounded-xl border-gray-700 bg-[#3D3D3D] dark:bg-gray-800 focus:border-violet-500 focus:ring-violet-500 resize-none py-2 sm:py-3 px-3 sm:px-4 pr-20 sm:pr-24 text-sm sm:text-base text-white placeholder-gray-400"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    
                    {/* Buttons Container - Adjusted for mobile */}
                    <div className="absolute right-2 bottom-2 flex items-center gap-1 sm:gap-2">
                      {messages.length > 1 && (
                        <motion.button
                          type="button"
                          onClick={clearChat}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-300 bg-[#4D4D4D] dark:bg-gray-700 rounded-lg transition-colors duration-200"
                          title="Clear chat"
                        >
                          <FaRegTrashAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </motion.button>
                      )}

                      <motion.button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-1.5 sm:p-2 rounded-lg flex items-center justify-center transition-colors duration-200
                          ${!input.trim() || isLoading
                            ? 'bg-[#4D4D4D] text-gray-400'
                            : 'bg-violet-500 text-white hover:bg-violet-600'
                          }`}
                      >
                        <motion.div
                          animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <FaPaperPlane className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </motion.div>
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Model Switch - Repositioned */}
          {/* <div className="fixed bottom-24 sm:bottom-20 right-4 z-30">
            <div className="bg-[#2D2D2D] dark:bg-gray-800 rounded-xl shadow-lg p-2 border border-gray-700">
              <ModelSwitch onChange={handleModelChange} />
            </div>
          </div> */}
        </div>

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
            {[...Array(6)].map((_, i) => {
              const angle = (i * 60) * (Math.PI / 180);
              const x = Math.cos(angle) * 50;
              const y = Math.sin(angle) * 50;

              return (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-purple-400/60 rounded-full"
                  initial={{
                    left: '50%',
                    top: '50%',
                    x: 0,
                    y: 0,
                    opacity: 0,
                    scale: 1
                  }}
                  animate={{
                    x: [0, x],
                    y: [0, y],
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
              );
            })}
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
              {[...Array(8)].map((_, i) => {
                const rotation = i * 45;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-blue-400/60 rounded-full"
                    initial={{
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${rotation}deg) translateY(-10px)`,
                      opacity: 0,
                      scale: 0.8
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
                );
              })}
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
      </main>
    </div>
  );
} 