"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FaHome,
  FaUser,
  FaCog,
  FaBell,
  FaSignOutAlt,
  FaChartLine,
  FaCalendar,
  FaTasks,
  FaInbox,
  FaSearch,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaRobot,
  FaCode,
  FaNetworkWired,
  FaEdit,
  FaChartBar,
  FaComments,
  FaBook,
  FaFile,
  FaMicrophone,
  FaPalette,
  FaSwatchbook,
  FaSlidersH
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IconType } from 'react-icons';

type SidebarItem = {
  id?: string;
  type?: 'header';
  label: string;
  icon?: IconType;
  path?: string;
};

type ThemeColors = {
  sidebar: string;
  header: string;
  background: string;
  accent: string;
};

type Theme = {
  name: string;
  colors: ThemeColors;
};

// Add theme presets
const themePresets: Theme[] = [
  {
    name: 'Default Dark',
    colors: {
      sidebar: '#111827',
      header: '#1F2937',
      background: '#111827',
      accent: '#3B82F6'
    }
  },
  {
    name: 'Modern Purple',
    colors: {
      sidebar: '#2D1B69',
      header: '#1F1147',
      background: '#13082D',
      accent: '#7C3AED'
    }
  },
  {
    name: 'Ocean Blue',
    colors: {
      sidebar: '#0F172A',
      header: '#1E293B',
      background: '#0F172A',
      accent: '#38BDF8'
    }
  },
  {
    name: 'Forest Green',
    colors: {
      sidebar: '#064E3B',
      header: '#065F46',
      background: '#064E3B',
      accent: '#34D399'
    }
  }
];

