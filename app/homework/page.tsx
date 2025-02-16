"use client";

import React, { useState } from 'react';
import Nav from "../components/Nav";
import { motion, AnimatePresence } from 'framer-motion';
import LoadingDots from '../components/LoadingDots';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import AIProcessingLoader from '../components/AIProcessingLoader';
import { FaBook, FaFlask, FaCalculator, FaHistory } from 'react-icons/fa';
import { FaChartBar, FaChevronDown, FaChevronUp } from 'react-icons/fa';

type Subject = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

const subjects: Subject[] = [
  { id: 'physics', name: 'Physics', icon: <FaFlask /> },
  { id: 'math', name: 'Math', icon: <FaCalculator /> },
  { id: 'chemistry', name: 'Chemistry', icon: <FaFlask /> },
  { id: 'history', name: 'History', icon: <FaHistory /> },
];

type AIType = 'basic' | 'agentic' | 'agent';

type CodeProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function HomeworkAssistant() {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(subjects[0]);
  const [input, setInput] = useState('');
  const [basicOutput, setBasicOutput] = useState('');
  const [agenticOutput, setAgenticOutput] = useState('');
  const [agentOutput, setAgentOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAgentic, setIsLoadingAgentic] = useState(false);
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [selectedAIType, setSelectedAIType] = useState<AIType>('basic');
  const [basicAnalysis, setBasicAnalysis] = useState<{ [key: string]: boolean }>({});
  const [agenticAnalysis, setAgenticAnalysis] = useState<{ [key: string]: boolean }>({});
  const [agentAnalysis, setAgentAnalysis] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'homework' | 'comparison'>('homework');
  const [isAnalysisOpenBasic, setIsAnalysisOpenBasic] = useState(false);
  const [isAnalysisOpenAgentic, setIsAnalysisOpenAgentic] = useState(false);
  const [isAnalysisOpenAgent, setIsAnalysisOpenAgent] = useState(false);

  const handleSubmit = async (e: React.FormEvent, aiType: AIType) => {
    e.preventDefault();
    if (!input.trim() || (aiType === 'basic' && isGenerating) || (aiType === 'agentic' && isLoadingAgentic) || (aiType === 'agent' && isLoadingAgent)) return;

    if (aiType === 'basic') setIsGenerating(true);
    if (aiType === 'agentic') setIsLoadingAgentic(true);
    if (aiType === 'agent') setIsLoadingAgent(true);

    try {
      const response = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject.id,
          prompt: input,
          aiType: aiType,
          agentType: selectedSubject.id,
        }),
      });

      const data = await response.json();

      if (aiType === 'basic') {
        setBasicOutput(data.response);
        setBasicAnalysis(data.analysis);
      }
      if (aiType === 'agentic') {
        setAgenticOutput(data.response);
        setAgenticAnalysis(data.analysis);
      }
      if (aiType === 'agent') {
        setAgentOutput(data.response);
        setAgentAnalysis(data.analysis);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      if (aiType === 'basic') setIsGenerating(false);
      if (aiType === 'agentic') setIsLoadingAgentic(false);
      if (aiType === 'agent') setIsLoadingAgent(false);
    }
  };

  const renderAnalysisTable = (analysis: { [key: string]: boolean }, aiType: string, isOpen: boolean, setIsOpen: (open: boolean) => void) => {
    if (Object.keys(analysis).length === 0) return null;

    const featureDescriptions = {
      explanation: "Provides a detailed explanation of the topic.",
      resources: "Includes links to external resources for further learning.",
      stepByStep: "Provides a step-by-step guide to solve a problem or understand a concept.",
      quiz: "Includes a quiz to test understanding.",
      feedback: "Provides personalized feedback based on the user's performance.",
      studyPlan: "Includes a study plan to help the user learn the topic effectively.",
    };

    const getIcon = (value: boolean) => {
      return value ? (
        <span className="text-green-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 inline-block"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      ) : (
        <span className="text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 inline-block"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
      );
    };

    return (
      <div className="mt-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-900 dark:text-white mb-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Click to view response analysis"
        >
          Response Analysis ({aiType})
          <span className="ml-2">
            {isOpen ? (
              <FaChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <FaChartBar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-x-auto"
            >
              <table className="w-full text-left border-collapse border border-gray-200 dark:border-gray-700 rounded-lg">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th
                      className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300"
                      title="Whether the response provides a detailed explanation of the topic."
                    >
                      Feature
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Present
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analysis).map(([key, value]) => (
                    <tr
                      key={key}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td
                        className="py-3 px-4 text-gray-700 dark:text-gray-300 capitalize"
                        title={
                          key === 'explanation'
                            ? 'Whether the response provides a detailed explanation of the topic. For example, "Photosynthesis is the process..."'
                            : key === 'resources'
                              ? 'Whether the response includes links to external resources for further learning. For example, "You can find more information here: [link]"'
                              : key === 'stepByStep'
                                ? 'Whether the response provides a step-by-step guide to solve a problem or understand a concept. For example, "Step 1:..., Step 2:..."'
                                : key === 'quiz'
                                  ? 'Whether the response includes a quiz to test understanding. For example, "Here is a quiz to test your knowledge:..."'
                                  : key === 'feedback'
                                    ? 'Whether the response provides personalized feedback based on the user\'s performance. For example, "Based on your quiz results, you should focus on..."'
                                    : key === 'studyPlan'
                                      ? 'Whether the response includes a study plan to help the user learn the topic effectively. For example, "Here is a study plan for you:..."'
                                      : ''
                        }
                      >
                        {key.replace(/([A-Z])/g, ' $1')}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {featureDescriptions[key as keyof typeof featureDescriptions]}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {getIcon(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-gray-900">
      <Nav />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-blue-50 via-white to-transparent dark:from-gray-800 dark:via-gray-900 pt-24 pb-12">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl"
              >
                AI Homework Assistant
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-xl text-gray-600 dark:text-gray-300"
              >
                Get personalized help with your homework
              </motion.p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('homework')}
              className={`p-3 rounded-lg border transition-all ${activeTab === 'homework'
                ? 'bg-blue-500 text-white border-transparent'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              Homework
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`p-3 rounded-lg border transition-all ${activeTab === 'comparison'
                ? 'bg-blue-500 text-white border-transparent'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              AI Comparison
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'homework' && (
            <>
              {/* Subject Selection */}
              <div className="flex space-x-4 mb-8">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject)}
                    className={`p-3 rounded-lg border transition-all ${selectedSubject.id === subject.id
                      ? 'bg-blue-500 text-white border-transparent'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                  >
                    <span className="text-xl">{subject.icon}</span>
                    <span className="ml-2">{subject.name}</span>
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Ask a Question
                </h2>
                <form className="flex flex-col space-y-4">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask me anything about ${selectedSubject.name}...`}
                    className="w-full rounded-2xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500 resize-none py-3 px-4 shadow-lg"
                    style={{ minHeight: '100px', maxHeight: '200px' }}
                  />
                </form>
              </div>

              {/* AI Type Selection */}
              <div className="flex space-x-4 mb-8">
                <button
                  onClick={() => setSelectedAIType('basic')}
                  className={`p-3 rounded-lg border transition-all ${selectedAIType === 'basic'
                    ? 'bg-blue-500 text-white border-transparent'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  Basic AI
                </button>
                <button
                  onClick={() => setSelectedAIType('agentic')}
                  className={`p-3 rounded-lg border transition-all ${selectedAIType === 'agentic'
                    ? 'bg-blue-500 text-white border-transparent'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  Agentic AI
                </button>
                <button
                  onClick={() => setSelectedAIType('agent')}
                  className={`p-3 rounded-lg border transition-all ${selectedAIType === 'agent'
                    ? 'bg-blue-500 text-white border-transparent'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  Specialized Agent
                </button>
              </div>

              {/* Output Area */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Basic Output Area */}
                {selectedAIType === 'basic' && (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Basic AI Response
                    </h2>
                    <div className="relative w-full h-[500px] rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto custom-scrollbar">
                      {isGenerating ? (
                        <AIProcessingLoader />
                      ) : (
                        <ReactMarkdown
                          className="prose prose-lg dark:prose-invert max-w-none"
                          components={{
                            code: ({ className, children, ...props }: CodeProps) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match;
                              
                              return !isInline ? (
                                <SyntaxHighlighter
                                  {...props}
                                  style={atomDark}
                                  language={match?.[1] || 'text'}
                                  PreTag="div"
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {basicOutput}
                        </ReactMarkdown>
                      )}
                    </div>
                    {renderAnalysisTable(basicAnalysis, 'Basic AI', isAnalysisOpenBasic, setIsAnalysisOpenBasic)}
                    <button
                      onClick={(e) => handleSubmit(e, 'basic')}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isGenerating}
                    >
                      {isGenerating ? <LoadingDots color="white" /> : 'Get Basic Answer'}
                    </button>
                  </div>
                )}

                {/* Agentic Output Area */}
                {selectedAIType === 'agentic' && (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Agentic AI Response
                    </h2>
                    <div className="relative w-full h-[500px] rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto custom-scrollbar">
                      {isLoadingAgentic ? (
                        <AIProcessingLoader />
                      ) : (
                        <ReactMarkdown
                          className="prose prose-lg dark:prose-invert max-w-none"
                          components={{
                            code: ({ className, children, ...props }: CodeProps) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match;
                              
                              return !isInline ? (
                                <SyntaxHighlighter
                                  {...props}
                                  style={atomDark}
                                  language={match?.[1] || 'text'}
                                  PreTag="div"
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {agenticOutput}
                        </ReactMarkdown>
                      )}
                    </div>
                    {renderAnalysisTable(agenticAnalysis, 'Agentic AI', isAnalysisOpenAgentic, setIsAnalysisOpenAgentic)}
                    <button
                      onClick={(e) => handleSubmit(e, 'agentic')}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoadingAgentic}
                    >
                      {isLoadingAgentic ? <LoadingDots color="white" /> : 'Get Agentic Answer'}
                    </button>
                  </div>
                )}

                {/* Agent Output Area */}
                {selectedAIType === 'agent' && (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Specialized Agent Response
                    </h2>
                    <div className="relative w-full h-[500px] rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto custom-scrollbar">
                      {isLoadingAgent ? (
                        <AIProcessingLoader />
                      ) : (
                        <ReactMarkdown
                          className="prose prose-lg dark:prose-invert max-w-none"
                          components={{
                            code: ({ className, children, ...props }: CodeProps) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match;
                              
                              return !isInline ? (
                                <SyntaxHighlighter
                                  {...props}
                                  style={atomDark}
                                  language={match?.[1] || 'text'}
                                  PreTag="div"
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {agentOutput}
                        </ReactMarkdown>
                      )}
                    </div>
                    {renderAnalysisTable(agentAnalysis, 'Specialized Agent', isAnalysisOpenAgent, setIsAnalysisOpenAgent)}
                    <button
                      onClick={(e) => handleSubmit(e, 'agent')}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoadingAgent}
                    >
                      {isLoadingAgent ? <LoadingDots color="white" /> : 'Get Agent Answer'}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'comparison' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Understanding AI Types
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This section provides a comparison of the different AI types used in this application.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">
                Basic AI (Non-Agentic)
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Basic AI provides a direct and concise answer to your question. It does not remember past interactions or adapt its behavior based on your context.
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
                <li>Stateless: Treats each request as a new, isolated event.</li>
                <li>Direct Response: Provides a direct answer to the user's question.</li>
                <li>No Planning: Does not create a plan or strategy to achieve a goal.</li>
                <li>Limited Context: Has limited understanding of the user's overall goals or needs.</li>
                <li>No Learning: Does not learn from user interactions or adapt its responses over time.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">
                Agentic AI
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Agentic AI acts as an "agent," capable of perceiving its environment, reasoning about the best course of action, acting on that reasoning, and learning from its actions.
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
                <li>Stateful: Maintains a memory of past interactions and user context.</li>
                <li>Reasoning and Planning: Can analyze the user's request, identify their goals, and create a plan to achieve those goals.</li>
                <li>Adaptive: Can adapt its responses based on user performance and feedback.</li>
                <li>Proactive: Can take initiative to provide additional resources or guidance.</li>
                <li>Goal-Oriented: Works towards a specific goal, such as helping the user learn a concept or prepare for an exam.</li>
                <li>Iterative: Can engage in a multi-turn conversation with the user, refining its responses based on their feedback.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">
                Specialized Agent
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Specialized Agents are designed to provide expert-level assistance in specific subjects. They combine the capabilities of Agentic AI with specialized knowledge.
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
                <li>Expert Knowledge: Provides detailed explanations, examples, and problem-solving strategies in specific subjects.</li>
                <li>Personalized Guidance: Offers tailored advice and resources based on the user's needs.</li>
                <li>Adaptive Learning: Adjusts its approach based on user interactions and performance.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">
                Comparison Table
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-gray-200 dark:border-gray-700 rounded-lg">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Feature</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Basic AI</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Agentic AI</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Specialized Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Memory</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Stateless</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Stateful</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Stateful</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Response</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Direct, Factual</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Personalized, Adaptive</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Personalized, Expert</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Planning</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">No Planning</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Creates Plans</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Creates Detailed Plans</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Context</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Limited</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Understands User Goals</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Understands User Goals & Subject</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Learning</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">No Learning</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Learns from Interactions</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Learns from Interactions</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Proactivity</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Reactive</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Proactive</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Highly Proactive</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Goal</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Answers Questions</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Helps User Achieve Goals</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Provides Expert Guidance</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Expertise</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">General</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">General</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Subject-Specific</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}