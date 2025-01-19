"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  FaUser, FaCloudUploadAlt, FaFileAlt, FaHistory, 
  FaCog, FaBell, FaFolder, FaChartLine, FaDownload,
  FaTrash, FaEllipsisH, FaSearch
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDistanceToNow } from 'date-fns';
import { formatBytes } from '../utils/formatBytes';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  createdTime: string;
  webViewLink: string;
  iconLink: string;
}

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('files');
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState<string | null>(null);

  // Function to fetch files
  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/drive-files');
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
      setFiles(data.files);
    } catch (err) {
      setError('Failed to load files');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Authentication check effect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch files effect
  useEffect(() => {
    if (session) {
      fetchFiles();
    }
  }, [session]);

  const handleDeleteFile = async (fileId: string) => {
    try {
      setIsDeletingFile(fileId);
      const response = await fetch('/api/drive-files/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      toast.success('File deleted successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      fetchFiles();
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsDeletingFile(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    let successCount = 0;
    let errorCount = 0;

    for (const file of fileArray) {
      const fileId = Math.random().toString(36).substring(7);
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload-to-drive', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        successCount++;
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      } catch (error) {
        console.error('Upload error:', error);
        errorCount++;
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }
    }

    // Show summary toast with react-toastify
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    if (errorCount > 0) {
      toast.error(`Failed to upload ${errorCount} file${errorCount !== 1 ? 's' : ''}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    fetchFiles();
  };

  // Add this function to render upload progress
  const renderUploadProgress = () => {
    return Object.entries(uploadProgress).map(([fileId, progress]) => (
      <div key={fileId} className="mt-2">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    ));
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <FaBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <FaCog className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center space-x-3">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <FaUser className="w-4 h-4 text-gray-600" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {session?.user?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">7.5 GB</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FaChartLine className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: '45%' }} />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Files</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">128</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FaFolder className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">+12 files this week</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recent Uploads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <FaCloudUploadAlt className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</p>
            </div>
          </motion.div>
        </div>

        {/* File Management Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-6">
              {['files', 'recent', 'shared'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Actions */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="flex space-x-4">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center px-4 py-2 ${
                    Object.keys(uploadProgress).length > 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  } text-white rounded-lg transition-colors`}
                  onClick={e => {
                    if (Object.keys(uploadProgress).length > 0) {
                      e.preventDefault();
                    }
                  }}
                >
                  <FaCloudUploadAlt className="w-5 h-5 mr-2" />
                  {Object.keys(uploadProgress).length > 0 ? 'Uploading...' : 'Upload Files'}
                </label>
              </div>
            </div>
          </div>

          {/* File List */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No files uploaded yet
              </div>
            ) : (
              <div className="space-y-4">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => handleFileSelect(file.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <img
                        src={file.iconLink}
                        alt={file.mimeType}
                        className="w-8 h-8"
                      />
                      <div>
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {file.name}
                        </a>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatBytes(parseInt(file.size))} • {formatDistanceToNow(new Date(file.createdTime))} ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                      >
                        <FaDownload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </a>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        disabled={isDeletingFile === file.id}
                        className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full ${
                          isDeletingFile === file.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isDeletingFile === file.id ? (
                          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaTrash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 