"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  FaChartLine, FaChartBar, FaChartPie, 
  FaFileAlt, FaDownload, FaSync,
  FaLightbulb, FaBrain, FaCheck,
  FaUpload, FaTable, FaMagic
} from 'react-icons/fa';
import { 
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { parseFile, exportToExcel, exportToPDF, downloadChartAsPNG } from '../utils/fileUtils';
import { toast } from 'react-hot-toast';
import { processFileDataForCharts, generateChartColors, type ChartData } from '../utils/chartUtils';
import PasscodeModal from '../components/PasscodeModal';

// Enhanced sample data
const timeSeriesData = [
  { name: 'Jan', revenue: 4000, users: 2400, engagement: 2400 },
  { name: 'Feb', revenue: 3000, users: 1398, engagement: 2210 },
  { name: 'Mar', revenue: 2000, users: 9800, engagement: 2290 },
  { name: 'Apr', revenue: 2780, users: 3908, engagement: 2000 },
  { name: 'May', revenue: 1890, users: 4800, engagement: 2181 },
  { name: 'Jun', revenue: 2390, users: 3800, engagement: 2500 },
];

const categoryData = [
  { name: 'Product A', value: 400, color: '#0088FE' },
  { name: 'Product B', value: 300, color: '#00C49F' },
  { name: 'Product C', value: 300, color: '#FFBB28' },
  { name: 'Product D', value: 200, color: '#FF8042' },
];

interface AnalysisResult {
  overview: string;
  trends: string[];
  recommendations: string[];
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
  >
    <div className="flex items-center space-x-4 mb-4">
      <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </motion.div>
);

const formatLargeNumber = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

const ExportOptions = ({ 
  onExport, 
  onDownloadChart, 
  disabled 
}: { 
  onExport: (type: 'excel' | 'pdf') => void;
  onDownloadChart: () => void;
  disabled: boolean;
}) => (
  <div className="flex flex-wrap gap-4 justify-center">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onExport('pdf')}
      disabled={disabled}
      className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
    >
      <FaFileAlt />
      <span>Export PDF</span>
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onExport('excel')}
      disabled={disabled}
      className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
    >
      <FaTable />
      <span>Export Excel</span>
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onDownloadChart}
      disabled={disabled}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
    >
      <FaDownload />
      <span>Download Chart</span>
    </motion.button>
  </div>
);

