"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { FaRobot, FaUser, FaPaperPlane, FaRegTrashAlt, FaCopy, FaBrain, FaCircle, FaCode, FaDatabase, FaNetworkWired, FaBars, FaTimes, FaPlus, FaRegClock, FaRegBookmark } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import LoadingDots from '../components/LoadingDots';
import ModelSwitch from '../components/ModelSwitch';
import AILoader from '../components/AILoader';
import PasscodeModal from '../components/PasscodeModal';
import { createClient } from '@supabase/supabase-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

// Add dummy data for saved conversations
const dummyConversations = [
  {
    id: '1',
    title: 'React Components Discussion',
    preview: 'How to create reusable components...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    category: 'Development'
  },
  {
    id: '2',
    title: 'API Integration Help',
    preview: 'Best practices for REST API...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    category: 'API'
  },
  {
    id: '3',
    title: 'UI Design Patterns',
    preview: 'Modern design patterns for...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    category: 'Design'
  },
  // Add more dummy conversations as needed
];

// Initialize Supabase client with error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

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
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const height = chatContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      
      chatContainerRef.current.scrollTo({
        top: maxScrollTop > 0 ? maxScrollTop : 0,
          behavior: 'smooth'
        });
    }
  }, []);

  // Add this new effect to handle scroll on new messages and content changes
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom, isStreaming]);

  // Function to create a new conversation with improved error handling
  const createNewConversation = async () => {
    try {
      // First ensure we have a session
      const session = await supabase.auth.getSession();
      const userId = session?.data?.session?.user?.id || 'anonymous';

      const { data, error } = await supabase
        .from('conversations')
        .insert([
          { 
            title: 'New Chat',
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select('id')
        .single();

      if (error) {
        console.error('Supabase error:', error.message);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from Supabase');
      }

      setCurrentConversationId(data.id);
      return data.id;
    } catch (error: any) {
      console.error('Error creating conversation:', {
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return null;
    }
  };

  // Function to save message to database with improved error handling
  const saveMessage = async (message: Message, conversationId: string | null) => {
    try {
      // Ensure we have a valid conversation ID
      if (!conversationId) {
        const newConversationId = await createNewConversation();
        if (!newConversationId) {
          throw new Error('Failed to create new conversation for message');
        }
        conversationId = newConversationId;
      }

      const session = await supabase.auth.getSession();
      const userId = session?.data?.session?.user?.id || 'anonymous';

      const { error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            role: message.role,
            content: message.content,
            created_at: message.timestamp.toISOString(),
            user_id: userId
          }
        ]);

      if (error) {
        console.error('Supabase error:', error.message);
        throw error;
      }

      return conversationId;
    } catch (error: any) {
      console.error('Error saving message:', {
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return null;
    }
  };

  // Function to update conversation title with improved error handling
  const updateConversationTitle = async (id: string, title: string) => {
    try {
      const session = await supabase.auth.getSession();
      const userId = session?.data?.session?.user?.id || 'anonymous';

      const { error } = await supabase
        .from('conversations')
        .update({ 
          title, 
          updated_at: new Date().toISOString(),
          user_id: userId
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error.message);
        throw error;
      }
    } catch (error: any) {
      console.error('Error updating conversation title:', {
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    }
  };

  // Modified handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    let conversationId = currentConversationId;

    // Create new conversation if none exists
    if (!conversationId) {
      const newConversationId = await createNewConversation();
      if (!newConversationId) {
        console.error('Failed to create new conversation');
        return;
      }
      conversationId = newConversationId;
      setCurrentConversationId(newConversationId);
    }

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
      // Save user message to database
      const savedConversationId = await saveMessage(userMessage, conversationId);
      if (!savedConversationId) {
        throw new Error('Failed to save user message');
      }
      conversationId = savedConversationId;

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
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(true);
      
      const fullResponse = data.response;
      let currentText = '';
      
      const chunkSize = 3;
      for (let i = 0; i < fullResponse.length; i += chunkSize) {
        const chunk = fullResponse.slice(i, i + chunkSize);
        currentText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: currentText }
            : msg
        ));
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      // Save assistant message to database
      assistantMessage.content = fullResponse;
      await saveMessage(assistantMessage, conversationId);

      // Update conversation title if it's the first message
      if (messages.length <= 2) {
        const title = userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : '');
        await updateConversationTitle(conversationId, title);
      }

      setIsStreaming(false);
      scrollToBottom();
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      // Save error message to database
      await saveMessage(errorMessage, conversationId);
      scrollToBottom();
    } finally {
      setIsLoading(false);
    }
  };

  // Modified clearChat function
  const clearChat = async () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI assistant. I can help you with various tasks including writing, analysis, coding, and more. How can I assist you today?",
      timestamp: new Date()
    }]);
    setCurrentConversationId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!', {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
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

  // Function to format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Function to fetch conversations
  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Function to fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      if (data) {
        const formattedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at)
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Function to handle new chat
  const handleNewChat = async () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI assistant. I can help you with various tasks including writing, analysis, coding, and more. How can I assist you today?",
      timestamp: new Date()
    }]);
    setCurrentConversationId(null);
    setSelectedConversation(null);
  };

  // Function to handle conversation selection
  const handleSelectConversation = async (conversation: Conversation) => {
    setCurrentConversationId(conversation.id);
    setSelectedConversation(conversation.id);
    await fetchMessages(conversation.id);
  };

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Refresh conversations list when a new conversation is created
  useEffect(() => {
    if (currentConversationId) {
      fetchConversations();
    }
  }, [currentConversationId]);

  // Update the sidebar JSX
  const renderSidebar = () => (
    <motion.div
      initial={{ x: -300, opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ 
        type: "spring", 
        bounce: 0.1, 
        duration: 0.5 
      }}
      className="fixed md:relative w-[280px] md:w-80 h-screen bg-[#2D2D2D] dark:bg-gray-800 
        flex flex-col border-r border-gray-700 z-30 shadow-2xl md:shadow-none"
    >
      {/* Sidebar Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaRegBookmark className="text-violet-500" />
            Conversations
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors md:hidden"
          >
            <FaTimes className="text-gray-400 hover:text-white" />
          </button>
        </div>
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 
            bg-violet-500 hover:bg-violet-600 text-white rounded-lg 
            transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25"
        >
          <FaPlus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1
        scrollbar-thin scrollbar-track-[#2D2D2D] dark:scrollbar-track-gray-800/40
        scrollbar-thumb-gradient hover:scrollbar-thumb-gradient-hover
        scrollbar-track-rounded-full scrollbar-thumb-rounded-full
        [--scrollbar-gradient:linear-gradient(to_bottom,#8B5CF6,#6D28D9)]
        [--scrollbar-gradient-hover:linear-gradient(to_bottom,#9333EA,#7C3AED)]"
      >
        {isLoadingConversations ? (
          <div className="flex items-center justify-center py-4">
            <AILoader />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            No conversations yet
          </div>
        ) : (
          conversations.map((conv) => (
            <motion.div
              key={conv.id}
              whileHover={{ x: 4 }}
              className={`p-3 cursor-pointer transition-all duration-200 
                ${selectedConversation === conv.id 
                  ? 'bg-violet-500/20 border-l-2 border-violet-500' 
                  : 'hover:bg-gray-700/50 border-l-2 border-transparent'}`}
              onClick={() => handleSelectConversation(conv)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{conv.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conv.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#1E1E1E] dark:bg-gray-900 relative">
      <ToastContainer />
      {!isAuthenticated && <PasscodeModal onAuthenticate={handleAuthentication} />}
      
      {/* Fixed Background Layer */}
      <div className="fixed inset-0 bg-[#1E1E1E] dark:bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/5 to-transparent dark:from-violet-900/5"></div>
        <div className="absolute inset-0 bg-[url('/ai-grid.svg')] bg-repeat opacity-[0.02] neural-network" />
      </div>

      <div className="flex h-screen overflow-hidden relative z-10">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <>
              {/* Overlay for mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-20"
                onClick={() => setIsSidebarOpen(false)}
              />
              {renderSidebar()}
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Toggle Sidebar Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed top-4 left-4 z-30 p-2 bg-[#2D2D2D] hover:bg-gray-700 rounded-lg 
              transition-all duration-200 border border-gray-700 shadow-lg
              hover:shadow-violet-500/10"
          >
            <FaBars className="text-gray-400 hover:text-white w-5 h-5" />
          </motion.button>

          {/* Main Chat Container */}
          <div className="flex-1 flex flex-col h-full relative">
            <div className="absolute inset-0 flex flex-col max-w-5xl mx-auto w-full px-2 sm:px-4 
              pt-16 md:pt-4"
            >
            {/* Messages Container */}
            <div 
              ref={chatContainerRef}
                className={`flex-1 overflow-y-auto space-y-3 sm:space-y-4 scroll-smooth px-2 sm:px-4 
                  pb-32 pt-4 sm:pt-6
                  transition-all duration-300 ease-out
                  ${isSidebarOpen ? 'md:ml-0' : 'ml-0'}
                  scrollbar-thin scrollbar-track-[#2D2D2D] dark:scrollbar-track-gray-800/40
                  scrollbar-thumb-gradient hover:scrollbar-thumb-gradient-hover
                  scrollbar-track-rounded-full scrollbar-thumb-rounded-full
                  [--scrollbar-gradient:linear-gradient(to_bottom,#8B5CF6,#6D28D9)]
                  [--scrollbar-gradient-hover:linear-gradient(to_bottom,#9333EA,#7C3AED)]
                  [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-1
                  [&::-webkit-scrollbar-track]:bg-[#2D2D2D] dark:[&::-webkit-scrollbar-track]:bg-gray-800/40
                  [&::-webkit-scrollbar-track]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-violet-500 [&::-webkit-scrollbar-thumb]:to-purple-600
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb:hover]:from-violet-400 [&::-webkit-scrollbar-thumb:hover]:to-purple-500
                  [&::-webkit-scrollbar-thumb]:transition-all [&::-webkit-scrollbar-thumb]:duration-300`}
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
                      {/* Message Actions Bar */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 px-1 flex items-center gap-2">
                          {message.role === 'assistant' ? (
                            <>
                              <FaRobot className="w-3 h-3" />
                              <span>AI Assistant</span>
                            </>
                          ) : (
                            <>
                              <FaUser className="w-3 h-3" />
                              <span>You</span>
                            </>
                          )}
                      </span>
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(message.content)}
                            className="p-1.5 rounded-lg bg-[#4D4D4D] hover:bg-[#5D5D5D] transition-colors duration-200 opacity-0 group-hover:opacity-100 flex items-center gap-1.5"
                            title="Copy message"
                        >
                          <FaCopy className="w-3 h-3 text-gray-300" />
                            <span className="text-xs text-gray-300 hidden sm:inline">Copy</span>
                          </motion.button>
                        {message.id !== 'welcome' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteMessage(message.id)}
                              className="p-1.5 rounded-lg bg-[#4D4D4D] hover:bg-red-900/30 transition-colors duration-200 opacity-0 group-hover:opacity-100 flex items-center gap-1.5"
                            title="Delete message"
                          >
                            <FaRegTrashAlt className="w-3 h-3 text-gray-300 hover:text-red-400" />
                              <span className="text-xs text-gray-300 hidden sm:inline">Delete</span>
                            </motion.button>
                        )}
                      </div>
                    </div>
                    <ReactMarkdown
                        className="prose dark:prose-invert max-w-none text-[13px] sm:text-base text-gray-100 break-words"
                      components={{
                        code: ({ className, children, ...props }: CodeProps) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !match;
                          
                          return !isInline ? (
                              <div className="relative group/code mt-2">
                                <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  onClick={() => copyToClipboard(String(children))}
                                    className="p-1.5 rounded-lg bg-[#4D4D4D] hover:bg-[#5D5D5D] opacity-0 group-hover/code:opacity-100 transition-all duration-200 flex items-center gap-1.5"
                                  title="Copy code"
                                >
                                  <FaCopy className="w-3.5 h-3.5 text-gray-300" />
                                    <span className="text-xs text-gray-300 hidden sm:inline">Copy Code</span>
                                  </motion.button>
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
                      
                      {/* Message timestamp */}
                      <div className="mt-2 text-right">
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
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

              {/* Input Area - Adjusted for mobile and sidebar */}
              <div className={`fixed bottom-0 left-0 right-0 bg-[#2D2D2D]/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-700 z-40 
                transition-all duration-300 ease-out
                ${isSidebarOpen ? 'md:left-80 left-0' : 'left-0'}`}
              >
                <div className="max-w-5xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
                <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3">
                  <div className="relative flex-grow">
                    <textarea
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = 'auto';
                        const lineHeight = 20;
                        const padding = 16;
                        const lines = e.target.value.split('\n').length;
                        const singleLineHeight = lineHeight + padding;
                        const scrollHeight = e.target.scrollHeight;
                        const newHeight = Math.max(
                          singleLineHeight,
                          Math.min(scrollHeight, 120)
                        );
                        e.target.style.height = `${newHeight}px`;
                        if (chatContainerRef.current) {
                          chatContainerRef.current.style.setProperty('--input-height', `${newHeight}px`);
                        }
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything! 💭"
                      className={`w-full rounded-xl border border-gray-700 bg-[#3D3D3D] dark:bg-gray-800 
                        focus:border-violet-500 focus:ring-1 focus:ring-violet-500 
                        resize-none py-2 px-4 pr-20 sm:pr-24 
                        text-sm sm:text-base text-white placeholder:text-gray-400
                        transition-all duration-200 ease-out
                        overflow-y-auto
                        scrollbar-thin scrollbar-track-[#2D2D2D] dark:scrollbar-track-gray-800/40
                        scrollbar-thumb-gradient hover:scrollbar-thumb-gradient-hover
                        scrollbar-track-rounded-full scrollbar-thumb-rounded-full
                        [--scrollbar-gradient:linear-gradient(to_bottom,#8B5CF6,#6D28D9)]
                        [--scrollbar-gradient-hover:linear-gradient(to_bottom,#9333EA,#7C3AED)]
                        [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-1
                        [&::-webkit-scrollbar-track]:bg-[#2D2D2D] dark:[&::-webkit-scrollbar-track]:bg-gray-800/40
                        [&::-webkit-scrollbar-track]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-violet-500 [&::-webkit-scrollbar-thumb]:to-purple-600
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb:hover]:from-violet-400 [&::-webkit-scrollbar-thumb:hover]:to-purple-500
                        [&::-webkit-scrollbar-thumb]:transition-all [&::-webkit-scrollbar-thumb]:duration-300
                        min-h-[36px] max-h-[120px]`}
                      style={{
                        height: 'auto',
                        overflowY: input.split('\n').length > 3 ? 'scroll' : 'hidden'
                      }}
                    />

                    {/* Input Actions */}
                    <div className="absolute right-2 bottom-2 flex items-center gap-1 sm:gap-2">
                      {messages.length > 1 && (
                        <motion.button
                          type="button"
                          onClick={clearChat}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-300 
                              bg-[#4D4D4D] dark:bg-gray-700 rounded-lg 
                              transition-colors duration-200
                              hover:bg-[#5D5D5D]"
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
                          className={`p-1.5 sm:p-2 rounded-lg flex items-center justify-center 
                            transition-all duration-200 ease-out
                          ${!input.trim() || isLoading
                              ? 'bg-[#4D4D4D] text-gray-400 cursor-not-allowed opacity-50'
                              : 'bg-violet-500 text-white hover:bg-violet-600 shadow-lg hover:shadow-violet-500/25'
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
            </div>
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
      </div>
    </div>
  );
} 