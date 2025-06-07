"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  FaUser, FaCloudUploadAlt, FaHistory, 
  FaCog, FaBell, FaDownload,
  FaTrash, FaSearch, FaDatabase, FaTrashRestore,
  FaHome, FaSignOutAlt, FaUserCircle, FaChevronDown,
  FaTachometerAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDistanceToNow } from 'date-fns';
import { formatBytes } from '../utils/formatBytes';
import { Check, AlertCircle, Clock, Files, HardDrive, FileText, Binary, Network } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import ConfirmationDialog from './ConfirmationDialog';


interface FileMetadata {
  averageChunkSize?: number;
  processingTime?: number;
  [key: string]: unknown;
}

interface FileIngestion {
  id: string;
  user_id: string;
  email_id: string | null | undefined;
  file_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: 'pending' | 'ingested' | 'failed';
  vector_count?: number;
  chunk_count?: number;
  ingestion_date?: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
  metadata?: FileMetadata;
  pinecone_namespace?: string;
  is_archived?: boolean;
  deleted_at?: string | null;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  createdTime: string;
  webViewLink: string;
  iconLink: string;
  isProcessing?: boolean;
}

interface DashboardStats {
  storageUsed: number;
  totalFiles: number;
  recentUploads: number;
  totalVectors: number;
  averageChunkSize: number;
  processingFiles: number;
  averageEmbeddingDimension: number;
  vectorDensity: number;
  processingTimes: number[];
  fileTypeDistribution: Record<string, number>;
  embeddingStats: {
    minMagnitude: number;
    maxMagnitude: number;
    averageMagnitude: number;
  };
  chunkStats: {
    minSize: number;
    maxSize: number;
    optimalChunks: number;
  };
  ingestionSuccess: {
    successful: number;
    failed: number;
    pending: number;
  };
  vectorQuality: {
    density: number;
    efficiency: number;
    dimensions: number;
  };
  contentMetrics: {
    textDensity: number;
    averageDocumentSize: number;
    processingEfficiency: number;
  };
  timeMetrics: {
    averageProcessingTime: number;
    fastestProcessing: number;
    slowestProcessing: number;
  };
}

const getColorForIndex = (index: number): string => {
  const colors = [
    '#4F46E5', // indigo
    '#7C3AED', // violet
    '#EC4899', // pink
    '#F59E0B', // amber
    '#10B981', // emerald
    '#3B82F6', // blue
  ];
  return colors[index % colors.length];
};

