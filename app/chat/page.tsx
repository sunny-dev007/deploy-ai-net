"use client";

import type { JSX } from 'react';
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaUser, FaPaperPlane, FaRegLightbulb, FaRegTrashAlt, FaCopy } from 'react-icons/fa';
import LoadingDots from '../components/LoadingDots';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type Suggestion = {
  text: string;
  icon: JSX.Element;
};

const suggestions: Suggestion[] = [
  { text: "Explain quantum computing", icon: <FaRegLightbulb /> },
  { text: "Write a poem about nature", icon: <FaRegLightbulb /> },
  { text: "Debug my React code", icon: <FaRegLightbulb /> },
  { text: "Suggest weekend activities", icon: <FaRegLightbulb /> },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
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
    setShowSuggestions(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: Add a toast notification here
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'inherit';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setInput(e.target.value);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-gray-900">
      <Nav />
      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-blue-50 via-white to-transparent dark:from-gray-800 dark:via-gray-900 py-12">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/ai-pattern.svg')] bg-center opacity-5"></div>
          </div>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">
              AI Chat Assistant
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Have natural conversations with our advanced AI. Get answers, insights, and solutions instantly.
            </p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 h-[600px] flex flex-col">
              {/* Messages Container */}
              <div 
                ref={chatContainerRef}
                className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6"
              >
                {messages.length === 0 && showSuggestions ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <FaRobot className="w-16 h-16 text-blue-500 mb-6" />
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                      Start a Conversation
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
                      Choose a suggestion below or type your own message to begin chatting with our AI assistant.
                    </p>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setInput(suggestion.text)}
                          className="flex items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                        >
                          {suggestion.icon}
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {suggestion.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`flex items-start gap-4 ${
                            message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === 'assistant' 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                              : 'bg-gradient-to-r from-green-500 to-teal-500'
                          }`}>
                            {message.role === 'assistant' ? (
                              <FaRobot className="w-4 h-4 text-white" />
                            ) : (
                              <FaUser className="w-4 h-4 text-white" />
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
                    </AnimatePresence>
                    {isLoading && (
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <FaRobot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
                          <LoadingDots color="gray-400" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="flex gap-4">
                  <div className="relative flex-grow">
                    <textarea
                      value={input}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message... (Enter to send, Shift + Enter for new line)"
                      className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500 resize-none py-3 px-4 pr-12 max-h-32"
                      style={{ minHeight: '44px' }}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 bottom-2 p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
} 