export default function ReportAnalysisPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [chartType, setChartType] = useState('line');
  const [fileData, setFileData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [timeSeriesData, setTimeSeriesData] = useState([
    { name: 'Jan', revenue: 4000, users: 2400, engagement: 2400 },
    { name: 'Feb', revenue: 3000, users: 1398, engagement: 2210 },
    { name: 'Mar', revenue: 2000, users: 9800, engagement: 2290 },
    { name: 'Apr', revenue: 2780, users: 3908, engagement: 2000 },
    { name: 'May', revenue: 1890, users: 4800, engagement: 2181 },
    { name: 'Jun', revenue: 2390, users: 3800, engagement: 2500 },
  ]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const data = await parseFile(file);
        setFileData(data);
        
        // Process data for charts
        const { chartData: processedData, availableMetrics: metrics } = processFileDataForCharts(data);
        setChartData(processedData);
        setAvailableMetrics(metrics);
        setSelectedMetrics(metrics.slice(0, 3)); // Select first 3 metrics by default
        setUploadedFile(file);
        
        toast.success('File uploaded successfully!');
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('Error uploading file. Please check the format.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const startAnalysis = async () => {
    if (!fileData.length) {
      toast.error('Please upload a file first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/report-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: fileData,
          analysisType: activeTab,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        // Update chart data based on the analysis
        const newChartData = fileData.map((item: any, index: number) => ({
          name: item.name || `Item ${index + 1}`,
          value: parseFloat(item.value) || 0,
          revenue: parseFloat(item.revenue) || 0,
          users: parseFloat(item.users) || 0,
          engagement: parseFloat(item.engagement) || 0
        }));

        setTimeSeriesData(newChartData);
        
        setAnalysisResult({
          overview: result.analysis,
          trends: result.trends || [],
          recommendations: result.recommendations || []
        });
        toast.success('Analysis completed!');
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = async (type: 'excel' | 'pdf') => {
    if (!analysisResult) {
      toast.error('Please analyze data first');
      return;
    }

    try {
      if (type === 'excel') {
        const exportData = {
          ...fileData,
          analysis: analysisResult.overview,
          trends: analysisResult.trends,
          recommendations: analysisResult.recommendations
        };
        exportToExcel(exportData, 'analysis-report');
      } else {
        await exportToPDF(analysisResult, chartRef.current);
      }
      toast.success(`Report exported as ${type.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  const handleDownloadChart = async () => {
    try {
      if (!chartRef.current) {
        toast.error('No chart to download');
        return;
      }
      await downloadChartAsPNG(chartRef.current, `${chartType}-chart`);
      toast.success('Chart downloaded successfully!');
    } catch (error) {
      console.error('Error downloading chart:', error);
      toast.error('Failed to download chart');
    }
  };

  // Custom gradient for charts
  const gradientOffset = () => {
    const dataMax = Math.max(...timeSeriesData.map((i) => i.revenue));
    const dataMin = Math.min(...timeSeriesData.map((i) => i.revenue));
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    return dataMax / (dataMax - dataMin);
  };

  const MetricSelector = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Select Metrics to Display</h3>
      <div className="flex flex-wrap gap-2">
        {availableMetrics.map((metric) => (
          <button
            key={metric}
            onClick={() => {
              if (selectedMetrics.includes(metric)) {
                setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
              } else {
                setSelectedMetrics([...selectedMetrics, metric]);
              }
            }}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedMetrics.includes(metric)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {metric}
          </button>
        ))}
      </div>
    </div>
  );

  const renderChart = (): React.ReactElement => {
    if (!chartData.length || !selectedMetrics.length) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <p className="text-gray-500">Upload a file to visualize data</p>
        </div>
      );
    }

    const colors = generateChartColors(selectedMetrics.length);

    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 50, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              tickFormatter={formatLargeNumber}
              width={80}
            />
            <Tooltip formatter={(value: number) => formatLargeNumber(value)} />
            <Legend />
            {selectedMetrics.map((metric, index) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={colors[index]}
                strokeWidth={2}
                name={metric.charAt(0).toUpperCase() + metric.slice(1)}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 50, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              tickFormatter={formatLargeNumber}
              width={80}
            />
            <Tooltip formatter={(value: number) => formatLargeNumber(value)} />
            <Legend />
            {selectedMetrics.map((metric, index) => (
              <Bar 
                key={metric} 
                dataKey={metric} 
                fill={colors[index]}
                name={metric.charAt(0).toUpperCase() + metric.slice(1)}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 50, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              tickFormatter={formatLargeNumber}
              width={80}
            />
            <Tooltip formatter={(value: number) => formatLargeNumber(value)} />
            <Legend />
            {selectedMetrics.map((metric, index) => (
              <Area
                key={metric}
                type="monotone"
                dataKey={metric}
                stackId="1"
                stroke={colors[index]}
                fill={colors[index]}
                name={metric.charAt(0).toUpperCase() + metric.slice(1)}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        const metric = selectedMetrics[0];
        const pieData = chartData.map(item => ({
          name: item.name,
          value: Number(item[metric])
        }));
        
        return (
          <PieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              label={(entry) => entry.name}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full w-full">
            <p className="text-gray-500">Select a chart type</p>
          </div>
        );
    }
  };

  const handleAuthentication = () => {
    setIsAuthenticated(true);
    toast.success('Access granted!');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthenticated ? (
        <PasscodeModal onAuthenticate={handleAuthentication} />
      ) : (
        <>
          <Nav />
          <main className="flex-grow pt-20">
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
              <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-16 relative z-10"
                >
                  <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
                    AI-Powered Report Analysis
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300">
                    Transform complex data into actionable insights with our advanced AI analysis
                  </p>
                </motion.div>

                {/* Enhanced Dashboard */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
                  {/* File Upload Section */}
                  <div className="mb-8">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FaUpload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            CSV, Excel, or JSON files
                          </p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={handleFileUpload}
                          accept=".csv,.xlsx,.json"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Chart Type Selector */}
                  <div className="flex space-x-4 mb-8">
                    {['line', 'area', 'bar', 'pie'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setChartType(type)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          chartType === type
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Chart Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 w-full">
                    <MetricSelector />
                    <div ref={chartRef} className="h-96 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Analysis Results */}
                  <AnimatePresence>
                    {analysisResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl"
                      >
                        <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
                        <div className="prose dark:prose-invert">
                          <p>{analysisResult.overview}</p>
                          <h4>Key Trends</h4>
                          <ul>
                            {analysisResult.trends.map((trend, index) => (
                              <li key={index}>{trend}</li>
                            ))}
                          </ul>
                          <h4>Recommendations</h4>
                          <ul>
                            {analysisResult.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startAnalysis}
                      disabled={isAnalyzing || !fileData.length}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 justify-center"
                    >
                      {isAnalyzing ? (
                        <FaSync className="animate-spin" />
                      ) : (
                        <FaBrain />
                      )}
                      <span>{isAnalyzing ? 'Analyzing...' : 'Start Analysis'}</span>
                    </motion.button>

                    <ExportOptions
                      onExport={handleExport}
                      onDownloadChart={handleDownloadChart}
                      disabled={!analysisResult || !chartData.length}
                    />
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FeatureCard
                    icon={<FaLightbulb className="w-6 h-6" />}
                    title="Smart Insights"
                    description="AI-powered analysis identifies patterns and trends in your data automatically"
                  />
                  <FeatureCard
                    icon={<FaChartLine className="w-6 h-6" />}
                    title="Advanced Analytics"
                    description="Comprehensive statistical analysis and predictive modeling"
                  />
                  <FeatureCard
                    icon={<FaFileAlt className="w-6 h-6" />}
                    title="Custom Reports"
                    description="Generate detailed reports tailored to your specific needs"
                  />
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
} 