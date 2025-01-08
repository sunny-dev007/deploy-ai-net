'use client';

import { useState, useEffect } from 'react';
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { FaMagic, FaImage, FaRobot, FaFileAlt } from 'react-icons/fa';
import LoadingDots from '../components/LoadingDots';
import AIImageProcessingLoader from '../components/AIImageProcessingLoader';
import PasscodeModal from '../components/PasscodeModal';

export default function Generate() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Clear authentication on component mount
    sessionStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  }, []);

  const handleAuthentication = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true');
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: 'dall-e-2',
          size: '1024x1024',
        }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setGeneratedImage(data.imageUrl);
      }
    } catch (err) {
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-gray-900">
      {!isAuthenticated && <PasscodeModal onAuthenticate={handleAuthentication} />}
      <Nav />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-blue-50 via-white to-transparent dark:from-gray-800 dark:via-gray-900 pt-32 pb-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/ai-pattern.svg')] bg-center opacity-5"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl mb-6">
                AI Image Generation
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Transform your ideas into stunning visuals using DALL·E 2
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Prompt Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Prompt
                  </label>
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={5}
                      className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-4"
                      placeholder="Describe the image you want to generate..."
                      required
                    />
                    <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                      {prompt.length} characters
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-white bg-gradient-to-r from-blue-500 to-purple-500 transition-all
                    ${isGenerating || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                >
                  {isGenerating ? (
                    <>
                      <LoadingDots color="white" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaMagic className="w-5 h-5" />
                      Generate Image
                    </>
                  )}
                </button>

                {error && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}
              </form>
            </div>

            {/* Result Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col h-[350px]">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2 flex-shrink-0">
                  <FaImage className="w-5 h-5" />
                  Generated Image
                  {isGenerating && <LoadingDots color="gray-400" />}
                </h2>
                <div className="flex-1 min-h-0">
                  <div className="relative h-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-hidden">
                    {isGenerating ? (
                      <AIImageProcessingLoader />
                    ) : generatedImage ? (
                      <div className="relative h-full">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src={generatedImage}
                            alt="Generated"
                            className="max-w-full max-h-full rounded-xl shadow-lg object-contain"
                            loading="eager"
                          />
                        </div>
                        {/* Download and Copy Buttons */}
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={() => downloadImage(generatedImage)}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10 group relative"
                            title="Download Image"
                          >
                            <FaImage className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            <span className="absolute -bottom-8 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                              Download PNG
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(generatedImage);
                              // Optional: Add a toast notification here
                            }}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10 group relative"
                            title="Copy Image URL"
                          >
                            <FaFileAlt className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            <span className="absolute -bottom-8 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                              Copy URL
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                        <FaImage className="w-16 h-16 mb-4 opacity-20" />
                        <p>Your generated image will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 