const FileCard = ({ 
  file, 
  ingestionStatus,
  onDelete,
  onIngest,
  isProcessing
}: { 
  file: DriveFile; 
  ingestionStatus?: FileIngestion;
  onDelete: (fileId: string) => void;
  onIngest: (fileId: string, fileName: string) => void;
  isProcessing?: boolean;
}) => {
  const [isRefreshing] = useState(false);

  const handleIngest = async () => {
    onIngest(file.id, file.name);
  };

  const getStatusIcon = () => {
    // Check what's happening with processing state
    const isCurrentlyProcessing = isProcessing || isRefreshing;
    const hasPendingStatus = ingestionStatus?.status === 'pending' && !ingestionStatus.deleted_at;
    
    // Always show loader first if file is being processed OR has pending status
    if (isCurrentlyProcessing || hasPendingStatus) {
      return (
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          data-tooltip-id="status-tooltip"
          data-tooltip-content={
            isCurrentlyProcessing 
              ? "Processing file..." 
              : hasPendingStatus 
                ? "Ingestion in progress..." 
                : "Updating status..."
          }
          className="p-2"
        >
          <Clock className="w-5 h-5 text-yellow-500" />
        </motion.div>
      );
    }

    // If file has ingestion status and is not deleted, show status-based icon
    if (ingestionStatus && !ingestionStatus.deleted_at) {
      switch (ingestionStatus.status) {
        case 'ingested':
          return (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-2"
              data-tooltip-id="status-tooltip"
              data-tooltip-content={`✓ Successfully ingested\n${ingestionStatus.vector_count || 0} vectors created\nClick to view details`}
            >
              <div className="relative">
                <Check className="w-5 h-5 text-green-500" />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-green-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          );
        case 'failed':
          return (
            <div 
              className="p-2"
              data-tooltip-id="status-tooltip"
              data-tooltip-content={`Ingestion failed: ${ingestionStatus.error_message || 'Unknown error'}`}
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          );
        // Note: 'pending' case is now handled above in the processing check
        default:
          return null;
      }
    }

    // Default: show ingest button for files without status or deleted files
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleIngest}
        className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-full transition-colors"
        data-tooltip-id="status-tooltip"
        data-tooltip-content="Ingest file into AI database"
      >
        <FaDatabase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      </motion.button>
    );
  };

  // Get file type icon as fallback
  const getFileTypeIcon = () => {
    const mimeType = file.mimeType.toLowerCase();
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('text')) return '📃';
    return '📁';
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300">
        <div className="flex items-center space-x-4">
          {/* File icon with fallback */}
          <div className="w-8 h-8 flex items-center justify-center">
            {file.iconLink ? (
              <img
                src={file.iconLink}
                alt={file.mimeType}
                className="w-8 h-8"
                onError={(e) => {
                  // Replace with emoji fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-2xl">${getFileTypeIcon()}</span>`;
                  }
                }}
              />
            ) : (
              <span className="text-2xl">{getFileTypeIcon()}</span>
            )}
          </div>
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
              {ingestionStatus && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-600">
                  {ingestionStatus.status}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            href={file.webViewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-blue-100 rounded-full transition-colors"
            data-tooltip-id="action-tooltip"
            data-tooltip-content="Open file in Google Drive"
          >
            <FaDownload className="w-4 h-4 text-blue-600" />
          </motion.a>
          {getStatusIcon()}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(file.id)}
            className="p-2 hover:bg-red-100 rounded-full transition-colors"
            data-tooltip-id="action-tooltip"
            data-tooltip-content={ingestionStatus?.deleted_at ? "Restore file" : "Archive file"}
          >
            {ingestionStatus?.deleted_at ? (
              <FaTrashRestore className="w-4 h-4 text-green-600" />
            ) : (
              <FaTrash className="w-4 h-4 text-red-600" />
            )}
          </motion.button>
        </div>
      </div>

      <Tooltip
        id="status-tooltip"
        className="tooltip-custom"
        place="top"
        style={{
          backgroundColor: 'var(--bg-tooltip, #f9fafb)',
          color: '#4B5563',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '2px solid #E5E7EB',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          zIndex: 50,
        }}
      />

      <Tooltip
        id="action-tooltip"
        className="tooltip-custom"
        place="top"
        style={{
          backgroundColor: 'var(--bg-tooltip, #f9fafb)',
          color: '#4B5563',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '2px solid #E5E7EB',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          zIndex: 50,
        }}
      />

      {/* File details popup on hover */}
      {ingestionStatus?.status === 'ingested' && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="hidden group-hover:block absolute bottom-full mb-2 right-0 bg-gray-800 dark:bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-700 text-sm z-50 min-w-[300px]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <h3 className="font-medium text-gray-100">Ingestion Details</h3>
                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Vectors</span>
                  <span className="text-gray-200">{ingestionStatus.vector_count}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Text Chunks</span>
                  <span className="text-gray-200">{ingestionStatus.chunk_count}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Chunk Size</span>
                  <span className="text-gray-200">
                    {Math.round(ingestionStatus.metadata?.averageChunkSize || 0)} chars
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Document Pages</span>
                  <span className="text-gray-200">
                    {(ingestionStatus.metadata?.documentCount as number) || 1}
                  </span>
                </div>

                <div className="flex justify-between border-t border-gray-700 pt-2">
                  <span className="text-gray-400">Ingested On</span>
                  <span className="text-gray-200">
                    {new Date(ingestionStatus.ingestion_date!).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500 bg-gray-800/50 p-2 rounded">
                <p>This file has been processed and is ready for AI chat interactions. 
                   Each vector represents an embedded chunk of text that can be semantically searched.</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

const AIMetricsCard = ({ stats }: { stats: DashboardStats }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
  >
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Processing Metrics</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Detailed vectorization and embedding statistics</p>
      </div>
      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
        <Network className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Vector Quality Metrics */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Vector Quality</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Dimensions</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.vectorQuality.dimensions}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Density</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.vectorQuality.density.toFixed(2)} v/KB
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Efficiency</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {(stats.vectorQuality.efficiency * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500">Vector Quality Score</div>
            <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ 
                  width: `${Math.min(stats.vectorQuality.efficiency * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Processing Metrics */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Processing Metrics</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Avg Time</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.timeMetrics.averageProcessingTime.toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Fastest</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.timeMetrics.fastestProcessing.toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Slowest</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.timeMetrics.slowestProcessing.toFixed(2)}s
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500">Processing Efficiency</div>
            <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ 
                  width: `${Math.min((1 / stats.timeMetrics.averageProcessingTime) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Analysis */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Content Analysis</h4>
        <div className="space-y-2">
          {Object.entries(stats.fileTypeDistribution).map(([type, count]) => (
            <div key={type} className="flex items-center">
              <div className="w-full flex justify-between items-center">
                <span className="text-sm text-gray-500">{type.toUpperCase()}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {count} files
                </span>
              </div>
              <div className="ml-2 w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{ 
                    width: `${(count / stats.totalFiles) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500">Content Distribution</div>
            <div className="mt-1 flex h-2 rounded-full overflow-hidden">
              {Object.entries(stats.fileTypeDistribution).map(([type, count], index) => (
                <div
                  key={type}
                  className="h-full"
                  style={{
                    width: `${(count / stats.totalFiles) * 100}%`,
                    backgroundColor: getColorForIndex(index)
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Additional Metrics */}
    <div className="mt-6 grid grid-cols-3 gap-4">
      <div className="col-span-full">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Processing Timeline</h4>
        <div className="h-24 bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
          {/* Add a simple timeline visualization of processing times */}
          <div className="relative h-full">
            {stats.processingTimes.map((time, index) => (
              <div
                key={index}
                className="absolute bottom-0 bg-indigo-500 rounded-t"
                style={{
                  left: `${(index / stats.processingTimes.length) * 100}%`,
                  height: `${(time / Math.max(...stats.processingTimes)) * 100}%`,
                  width: `${100 / stats.processingTimes.length}%`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Add this new component for the processing timeline
const ProcessingTimeline = ({ stats }: { stats: DashboardStats }) => {
  return (
    <motion.div 
      className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Processing Activity</h3>
        <div className="flex items-center space-x-2">
          <span className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
            <span className="text-xs text-gray-500">Live Updates</span>
          </span>
        </div>
      </div>

      {/* Processing Matrix */}
      <div className="grid grid-cols-12 gap-1 h-32 mb-4">
        {Array.from({ length: 48 }).map((_, i) => (
          <motion.div
            key={i}
            className="bg-gray-100 dark:bg-gray-700 rounded"
            initial={{ scaleY: 0 }}
            animate={{ 
              scaleY: Math.random() * 0.8 + 0.2,
              backgroundColor: getActivityColor(Math.random())
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              delay: i * 0.1,
              repeatType: 'reverse'
            }}
            style={{ transformOrigin: 'bottom' }}
          />
        ))}
      </div>

      {/* Recent Activities */}
      <div className="space-y-3">
        {stats.processingTimes.slice(-5).map((time, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Document {stats.totalFiles - index}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {time.toFixed(2)}s
              </span>
              <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(time / Math.max(...stats.processingTimes)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {(stats.timeMetrics.averageProcessingTime || 0).toFixed(1)}s
          </div>
          <div className="text-xs text-gray-500">Average Processing</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.ingestionSuccess.successful}
          </div>
          <div className="text-xs text-gray-500">Successful</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.ingestionSuccess.pending}
          </div>
          <div className="text-xs text-gray-500">In Progress</div>
        </div>
      </div>
    </motion.div>
  );
};

// Add this helper function
const getActivityColor = (value: number): string => {
  if (value > 0.8) return '#4F46E5'; // indigo
  if (value > 0.6) return '#6366F1'; // lighter indigo
  if (value > 0.4) return '#818CF8'; // even lighter
  if (value > 0.2) return '#A5B4FC'; // very light
  return '#C7D2FE'; // lightest
};

// Helper function to create mock data for demo purposes
const createMockData = (email: string) => {
  return {
    ingestionStatuses: {
      'file_1': {
        id: 'ing_1',
        user_id: 'user_123',
        email_id: email,
        file_id: 'file_1',
        file_name: 'example-document.pdf',
        file_type: 'pdf',
        file_size: 125000,
        status: 'ingested' as const,
        vector_count: 120,
        chunk_count: 15,
        ingestion_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        deleted_at: null,
        metadata: {
          documentCount: 1,
          averageChunkSize: 350,
          processingTime: 3.5,
        }
      },
      'file_2': {
        id: 'ing_2',
        user_id: 'user_123',
        email_id: email,
        file_id: 'file_2',
        file_name: 'code-sample.js',
        file_type: 'js',
        file_size: 45000,
        status: 'ingested' as const,
        vector_count: 85,
        chunk_count: 8,
        ingestion_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        deleted_at: null,
        metadata: {
          documentCount: 1,
          averageChunkSize: 280,
          processingTime: 2.1,
        }
      }
    },
    dashboardStats: {
      storageUsed: 170000,
      totalFiles: 2,
      recentUploads: 2,
      totalVectors: 205,
      averageChunkSize: 315,
      processingFiles: 0,
      averageEmbeddingDimension: 1536,
      vectorDensity: 1.21,
      processingTimes: [3.5, 2.1],
      fileTypeDistribution: { 'pdf': 1, 'js': 1 },
      embeddingStats: { minMagnitude: 0.82, maxMagnitude: 0.95, averageMagnitude: 0.89 },
      chunkStats: { minSize: 180, maxSize: 500, optimalChunks: 23 },
      ingestionSuccess: { successful: 2, failed: 0, pending: 0 },
      vectorQuality: { density: 1.21, efficiency: 102.5, dimensions: 1536 },
      contentMetrics: { textDensity: 157.5, averageDocumentSize: 85000, processingEfficiency: 102.5 },
      timeMetrics: { averageProcessingTime: 2.8, fastestProcessing: 2.1, slowestProcessing: 3.5 }
    }
  };
};

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('files');
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState<string | null>(null);
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());
  const [ingestionStatuses, setIngestionStatuses] = useState<Record<string, FileIngestion>>({});
  
  // New states for enhanced header
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [notifications] = useState([
    { id: 1, type: 'success', message: 'File successfully ingested', time: '2 minutes ago', read: false },
    { id: 2, type: 'info', message: 'System maintenance scheduled', time: '1 hour ago', read: false },
    { id: 3, type: 'warning', message: 'Storage approaching limit', time: '3 hours ago', read: true },
  ]);

  // Confirmation dialog state for delete
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    fileId: string;
    fileName: string;
  }>({
    isOpen: false,
    fileId: '',
    fileName: ''
  });

  // Ingest confirmation dialog state
  const [ingestConfirmationDialog, setIngestConfirmationDialog] = useState<{
    isOpen: boolean;
    fileId: string;
    fileName: string;
  }>({
    isOpen: false,
    fileId: '',
    fileName: ''
  });

  const [isIngestingFile, setIsIngestingFile] = useState<string | null>(null);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    storageUsed: 0,
    totalFiles: 0,
    recentUploads: 0,
    totalVectors: 0,
    averageChunkSize: 0,
    processingFiles: 0,
    averageEmbeddingDimension: 0,
    vectorDensity: 0,
    processingTimes: [],
    fileTypeDistribution: {},
    embeddingStats: { minMagnitude: 0, maxMagnitude: 0, averageMagnitude: 0 },
    chunkStats: { minSize: 0, maxSize: 0, optimalChunks: 0 },
    ingestionSuccess: { successful: 0, failed: 0, pending: 0 },
    vectorQuality: { density: 0, efficiency: 0, dimensions: 0 },
    contentMetrics: { textDensity: 0, averageDocumentSize: 0, processingEfficiency: 0 },
    timeMetrics: { averageProcessingTime: 0, fastestProcessing: 0, slowestProcessing: 0 }
  });

  // Function to fetch files from Google Drive
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

  // Fetch real file metadata from database
  const fetchFileMetadata = async () => {
    try {
      const response = await fetch('/api/file-metadata');
      if (!response.ok) {
        throw new Error('Failed to fetch file metadata');
      }
      const data = await response.json();
      if (data.success) {
        setIngestionStatuses(data.fileMetadata);
        
        // Calculate real dashboard stats from the metadata
        const metadata = Object.values(data.fileMetadata) as FileIngestion[];
        const stats = calculateDashboardStats(metadata);
        setDashboardStats(stats);
      }
    } catch (err) {
      console.error('Failed to fetch file metadata:', err);
      // Fall back to mock data if real data fails
      loadMockData();
    }
  };

  // Calculate dashboard stats from real metadata
  const calculateDashboardStats = (metadata: FileIngestion[]): DashboardStats => {
    // Filter only active files (not soft deleted)
    const activeMetadata = metadata.filter(f => !f.deleted_at);
    
    const totalFiles = activeMetadata.length;
    const ingestedFiles = activeMetadata.filter(f => f.status === 'ingested');
    const pendingFiles = activeMetadata.filter(f => f.status === 'pending');
    const failedFiles = activeMetadata.filter(f => f.status === 'failed');
    
    const totalVectors = ingestedFiles.reduce((sum, f) => sum + (f.vector_count || 0), 0);
    const totalChunks = ingestedFiles.reduce((sum, f) => sum + (f.chunk_count || 0), 0);
    const averageChunkSize = ingestedFiles.length > 0 
      ? ingestedFiles.reduce((sum, f) => sum + (f.metadata?.averageChunkSize || 0), 0) / ingestedFiles.length 
      : 0;

    const processingTimes = ingestedFiles
      .map(f => f.metadata?.processingTime || 0)
      .filter(t => t > 0);

    const fileTypeDistribution = activeMetadata.reduce((acc, f) => {
      const type = f.file_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      storageUsed: activeMetadata.reduce((sum, f) => sum + (f.file_size || 0), 0),
      totalFiles,
      recentUploads: activeMetadata.filter(f => {
        const createdAt = new Date(f.created_at);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return createdAt > dayAgo;
      }).length,
      totalVectors,
      averageChunkSize: Math.round(averageChunkSize),
      processingFiles: pendingFiles.length,
      averageEmbeddingDimension: 1536, // OpenAI default
      vectorDensity: totalFiles > 0 ? totalVectors / totalFiles : 0,
      processingTimes,
      fileTypeDistribution,
      embeddingStats: {
        minMagnitude: 0.8,
        maxMagnitude: 1.2,
        averageMagnitude: 1.0
      },
      chunkStats: {
        minSize: 100,
        maxSize: 2000,
        optimalChunks: totalChunks
      },
      ingestionSuccess: {
        successful: ingestedFiles.length,
        failed: failedFiles.length,
        pending: pendingFiles.length
      },
      vectorQuality: {
        density: totalFiles > 0 ? totalVectors / totalFiles : 0,
        efficiency: totalChunks > 0 ? totalVectors / totalChunks : 0,
        dimensions: 1536
      },
      contentMetrics: {
        textDensity: averageChunkSize / 500,
        averageDocumentSize: activeMetadata.reduce((sum, f) => sum + (f.file_size || 0), 0) / Math.max(totalFiles, 1),
        processingEfficiency: ingestedFiles.length / Math.max(totalFiles, 1)
      },
      timeMetrics: {
        averageProcessingTime: processingTimes.length > 0 
          ? processingTimes.reduce((sum, t) => sum + t, 0) / processingTimes.length 
          : 0,
        fastestProcessing: processingTimes.length > 0 ? Math.min(...processingTimes) : 0,
        slowestProcessing: processingTimes.length > 0 ? Math.max(...processingTimes) : 0
      }
    };
  };

  // Calculate accurate real-time statistics based on current files and their status
  const calculateAccurateStats = useMemo(() => {
    // Get active files from Google Drive (files that are currently visible)
    const activeFiles = files;
    
    // Get corresponding ingestion statuses for these files
    const activeIngestionStatuses = activeFiles.map(file => ingestionStatuses[file.id]).filter(Boolean);
    
    // Calculate statistics based on actual visible files and their database status
    const totalActiveFiles = activeFiles.length;
    const ingestedCount = activeIngestionStatuses.filter(status => 
      status && status.status === 'ingested' && !status.deleted_at
    ).length;
    const processingCount = activeIngestionStatuses.filter(status => 
      status && status.status === 'pending' && !status.deleted_at
    ).length;
    const failedCount = activeIngestionStatuses.filter(status => 
      status && status.status === 'failed' && !status.deleted_at
    ).length;
    
    // Files that exist in Google Drive but not yet in database (not ingested)
    const notIngestedCount = activeFiles.filter(file => {
      const status = ingestionStatuses[file.id];
      return !status || status.deleted_at;
    }).length;

    // Calculate vector and storage statistics from ingested files only
    const ingestedFiles = activeIngestionStatuses.filter(status => 
      status && status.status === 'ingested' && !status.deleted_at
    );
    
    const totalVectors = ingestedFiles.reduce((sum, status) => sum + (status.vector_count || 0), 0);
    const totalChunks = ingestedFiles.reduce((sum, status) => sum + (status.chunk_count || 0), 0);
    const averageChunkSize = ingestedFiles.length > 0 
      ? ingestedFiles.reduce((sum, status) => sum + (status.metadata?.averageChunkSize || 0), 0) / ingestedFiles.length 
      : 0;
    
    // Calculate storage used from active files (Google Drive files)
    const storageUsed = activeFiles.reduce((sum, file) => sum + parseInt(file.size || '0'), 0);
    
    // Calculate recent uploads (files uploaded in the last week)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUploads = activeFiles.filter(file => {
      const createdTime = new Date(file.createdTime);
      return createdTime > weekAgo;
    }).length;

    return {
      totalFiles: totalActiveFiles,
      ingested: ingestedCount,
      processing: processingCount,
      failed: failedCount,
      notIngested: notIngestedCount,
      // Enhanced stats for top cards
      totalVectors,
      averageChunkSize: Math.round(averageChunkSize),
      storageUsed,
      recentUploads,
      successRate: totalActiveFiles > 0 ? Math.round((ingestedCount / totalActiveFiles) * 100) : 0
    };
  }, [files, ingestionStatuses]);

  // Authentication check effect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Function to load mock data for visualization purposes (fallback)
  const loadMockData = useCallback(() => {
    if (!session?.user?.email) return;
    
    // Create mock data based on the user's email
    const mockData = createMockData(session.user.email);
    setIngestionStatuses(mockData.ingestionStatuses);
    setDashboardStats(mockData.dashboardStats);
  }, [session?.user?.email]);

  // Effect to fetch files and metadata when session is available
  useEffect(() => {
    if (session) {
      fetchFiles();
      fetchFileMetadata(); // Use real data instead of mock data
    }
  }, [session]);

  // Handle file ingestion with confirmation
  const handleIngestFile = async (fileId: string, fileName: string) => {
    // Show ingest confirmation dialog
    setIngestConfirmationDialog({
      isOpen: true,
      fileId,
      fileName
    });
  };

  // Actual ingestion function called after confirmation
  const performIngestFile = async () => {
    const { fileId, fileName } = ingestConfirmationDialog;
    
    // Close the dialog immediately when user clicks "Ingest File"
    setIngestConfirmationDialog({
      isOpen: false,
      fileId: '',
      fileName: ''
    });
    
    try {
      setIsIngestingFile(fileId);
      setProcessingFiles(prev => new Set([...prev, fileId]));
      
      const response = await fetch('/api/ingestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId, fileName }),
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      const data = await response.json();
      
      // Show success message
      toast.success(`✓ ${fileName} ingestion completed successfully`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Refresh both files and metadata after successful ingestion
      await refreshData();
      
    } catch (error) {
      console.error('Ingestion error:', error);
      toast.error(`✗ Failed to ingest ${fileName}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsIngestingFile(null);
      setProcessingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  // Handle file deletion with confirmation
  const handleDeleteFile = async (fileId: string) => {
    // Find the file name
    const file = files.find(f => f.id === fileId);
    const fileName = file?.name || 'Unknown file';
    
    // Show confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      fileId,
      fileName
    });
  };

  // Actual deletion function called after confirmation
  const performDeleteFile = async () => {
    const { fileId, fileName } = confirmationDialog;
    
    try {
      setIsDeletingFile(fileId);
      
      // Soft delete using the new API endpoint
      const response = await fetch(`/api/drive-files/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete file');
      }

      if (result.success) {
        // Show success message
        toast.success(`File "${result.fileName}" deleted successfully`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Refresh data to update the UI
        await refreshData();
      } else {
        throw new Error(result.error || 'Delete operation failed');
      }
      
    } catch (error: any) {
      console.error('Delete file error:', error);
      toast.error(error.message || 'Failed to delete file', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsDeletingFile(null);
      // Close confirmation dialog
      setConfirmationDialog({
        isOpen: false,
        fileId: '',
        fileName: ''
      });
    }
  };

  // Close confirmation dialog
  const closeConfirmationDialog = () => {
    setConfirmationDialog({
      isOpen: false,
      fileId: '',
      fileName: ''
    });
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Set uploading state immediately
    setUploading(true);
    
    // Show immediate feedback to user
    toast.info(`Starting upload of ${fileArray.length} file${fileArray.length !== 1 ? 's' : ''}...`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    let successCount = 0;
    let errorCount = 0;

    // Process files sequentially for better progress tracking
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const fileId = `${file.name}-${Date.now()}-${i}`;
      
      // Initialize progress for this file
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      try {
        // Show progress for current file
        toast.info(`Uploading ${file.name}... (${i + 1}/${fileArray.length})`, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Simulate realistic progress updates
        const updateProgress = (progress: number) => {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        };

        // Start with initial progress
        updateProgress(5);
        await new Promise(resolve => setTimeout(resolve, 200));

        // Simulate file preparation (10-20%)
        updateProgress(15);
        await new Promise(resolve => setTimeout(resolve, 300));

        const formData = new FormData();
        formData.append('file', file);

        // Simulate upload start (20-30%)
        updateProgress(25);
        await new Promise(resolve => setTimeout(resolve, 200));

        // Create XMLHttpRequest for better progress tracking
        const uploadPromise = new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          // Track upload progress
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              // Map the actual progress to 30-90% range (leaving room for processing)
              const mappedProgress = 30 + (percentComplete * 0.6);
              updateProgress(Math.round(mappedProgress));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              // Upload complete, now processing (90-95%)
              updateProgress(90);
              setTimeout(() => {
                updateProgress(95);
                setTimeout(() => {
                  updateProgress(100);
                  resolve(xhr.response);
                }, 300);
              }, 200);
            } else {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });

          xhr.open('POST', '/api/upload-to-drive');
          xhr.send(formData);
        });

        await uploadPromise;
        successCount++;
        
        // Show success for individual file
        toast.success(`✓ ${file.name} uploaded successfully`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Keep progress at 100% for a moment before removing
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('Upload error:', error);
        errorCount++;
        
        // Show error for individual file
        toast.error(`✗ Failed to upload ${file.name}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        // Remove progress for this file after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 1500);
      }
    }

    // Show final summary toast
    if (successCount > 0) {
      toast.success(`🎉 Upload complete! ${successCount} file${successCount !== 1 ? 's' : ''} uploaded successfully`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    if (errorCount > 0) {
      toast.error(`❌ ${errorCount} file${errorCount !== 1 ? 's' : ''} failed to upload`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    // Reset uploading state
    setUploading(false);

    // Refresh both files and metadata after upload
    await refreshData();
    
    // Clear the file input
    event.target.value = '';
  };

  // Enhanced function to render upload progress with better UI
  const renderUploadProgress = () => {
    const progressEntries = Object.entries(uploadProgress);
    if (progressEntries.length === 0) return null;

    return (
      <div className="space-y-3">
        {progressEntries.map(([fileId, progress]) => {
          const fileName = fileId.split('-')[0]; // Extract filename from fileId
          return (
            <div key={fileId} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs">
                  {fileName}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(progress)}%
                  </span>
                  {progress === 100 ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500"
                    >
                      ✓
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4"
                    >
                      <div className="w-full h-full border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progress === 100 
                      ? 'bg-green-500' 
                      : progress > 90 
                        ? 'bg-blue-500' 
                        : 'bg-indigo-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              {progress < 100 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {progress < 30 ? 'Preparing file...' :
                   progress < 90 ? 'Uploading to cloud...' :
                   progress < 100 ? 'Processing...' : 'Complete!'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Close ingest confirmation dialog
  const closeIngestConfirmationDialog = () => {
    setIngestConfirmationDialog({
      isOpen: false,
      fileId: '',
      fileName: ''
    });
  };

  // Combined refresh function for both files and metadata
  const refreshData = async () => {
    await fetchFiles();
    await fetchFileMetadata();
  };

  // Enhanced navigation functions
  const handleHomeNavigation = () => {
    router.push('/');
  };

  const handleSignOut = async () => {
    // Sign out functionality
    toast.info('Signing out...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push('/auth');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchQuery.trim()) {
      toast.info(`Searching for: ${globalSearchQuery}`);
      // Implement search logic here
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
      if (!target.closest('.notification-container')) {
        setIsNotificationPanelOpen(false);
      }
    };

    if (isUserMenuOpen || isNotificationPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen, isNotificationPanelOpen]);

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
      {/* Enhanced Top Navigation Bar */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section - Logo & Home Button */}
            <div className="flex items-center space-x-4">
              {/* Logo/Brand */}
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <FaTachometerAlt className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    AI Dashboard
                  </h1>
                </div>
              </motion.div>

              {/* Home Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleHomeNavigation}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 text-sm"
              >
                <FaHome className="w-3 h-3" />
                <span className="hidden sm:inline">Home</span>
              </motion.button>
            </div>

            {/* Center Section - Global Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleGlobalSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search files, documents, or ask AI..."
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-sm"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                </div>
              </form>
            </div>

            {/* Right Section - Actions & User Menu */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative notification-container">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                  className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  <FaBell className="w-4 h-4" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {notifications.filter(n => !n.read).length}
                    </motion.div>
                  )}
                </motion.button>

                {/* Notification Panel */}
                <AnimatePresence>
                  {isNotificationPanelOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                              !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.type === 'success' ? 'bg-green-500' :
                                notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Settings */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
              >
                <FaCog className="w-4 h-4" />
              </motion.button>

              {/* User Menu */}
              <div className="relative user-menu-container">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-1.5 pr-3 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
                >
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-6 h-6 rounded-md"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                      <FaUser className="w-3 h-3" />
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-medium truncate max-w-24">{session?.user?.name}</p>
                  </div>
                  <FaChevronDown className="w-2 h-2" />
                </motion.button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          {session?.user?.image ? (
                            <img
                              src={session.user.image}
                              alt={session.user.name || "User"}
                              className="w-10 h-10 rounded-lg"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                              <FaUser className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {session?.user?.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {session?.user?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <FaUserCircle className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Profile Settings</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <FaCog className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Preferences</span>
                        </button>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          <span className="text-sm">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleGlobalSearch} className="mt-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search files or ask AI..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            </div>
          </form>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 p-6">
          {/* Storage Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Used</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatBytes(calculateAccurateStats.storageUsed)}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <HardDrive className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min((calculateAccurateStats.storageUsed / (1024 * 1024 * 1024)) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {calculateAccurateStats.totalFiles} active files in Drive
              </div>
            </div>
          </motion.div>

          {/* Vector Stats Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vector Database</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {calculateAccurateStats.totalVectors.toLocaleString()} vectors
                </h3>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Binary className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Chunk Size</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {calculateAccurateStats.averageChunkSize > 0 ? `${calculateAccurateStats.averageChunkSize} chars` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Processing</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {calculateAccurateStats.processing} files
                </p>
              </div>
            </div>
            <div className="mt-3">
              {calculateAccurateStats.totalVectors > 0 ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 dark:text-green-400">
                    {calculateAccurateStats.ingested} file{calculateAccurateStats.ingested !== 1 ? 's' : ''} ready for AI chat
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    No vectors available - ingest files to enable AI chat
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* File Stats Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Document Stats</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {calculateAccurateStats.totalFiles} files
                </h3>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Recent Uploads</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {calculateAccurateStats.recentUploads} this week
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Success Rate</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {calculateAccurateStats.successRate}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Status Summary */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Status Summary</h2>
            <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Soft Delete Active</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center">
                <Files className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculateAccurateStats.totalFiles}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Active files in Drive
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center">
                <Check className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ingested</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {calculateAccurateStats.ingested}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Ready for AI chat
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {calculateAccurateStats.processing}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Currently ingesting
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {calculateAccurateStats.failed}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Need attention
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Additional insight for not ingested files */}
          {calculateAccurateStats.notIngested > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{calculateAccurateStats.notIngested}</strong> file{calculateAccurateStats.notIngested !== 1 ? 's' : ''} available for ingestion
                </span>
              </div>
            </div>
          )}
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => refreshData()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  disabled={uploading}
                >
                  <FaHistory className="w-4 h-4" />
                  <span>Refresh</span>
                </motion.button>
                <motion.label
                  whileHover={!uploading ? { scale: 1.05 } : {}}
                  whileTap={!uploading ? { scale: 0.95 } : {}}
                  className={`px-6 py-3 rounded-lg transition-colors cursor-pointer flex items-center space-x-2 ${
                    uploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white`}
                >
                  {uploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <FaHistory className="w-5 h-5" />
                      </motion.div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FaCloudUploadAlt className="w-5 h-5" />
                      <span>Upload Files</span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    disabled={uploading}
                  />
                </motion.label>
              </div>
            </div>
            
            {/* Upload Progress Section */}
            {(uploading || Object.keys(uploadProgress).length > 0) && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FaCloudUploadAlt className="w-4 h-4 text-blue-600" />
                  </motion.div>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Upload in progress...
                  </span>
                </div>
                {renderUploadProgress()}
              </div>
            )}
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
                  <FileCard 
                    key={file.id} 
                    file={file} 
                    ingestionStatus={ingestionStatuses[file.id]}
                    onDelete={handleDeleteFile}
                    onIngest={handleIngestFile}
                    isProcessing={isIngestingFile === file.id || processingFiles.has(file.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add AI Metrics Card */}
        <AIMetricsCard stats={dashboardStats} />

        {/* Add Processing Timeline */}
        <ProcessingTimeline stats={dashboardStats} />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={closeConfirmationDialog}
        onConfirm={performDeleteFile}
        title="Delete File"
        message="Are you sure you want to delete this file? This action will move the file to trash and remove it from search results."
        fileName={confirmationDialog.fileName}
        isLoading={isDeletingFile === confirmationDialog.fileId}
        confirmText="Delete File"
        cancelText="Cancel"
        type="danger"
      />

      {/* Ingest Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={ingestConfirmationDialog.isOpen}
        onClose={closeIngestConfirmationDialog}
        onConfirm={performIngestFile}
        title="Ingest File into AI Database"
        message="Are you sure you want to process this file for AI interactions? This will create vector embeddings and make the file searchable in AI chat."
        fileName={ingestConfirmationDialog.fileName}
        isLoading={isIngestingFile === ingestConfirmationDialog.fileId}
        confirmText="Ingest File"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
};

export default Dashboard; 