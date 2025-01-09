import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const parseFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (file.name.endsWith('.csv')) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          resolve(XLSX.utils.sheet_to_json(sheet));
        } else if (file.name.endsWith('.xlsx')) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          resolve(XLSX.utils.sheet_to_json(sheet));
        } else if (file.name.endsWith('.json')) {
          resolve(JSON.parse(data as string));
        }
      } catch (error) {
        reject(error);
      }
    };

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
};

export const exportToExcel = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Analysis');
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}.xlsx`);
};

export const downloadChartAsPNG = async (chartRef: HTMLDivElement | null, fileName: string = 'chart') => {
  if (!chartRef) return;
  
  try {
    const canvas = await html2canvas(chartRef, {
      scale: 2, // Higher resolution
      backgroundColor: null,
      logging: false,
    });
    
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${fileName}.png`);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error downloading chart:', error);
    throw error;
  }
};

export const exportToPDF = async (analysisResult: any, chartRef: HTMLDivElement | null) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Analysis Report', 20, 20);
  
  // Add analysis content
  doc.setFontSize(12);
  doc.text('Overview:', 20, 40);
  doc.setFontSize(10);
  const overview = doc.splitTextToSize(analysisResult.overview, 170);
  doc.text(overview, 20, 50);

  // Add trends
  let yPos = 80;
  doc.setFontSize(12);
  doc.text('Key Trends:', 20, yPos);
  doc.setFontSize(10);
  yPos += 10;
  analysisResult.trends.forEach((trend: string) => {
    const trendLines = doc.splitTextToSize(`• ${trend}`, 170);
    doc.text(trendLines, 20, yPos);
    yPos += 10 * (trendLines.length);
  });

  // Add recommendations
  yPos += 10;
  doc.setFontSize(12);
  doc.text('Recommendations:', 20, yPos);
  doc.setFontSize(10);
  yPos += 10;
  analysisResult.recommendations.forEach((rec: string) => {
    const recLines = doc.splitTextToSize(`• ${rec}`, 170);
    doc.text(recLines, 20, yPos);
    yPos += 10 * (recLines.length);
  });
  
  // Add chart as image
  if (chartRef) {
    try {
      const canvas = await html2canvas(chartRef);
      const imgData = canvas.toDataURL('image/png');
      // Add new page for chart
      doc.addPage();
      doc.text('Visualization', 20, 20);
      doc.addImage(imgData, 'PNG', 20, 30, 170, 100);
    } catch (error) {
      console.error('Error adding chart to PDF:', error);
    }
  }
  
  doc.save('analysis-report.pdf');
}; 