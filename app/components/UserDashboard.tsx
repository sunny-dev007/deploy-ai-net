"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaCloudUploadAlt } from 'react-icons/fa';

const UserDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('Uploading...');

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', session?.user?.email || '');

      // Upload to Google Drive
      const response = await fetch('/api/upload-to-drive', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadStatus('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!session) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
    >
      {/* User Info Section */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div className="flex items-center space-x-4">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <FaUser className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {session.user?.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{session.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          <FaSignOutAlt />
          <span>Sign Out</span>
        </button>
      </div>

      {/* File Upload Section */}
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-4"
          >
            <FaCloudUploadAlt className="w-12 h-12 text-blue-500" />
            <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {uploading ? 'Uploading...' : 'Click to upload files to Google Drive'}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supported files: PDF, DOCX, XLSX, Images
            </p>
          </label>
        </div>
        {uploadStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center p-4 rounded-lg ${
              uploadStatus.includes('successfully')
                ? 'bg-green-100 text-green-700'
                : uploadStatus.includes('failed')
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {uploadStatus}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default UserDashboard; 