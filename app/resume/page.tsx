"use client";

import { useState, useRef } from 'react';
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { motion } from 'framer-motion';
import { FaFileAlt, FaDownload, FaLightbulb } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';

const EXAMPLE_PROMPT = `I am a Senior Software Engineer with 5 years of experience in full-stack development. 
Currently working at TechCorp Inc. where I lead a team of 4 developers.

Technical Skills:
- Expert in React, Node.js, TypeScript, and AWS
- Proficient in Python, Docker, and Kubernetes
- Experience with CI/CD, microservices architecture

Education:
- Bachelor's in Computer Science from MIT (2018)
- Relevant coursework in AI, distributed systems

Achievements:
- Led migration to microservices, reducing deployment time by 60%
- Improved application performance by 40% through optimization
- Implemented automated testing, achieving 90% coverage
- Mentored 3 junior developers

Certifications:
- AWS Solutions Architect
- Google Cloud Professional Developer

Languages: English (native), Spanish (conversational)

Interests: Open source contribution, tech blogging, hackathons
Volunteer: Code.org instructor for high school students`;

export default function ResumeBuilder() {
  const [prompt, setPrompt] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleGenerateResume = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setGeneratedResume(data.resume);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    const canvas = await html2canvas(resumeRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`resume-${Date.now()}.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-emerald-50 via-white to-transparent dark:from-gray-800 dark:via-gray-900 pt-24 pb-12">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 dark:text-white"
            >
              AI Resume Builder
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-xl text-gray-600 dark:text-gray-300"
            >
              Create a professional resume instantly with AI
            </motion.p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                    <FaLightbulb className="w-5 h-5" />
                    <span className="font-medium">Example Format</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg whitespace-pre-line">
                    {EXAMPLE_PROMPT}
                  </p>
                </div>
                
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your professional background, education, skills, and achievements..."
                  rows={8}
                  className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                />

                <button
                  onClick={handleGenerateResume}
                  disabled={isGenerating || !prompt.trim()}
                  className="mt-4 w-full py-3 px-6 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate Resume'}
                </button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Preview
                </h2>
                {generatedResume && (
                  <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                  >
                    <FaDownload className="w-4 h-4" />
                    Download PDF
                  </button>
                )}
              </div>

              {/* Resume Preview */}
              <div
                ref={resumeRef}
                className="bg-white rounded-lg p-8 shadow-inner min-h-[800px] prose prose-emerald max-w-none dark:prose-invert"
              >
                {generatedResume ? (
                  <ReactMarkdown>{generatedResume}</ReactMarkdown>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    Your generated resume will appear here
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 