"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  FaUser, FaCloudUploadAlt, FaFileAlt, FaHistory, 
  FaCog, FaBell, FaFolder, FaChartLine, FaDownload,
  FaTrash, FaEllipsisH, FaSearch, FaDatabase, FaTrashRestore
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDistanceToNow } from 'date-fns';
import { formatBytes } from '../utils/formatBytes';
import { supabase, FileIngestion } from '../lib/supabase';
import { Check, AlertCircle, Clock, BarChart3, Files, Upload, HardDrive, FileText, Binary, Layers, Network, Cpu } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

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
  onDelete 
}: { 
  file: DriveFile; 
  ingestionStatus?: FileIngestion;
  onDelete: (fileId: string) => void;
}) => {
  const [isIngesting, setIsIngesting] = useState(false);

  // Function to check if file is already ingested
  const isFileIngested = useMemo(() => {
    return ingestionStatus?.status === 'ingested' && !ingestionStatus?.deleted_at;
  }, [ingestionStatus]);

  const handleIngest = async () => {
    if (isFileIngested) return;
    
    setIsIngesting(true);
    try {
      const response = await fetch('/api/ingestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileId: file.id, 
          fileName: file.name 
        }),
      });
      
      if (!response.ok) throw new Error('Ingestion failed');
      toast.success('File ingestion started');
    } catch (error) {
      toast.error('Failed to start ingestion');
      console.error(error);
    } finally {
      setIsIngesting(false);
    }
  };

  const getStatusIcon = () => {
    if (isIngesting) {
      return (
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          data-tooltip-id="status-tooltip"
          data-tooltip-content="Processing file..."
          className="p-2"
        >
          <Clock className="w-5 h-5 text-yellow-500" />
        </motion.div>
      );
    }

    if (!ingestionStatus || ingestionStatus.deleted_at) {
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
    }

    switch (ingestionStatus.status) {
      case 'ingested':
        return (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-2"
            data-tooltip-id="status-tooltip"
            data-tooltip-content={`✓ Successfully ingested\n${ingestionStatus.vector_count} vectors created\nClick to view details`}
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
            data-tooltip-content={`Ingestion failed: ${ingestionStatus.error_message}`}
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        );
      case 'pending':
        return (
          <motion.div 
            className="p-2"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            data-tooltip-id="status-tooltip"
            data-tooltip-content="Processing in progress..."
          >
            <Clock className="w-5 h-5 text-yellow-500" />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300">
        <div className="flex items-center space-x-4">
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
                    {ingestionStatus.metadata?.documentCount || 1}
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
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());
  const [ingestionStatuses, setIngestionStatuses] = useState<Record<string, FileIngestion>>({});
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
    embeddingStats: { minMagnitude: Infinity, maxMagnitude: 0, averageMagnitude: 0 },
    chunkStats: { minSize: Infinity, maxSize: 0, optimalChunks: 0 },
    ingestionSuccess: { successful: 0, failed: 0, pending: 0 },
    vectorQuality: { density: 0, efficiency: 0, dimensions: 0 },
    contentMetrics: { textDensity: 0, averageDocumentSize: 0, processingEfficiency: 0 },
    timeMetrics: { averageProcessingTime: 0, fastestProcessing: 0, slowestProcessing: 0 }
  });

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

  // Function to fetch ingestion statuses
  const fetchIngestionStatuses = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const { data, error } = await supabase
        .from('file_ingestions')
        .select('*')
        .eq('email_id', session.user.email)
        .is('deleted_at', null);

      if (error) throw error;

      if (data) {
        // Create a map of fileId to ingestion status
        const statusMap = data.reduce((acc, status) => ({
          ...acc,
          [status.file_id]: status
        }), {});
        setIngestionStatuses(statusMap);
      }
    } catch (error) {
      console.error('Error fetching ingestion statuses:', error);
    }
  }, [session?.user?.email]);

  // Update the fetchDashboardStats function to ensure accurate counts
  const fetchDashboardStats = useCallback(async () => {
    if (!session?.user?.email) {
      console.log('No user email found in session');
      return;
    }

    try {
      // First check if the table exists and we have access
      const { data: tableInfo, error: tableError } = await supabase
        .from('file_ingestions')
        .select('count')
        .limit(1);

      if (tableError) {
        console.error('Error accessing file_ingestions table:', tableError);
        return;
      }

      // Fetch all non-deleted files with error handling
      const { data: activeFiles, error: filesError } = await supabase
        .from('file_ingestions')
        .select('*')
        .eq('email_id', session.user.email)
        .is('deleted_at', null);

      if (filesError) {
        console.error('Error fetching files:', filesError);
        return;
      }

      if (!activeFiles) {
        console.log('No active files found');
        return;
      }

      // Create initial stats object with accurate file count
      const initialStats: DashboardStats = {
        storageUsed: 0,
        totalFiles: activeFiles.length,
        recentUploads: 0,
        totalVectors: 0,
        averageChunkSize: 0,
        processingFiles: 0,
        averageEmbeddingDimension: 0,
        vectorDensity: 0,
        processingTimes: [],
        fileTypeDistribution: {},
        embeddingStats: { minMagnitude: Infinity, maxMagnitude: 0, averageMagnitude: 0 },
        chunkStats: { minSize: Infinity, maxSize: 0, optimalChunks: 0 },
        ingestionSuccess: { successful: 0, failed: 0, pending: 0 },
        vectorQuality: { density: 0, efficiency: 0, dimensions: 0 },
        contentMetrics: { textDensity: 0, averageDocumentSize: 0, processingEfficiency: 0 },
        timeMetrics: { averageProcessingTime: 0, fastestProcessing: 0, slowestProcessing: 0 }
      };

      // Calculate stats from active files with type safety
      const stats = activeFiles.reduce((acc, file) => {
        try {
          // Update file type distribution
          const fileType = (file.file_type?.toLowerCase() || 'unknown') as string;
          acc.fileTypeDistribution[fileType] = (acc.fileTypeDistribution[fileType] || 0) + 1;

          // Safely access nested properties
          const fileSize = typeof file.file_size === 'number' ? file.file_size : 0;
          const vectorCount = typeof file.vector_count === 'number' ? file.vector_count : 0;
          const avgChunkSize = file.metadata?.averageChunkSize || 0;
          const processingTime = file.metadata?.processingTime || 0;

          // Update accumulator with safe values
          return {
            ...acc,
            storageUsed: acc.storageUsed + fileSize,
            recentUploads: acc.recentUploads + (
              new Date(file.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 ? 1 : 0
            ),
            totalVectors: acc.totalVectors + vectorCount,
            averageChunkSize: acc.averageChunkSize + avgChunkSize,
            processingFiles: acc.processingFiles + (file.status === 'pending' ? 1 : 0),
            ingestionSuccess: {
              successful: acc.ingestionSuccess.successful + (file.status === 'ingested' ? 1 : 0),
              failed: acc.ingestionSuccess.failed + (file.status === 'failed' ? 1 : 0),
              pending: acc.ingestionSuccess.pending + (file.status === 'pending' ? 1 : 0)
            },
            processingTimes: processingTime > 0 ? [...acc.processingTimes, processingTime] : acc.processingTimes
          };
        } catch (err) {
          console.error('Error processing file stats:', err, file);
          return acc;
        }
      }, initialStats);

      // Calculate derived metrics with safe math operations
      const totalKB = Math.max(stats.storageUsed / 1024, 1);
      const safeFileCount = Math.max(stats.totalFiles, 1);

      const vectorQuality = {
        density: stats.totalVectors / totalKB,
        efficiency: stats.totalVectors / safeFileCount,
        dimensions: 1536 // Standard for text-embedding-3-small
      };

      const contentMetrics = {
        textDensity: stats.averageChunkSize / safeFileCount,
        averageDocumentSize: stats.storageUsed / safeFileCount,
        processingEfficiency: stats.totalVectors / safeFileCount
      };

      const timeMetrics = {
        averageProcessingTime: stats.processingTimes.length ? 
          stats.processingTimes.reduce((a: number, b: number) => a + b, 0) / stats.processingTimes.length : 
          0,
        fastestProcessing: stats.processingTimes.length ? Math.min(...stats.processingTimes) : 0,
        slowestProcessing: stats.processingTimes.length ? Math.max(...stats.processingTimes) : 0
      };

      setDashboardStats({
        ...stats,
        vectorQuality,
        contentMetrics,
        timeMetrics
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default stats in case of error
      setDashboardStats({
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
        vectorQuality: { density: 0, efficiency: 0, dimensions: 1536 },
        contentMetrics: { textDensity: 0, averageDocumentSize: 0, processingEfficiency: 0 },
        timeMetrics: { averageProcessingTime: 0, fastestProcessing: 0, slowestProcessing: 0 }
      });
    }
  }, [session?.user?.email]);

  // Fetch files and ingestion statuses
  useEffect(() => {
    if (session) {
      fetchFiles();
      fetchIngestionStatuses();
      fetchDashboardStats();
    }
  }, [session, fetchIngestionStatuses, fetchDashboardStats]);

  // Update the useEffect to refresh stats more frequently
  useEffect(() => {
    if (!session?.user?.email) return;

    fetchDashboardStats(); // Initial fetch
    const intervalId = setInterval(fetchDashboardStats, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId);
  }, [session?.user?.email, fetchDashboardStats]);

  const handleDeleteFile = async (fileId: string) => {
    try {
      setIsDeletingFile(fileId);
      
      // Check if file is already soft-deleted
      const existingStatus = ingestionStatuses[fileId];
      const isRestore = existingStatus?.deleted_at != null;

      const response = await fetch('/api/file-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fileId,
          action: isRestore ? 'restore' : 'delete'
        }),
      });

      if (!response.ok) throw new Error('Failed to update file status');

      // Refresh ingestion statuses
      const { data } = await supabase
        .from('file_ingestions')
        .select('*')
        .eq('email_id', session?.user?.email)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (data) {
        const statusMap = data.reduce((acc, status) => ({
          ...acc,
          [status.file_id]: status
        }), {});
        setIngestionStatuses(statusMap);
      }

    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update file status');
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

  const handleIngestFile = async (fileId: string, fileName: string) => {
    try {
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
      toast.success(`Successfully processed ${fileName}`);
      
    } catch (error) {
      console.error('Ingestion error:', error);
      toast.error(`Failed to process ${fileName}`);
    } finally {
      setProcessingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
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
                  {formatBytes(dashboardStats.storageUsed)}
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
                  style={{ width: `${Math.min((dashboardStats.storageUsed / (1024 * 1024 * 1024)) * 100, 100)}%` }}
                ></div>
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
                  {dashboardStats.totalVectors.toLocaleString()} vectors
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
                  {Math.round(dashboardStats.averageChunkSize)} chars
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Processing</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {dashboardStats.processingFiles} files
                </p>
              </div>
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
                  {dashboardStats.totalFiles} files
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
                  {dashboardStats.recentUploads} this week
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Success Rate</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {dashboardStats.totalFiles ? 
                    Math.round((dashboardStats.totalVectors / dashboardStats.totalFiles) * 100) : 0}%
                </p>
              </div>
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
                  <FileCard 
                    key={file.id} 
                    file={file} 
                    ingestionStatus={ingestionStatuses[file.id]}
                    onDelete={handleDeleteFile}
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
    </div>
  );
};

export default Dashboard; 