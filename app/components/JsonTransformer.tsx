"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './JsonTransformer.css';
import { FaCopy } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface JsonTransformerProps {
}

async function callOpenAI(input: any[]) {
  const output: any[] = [];
  let currentQuestion: any = null;

  input.forEach(row => {
    if (row.Flag === "QuestionText") {
      // Start a new question object
      currentQuestion = { ...row, Answers: [] };
      output.push(currentQuestion);
    } else if (row.Flag === "AnswerValue" && currentQuestion) {
      // Add an answer to the current question
      const answer = { ...row, QuestionKey: currentQuestion.PrimaryKey };
      currentQuestion.Answers.push(answer);
    }
  });

  return output;
}

const JsonTransformer: React.FC<JsonTransformerProps> = () => {
  const [jsonOld, setJsonOld] = useState<any[] | null>(null);
  const [jsonRefactor, setJsonRefactor] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [stringifiedJsonOld, setStringifiedJsonOld] = useState<string | null>(null);
  const [stringifiedJsonRefactor, setStringifiedJsonRefactor] = useState<string | null>(null);
  const originalRef = useRef<HTMLDivElement>(null);
  const refactoredRef = useRef<HTMLDivElement>(null);
  const [SyntaxHighlighter, setSyntaxHighlighter] = useState<any>(null);

  useEffect(() => {
    const loadSyntaxHighlighter = async () => {
      const { Prism: SyntaxHighlighter } = await import('react-syntax-highlighter');
      setSyntaxHighlighter(() => SyntaxHighlighter);
    };

    loadSyntaxHighlighter();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/transform');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setJsonOld(data.jsonOld);
        setJsonRefactor(data.jsonRefactor);
      } catch (error) {
        console.error("Error fetching or transforming JSON:", error);
        setJsonOld(null);
        setJsonRefactor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (jsonOld) {
      setStringifiedJsonOld(JSON.stringify(jsonOld, null, 2));
    }
    if (jsonRefactor) {
      setStringifiedJsonRefactor(JSON.stringify(jsonRefactor, null, 2));
    }
  }, [jsonOld, jsonRefactor]);

  const calculateHeight = useCallback(() => {
    if (originalRef.current) {
      originalRef.current.style.height = 'auto';
      originalRef.current.style.height = `${originalRef.current.scrollHeight}px`;
    }
    if (refactoredRef.current) {
      refactoredRef.current.style.height = 'auto';
      refactoredRef.current.style.height = `${refactoredRef.current.scrollHeight}px`;
    }
  }, []);

  const debouncedCalculateHeight = useCallback(
    debounce(calculateHeight, 100),
    [calculateHeight]
  );

  useEffect(() => {
    debouncedCalculateHeight();
  }, [debouncedCalculateHeight, stringifiedJsonOld, stringifiedJsonRefactor]);

  function debounce<F extends (...args: any[]) => void>(func: F, delay: number) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return function (...args: any[]) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
        timeoutId = null;
      }, delay);
    };
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} JSON copied to clipboard!`, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 p-6"
    >
      <ToastContainer />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        JSON Transformation
      </h2>
      {loading ? (
        <div className="text-center text-gray-600 dark:text-gray-300">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Original JSON */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Original JSON
              </h3>
              {stringifiedJsonOld && (
                <button
                  onClick={() => copyToClipboard(stringifiedJsonOld, 'Original')}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                >
                  <FaCopy className="w-5 h-5" />
                </button>
              )}
            </div>
            <div
              className={`overflow-x-auto json-container ${document.body.classList.contains('dark') ? 'dark-scrollbar' : ''}`}
              ref={originalRef}
              style={{
                maxHeight: '500px',
              }}
            >
              {stringifiedJsonOld && SyntaxHighlighter ? (
                <SyntaxHighlighter language="json" style={dracula} customStyle={{ background: 'transparent' }}>
                  {stringifiedJsonOld}
                </SyntaxHighlighter>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  Error fetching original JSON.
                </div>
              )}
            </div>
          </div>

          {/* Refactored JSON */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Refactored JSON
              </h3>
              {stringifiedJsonRefactor && (
                <button
                  onClick={() => copyToClipboard(stringifiedJsonRefactor, 'Refactored')}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                >
                  <FaCopy className="w-5 h-5" />
                </button>
              )}
            </div>
            <div
              className={`overflow-x-auto json-container ${document.body.classList.contains('dark') ? 'dark-scrollbar' : ''}`}
              ref={refactoredRef}
              style={{
                maxHeight: '500px',
              }}
            >
              {stringifiedJsonRefactor && SyntaxHighlighter ? (
                <SyntaxHighlighter language="json" style={dracula} customStyle={{ background: 'transparent' }}>
                  {stringifiedJsonRefactor}
                </SyntaxHighlighter>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  Error transforming JSON.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default JsonTransformer;