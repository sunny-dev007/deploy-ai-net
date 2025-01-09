// New utility file for chart processing
export interface ChartData {
  name: string;
  [key: string]: string | number;
}

export function processFileDataForCharts(data: any[]): {
  chartData: ChartData[];
  availableMetrics: string[];
} {
  if (!data || data.length === 0) return { chartData: [], availableMetrics: [] };

  const sampleRow = data[0];
  
  // First, identify the name column (city, name, location, etc.)
  const nameColumn = Object.keys(sampleRow).find(key => 
    ['city', 'name', 'location', 'state', 'country'].includes(key.toLowerCase())
  ) || Object.keys(sampleRow)[0]; // If no match, use first column as name

  // Get numeric columns for metrics
  const metrics = Object.keys(sampleRow).filter(key => {
    if (key === nameColumn) return false;
    const value = sampleRow[key];
    return !isNaN(Number(value?.toString().replace(/,/g, '')));
  });

  // Process data for charts
  const chartData = data.map((row) => {
    const processedRow: ChartData = {
      name: row[nameColumn]?.toString() || 'Unnamed',
    };

    metrics.forEach((metric) => {
      // Remove commas and convert to number
      const value = Number(row[metric]?.toString().replace(/,/g, ''));
      processedRow[metric] = isNaN(value) ? 0 : value;
    });

    return processedRow;
  });

  return {
    chartData,
    availableMetrics: metrics,
  };
}

export function generateChartColors(count: number): string[] {
  const baseColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c',
    '#d0ed57', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'
  ];
  
  // If we need more colors than in baseColors, generate them
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Generate additional colors
  const additionalColors = Array.from({ length: count - baseColors.length }, (_, i) => {
    const hue = (i * 137.508) % 360; // Use golden angle approximation
    return `hsl(${hue}, 70%, 50%)`;
  });

  return [...baseColors, ...additionalColors];
} 