export default function UserDashboard() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Welcome to your dashboard!', time: 'Just now' },
    { id: 2, text: 'Your profile is 80% complete', time: '2h ago' },
  ]);
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(themePresets[0]);
  const [customColors, setCustomColors] = useState<ThemeColors>(themePresets[0].colors);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userSession = localStorage.getItem('userSession');
        
        if (!userSession) {
          router.push('/auth');
          return;
        }

        // Get user details from session
        try {
          const userData = JSON.parse(userSession);
          setUser(userData);
        } catch (e) {
          // If session data is invalid, redirect to auth
          localStorage.removeItem('userSession');
          router.push('/auth');
          return;
        }
        
        setIsLoading(false);

        // Setup event listener for storage changes (for logout from other tabs)
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === 'userSession' && !e.newValue) {
            router.push('/auth');
          }
        };

        window.addEventListener('storage', handleStorageChange);

        // Cleanup subscription on unmount
        return () => {
          window.removeEventListener('storage', handleStorageChange);
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        router.push('/auth');
      }
    };

    initializeAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      
      localStorage.removeItem('userSession');
      
      toast.success('👋 Signed out successfully! Redirecting...', {
        position: 'top-center',
        autoClose: 2000,
      });
      
      // Small delay for toast to be visible
      setTimeout(() => {
        router.push('/auth');
      }, 1500);
    } catch (error: any) {
      toast.error('Error signing out: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarItems: SidebarItem[] = [
    // Dashboard Section
    { type: 'header', label: 'Dashboard' },
    { id: 'dashboard', icon: FaHome, label: 'Overview', path: '/user-dash' },
    
    // AI Assistants Section
    { type: 'header', label: 'AI Assistants' },
    { id: 'chat-bot', icon: FaRobot, label: 'Chat AI Assistant', path: '/chat-bot' },
    { id: 'code', icon: FaCode, label: 'Developer Copilot', path: '/code' },
    { id: 'devops', icon: FaNetworkWired, label: 'DevSecOps Copilot', path: '/devops' },
    { id: 'content', icon: FaEdit, label: 'Content Copilot', path: '/content' },
    
    // Analysis Tools Section
    { type: 'header', label: 'Analysis Tools' },
    { id: 'report', icon: FaChartBar, label: 'Report Analysis', path: '/report' },
    { id: 'analyze', icon: FaSearch, label: 'General Analysis', path: '/analyze' },
    { id: 'analyze-code', icon: FaCode, label: 'Code Analysis', path: '/analyze-code' },
    
    // Generation Tools Section
    { type: 'header', label: 'Generation Tools' },
    { id: 'text', icon: FaEdit, label: 'Text Generation', path: '/text' },
    { id: 'resume', icon: FaFile, label: 'Resume Builder', path: '/resume' },
    
    // Communication Section
    { type: 'header', label: 'Communication' },
    { id: 'chat', icon: FaComments, label: 'Chat Bot', path: '/chat' },
    { id: 'voice', icon: FaMicrophone, label: 'Voice Chat', path: '/voice' },
    
    // Additional Tools Section
    { type: 'header', label: 'Additional Tools' },
    { id: 'homework', icon: FaBook, label: 'Homework Helper', path: '/homework' },
    
    // Settings Section
    { type: 'header', label: 'Settings' },
    { id: 'settings', icon: FaCog, label: 'Settings', path: '/settings' }
  ];

  const handleNavigation = (path: string | undefined) => {
    if (path) {
      router.push(path);
      setActiveTab(path.substring(1)); // Remove the leading slash for activeTab
    }
  };

  // Add theme customization functions
  const applyTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    setCustomColors(theme.colors);
    // Apply colors to root element for CSS variables
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    const newColors = { ...customColors, [colorKey]: value };
    setCustomColors(newColors);
    const root = document.documentElement;
    root.style.setProperty(`--color-${colorKey}`, value);
  };

  // Add theme customizer component
  const ThemeCustomizer = () => (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-screen w-80 bg-white dark:bg-gray-800 shadow-2xl z-50
        overflow-y-auto border-l border-gray-200 dark:border-gray-700"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Theme Customization
          </h2>
          <button
            onClick={() => setIsThemeCustomizerOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaTimes className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Theme Mode Toggle */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Theme Mode</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(false)}
              className={`flex items-center px-4 py-2 rounded-lg ${
                !isDarkMode
                  ? 'bg-violet-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FaSun className="w-4 h-4 mr-2" />
              Light
            </button>
            <button
              onClick={() => setIsDarkMode(true)}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isDarkMode
                  ? 'bg-violet-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FaMoon className="w-4 h-4 mr-2" />
              Dark
            </button>
          </div>
        </div>

        {/* Theme Presets */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Theme Presets</h3>
          <div className="grid grid-cols-2 gap-4">
            {themePresets.map((theme) => (
              <button
                key={theme.name}
                onClick={() => applyTheme(theme)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  currentTheme.name === theme.name
                    ? 'border-violet-500'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-full h-20 rounded-md" style={{ background: theme.colors.sidebar }}>
                    <div className="h-6 rounded-t-md" style={{ background: theme.colors.header }} />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{theme.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Custom Colors</h3>
          <div className="space-y-4">
            {Object.entries(customColors).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {key}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                    className="w-20 px-2 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700
                      text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Add theme customizer button to the header
  const renderThemeButton = () => (
    <button
      onClick={() => setIsThemeCustomizerOpen(true)}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
        relative group"
    >
      <FaPalette className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      <span className="absolute top-10 right-0 w-32 bg-black text-white text-xs rounded py-1 px-2 
        opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Customize Theme
      </span>
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}
      style={{
        '--color-sidebar': customColors.sidebar,
        '--color-header': customColors.header,
        '--color-background': customColors.background,
        '--color-accent': customColors.accent,
      } as React.CSSProperties}
    >
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed md:relative w-64 h-screen bg-[#111827] shadow-lg z-50"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
                <h2 className="text-xl font-bold text-white tracking-wide">AI Studio</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="md:hidden p-2 rounded-lg hover:bg-white/[0.08] transition-colors duration-200"
                >
                  <FaTimes className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Sidebar Menu */}
              <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]
                custom-scrollbar relative
                [&::-webkit-scrollbar]:w-[6px]
                [&::-webkit-scrollbar]:transition-all
                [&::-webkit-scrollbar]:duration-300
                [&::-webkit-scrollbar-track]:transparent
                [&::-webkit-scrollbar-track]:hover:bg-white/[0.02]
                [&::-webkit-scrollbar-thumb]:bg-white/[0.08]
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:hover:bg-white/[0.15]
                [&::-webkit-scrollbar-thumb]:transition-all
                [&::-webkit-scrollbar-thumb]:duration-300
                [&::-webkit-scrollbar-thumb]:hover:w-[8px]
                hover:[&::-webkit-scrollbar]:w-[8px]">
                <div className="space-y-2.5 pr-2">
                  {sidebarItems.map((item, index) => (
                    item.type === 'header' ? (
                      <div key={`header-${index}`} className="mt-6 mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {item.label}
                      </div>
                    ) : item.icon ? (
                      <motion.button
                        key={item.id}
                        onClick={() => handleNavigation(item.path)}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 
                          relative group overflow-hidden ${
                          activeTab === item.id
                            ? 'bg-[#1a1f37] text-white shadow-lg shadow-black/10'
                            : 'text-gray-400 hover:text-gray-100'
                        }`}
                      >
                        {/* Background hover effect */}
                        <motion.div
                          className="absolute inset-0 bg-[#1a1f37]/0 group-hover:bg-[#1a1f37]/50 
                            transition-all duration-200"
                          initial={false}
                          animate={{ opacity: activeTab === item.id ? 1 : 0 }}
                        />
                        
                        {/* Left accent bar */}
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 transform -translate-x-full"
                          initial={false}
                          animate={{ 
                            translateX: activeTab === item.id ? 0 : '-100%',
                            opacity: activeTab === item.id ? 1 : 0
                          }}
                          transition={{ duration: 0.2 }}
                        />

                        <div className="relative flex items-center">
                          <item.icon className={`w-5 h-5 mr-3 transition-all duration-200 ${
                            activeTab === item.id 
                              ? 'text-blue-400 scale-110' 
                              : 'text-gray-400 group-hover:text-gray-300'
                          }`} />
                          <span className="text-sm font-medium tracking-wide">{item.label}</span>
                        </div>
                      </motion.button>
                    ) : null
                  ))}
                </div>
              </nav>

              {/* Sidebar Footer */}
              <div className="absolute bottom-0 w-full p-4 border-t border-white/[0.08] bg-[#111827]">
                <motion.button
                  onClick={handleSignOut}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center w-full px-4 py-3 rounded-lg 
                    text-red-400 hover:text-red-300 hover:bg-red-500/10
                    transition-all duration-200"
                >
                  <FaSignOutAlt className="w-5 h-5 mr-3" />
                  <span className="font-medium tracking-wide">Sign Out</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation */}
          <header className="bg-white dark:bg-gray-800 shadow-sm"
            style={{ background: 'var(--color-header)' }}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaBars className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {renderThemeButton()}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isDarkMode ? (
                    <FaSun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <FaMoon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                <div className="relative">
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FaBell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <img
                    src={user?.user_metadata?.avatar_url || 'https://via.placeholder.com/32'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.user_metadata?.full_name || user?.email}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
            style={{ background: 'var(--color-background)' }}
          >
            <div className="max-w-7xl mx-auto">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Here's what's happening with your projects today.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Total Projects', value: '12', change: '+2.5%' },
                  { label: 'Active Tasks', value: '8', change: '+1.2%' },
                  { label: 'Completed', value: '24', change: '+3.1%' },
                  { label: 'In Progress', value: '6', change: '-0.5%' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                  >
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </h3>
                    <div className="mt-2 flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className={`ml-2 text-sm ${
                        stat.change.startsWith('+') 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {stat.change}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity & Notifications */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Activity
                    </h2>
                    <div className="space-y-4">
                      {[
                        { text: 'Project "AI Chat Bot" was updated', time: '2 hours ago' },
                        { text: 'New team member added', time: '4 hours ago' },
                        { text: 'Meeting scheduled for tomorrow', time: '5 hours ago' }
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0"
                        >
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-violet-500 rounded-full mr-3"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {activity.text}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Notifications
                    </h2>
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0"
                        >
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {notification.text}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">{notification.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <ToastContainer theme={isDarkMode ? 'dark' : 'light'} />

      {/* Add Theme Customizer */}
      <AnimatePresence>
        {isThemeCustomizerOpen && <ThemeCustomizer />}
      </AnimatePresence>
    </div>
  );
} 