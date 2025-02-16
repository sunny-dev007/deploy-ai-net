'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, XCircle, Maximize2, Minimize2, MessageCircle, Copy, Trash2, CheckCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function VectorChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date()
    }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/vector-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          messages: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (content: string, messageId: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleDeleteMessage = (messageId: number) => {
    setMessages(prev => prev.filter((_, index) => index !== messageId));
  };

  const chatWindowClass = `fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl 
    ${isExpanded ? 'w-[900px] h-[800px]' : 'w-[550px] h-[600px]'}
    flex flex-col transition-all duration-300 ease-in-out z-50 border border-gray-100`;

  return (
    <>
      {/* Chat Bubble Icon */}
      {!isOpen && (
        <motion.button
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 z-50"
          onClick={() => setIsOpen(true)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={chatWindowClass}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-xl">
              <div className="flex items-center">
                <Bot className="w-6 h-6 text-white" />
                <h2 className="ml-2 text-lg font-semibold text-white">Document Assistant</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
                <button
                  onClick={() => setMessages([])}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <XCircle size={20} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {messages.length === 0 && (
                <div className="text-center text-gray-600 mt-4">
                  <Bot className="w-12 h-12 mx-auto mb-2 text-indigo-400" />
                  <p className="text-sm">Ask me anything about your documents!</p>
                </div>
              )}
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[90%] ${
                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className="relative group">
                        <div className={`p-3 rounded-xl shadow-sm ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                        }`}>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-base font-semibold mb-2" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-sm font-semibold mb-1" {...props} />,
                                p: ({ node, ...props }) => (
                                  <p className={`text-sm mb-2 leading-relaxed ${
                                    message.role === 'user' ? 'text-white' : 'text-gray-800'
                                  }`} {...props} />
                                ),
                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                li: ({ node, ...props }) => (
                                  <li className={`text-sm mb-1 ${
                                    message.role === 'user' ? 'text-white' : 'text-gray-800'
                                  }`} {...props} />
                                ),
                                code: ({ className, children, ...props }: any) => {
                                  const match = /language-(\w+)/.exec(className || '');
                                  return match ? (
                                    <div className="rounded-md overflow-hidden my-2">
                                      <SyntaxHighlighter
                                        language={match[1]}
                                        style={atomDark}
                                        customStyle={{
                                          margin: 0,
                                          padding: '0.75rem',
                                          fontSize: '0.8rem',
                                          backgroundColor: message.role === 'user' ? 'rgba(0,0,0,0.3)' : '#1a1a1a'
                                        }}
                                      >
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    </div>
                                  ) : (
                                    <code className={`${
                                      message.role === 'user' 
                                        ? 'bg-purple-500/30 text-white' 
                                        : 'bg-gray-200 text-gray-800'
                                    } px-1 py-0.5 rounded text-sm`} {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                blockquote: ({ node, ...props }) => (
                                  <blockquote 
                                    className={`border-l-4 ${
                                      message.role === 'user' 
                                        ? 'border-white/30 bg-white/10' 
                                        : 'border-indigo-300 bg-indigo-50'
                                    } pl-3 py-1 my-2`} 
                                    {...props} 
                                  />
                                ),
                                table: ({ node, ...props }) => (
                                  <div className="overflow-x-auto my-2">
                                    <table className="min-w-full divide-y divide-gray-200" {...props} />
                                  </div>
                                ),
                                th: ({ node, ...props }) => (
                                  <th className="px-2 py-1 text-xs font-semibold bg-gray-50" {...props} />
                                ),
                                td: ({ node, ...props }) => (
                                  <td className="px-2 py-1 text-xs border-t" {...props} />
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                          
                          {/* Message Footer */}
                          <div className="flex items-center justify-between mt-2 gap-2">
                            <span className={`text-xs ${
                              message.role === 'user' ? 'text-white/90' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            
                            {/* Action Buttons */}
                            <div className={`flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                              message.role === 'user' ? 'text-white' : 'text-gray-600'
                            }`}>
                              <button
                                onClick={() => handleCopyMessage(message.content, index)}
                                className={`p-1 rounded transition-colors ${
                                  message.role === 'user' 
                                    ? 'hover:bg-white/20' 
                                    : 'hover:bg-gray-100'
                                }`}
                                title="Copy message"
                              >
                                {copiedMessageId === index ? (
                                  <CheckCheck className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(index)}
                                className={`p-1 rounded transition-colors ${
                                  message.role === 'user' 
                                    ? 'hover:bg-white/20' 
                                    : 'hover:bg-gray-100'
                                }`}
                                title="Delete message"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-indigo-100' 
                          : 'bg-gradient-to-r from-purple-100 to-indigo-100'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Bot className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="bg-gray-100 p-3 rounded-xl shadow-sm">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your documents..."
                  className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 
                             focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900
                             placeholder-gray-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg
                            hover:from-purple-700 hover:to-indigo-700
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 