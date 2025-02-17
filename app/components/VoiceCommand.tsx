/// <reference lib="dom" />
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Loader2, User, Bot, Copy, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Message = {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionErrorEvent = {
  error: string;
};

type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
};

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface VoiceCommandProps {
  onResponse?: (response: string) => void;
}

export default function VoiceCommand({ onResponse }: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      if (transcript.trim()) {
        handleVoiceInput();
      }
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  const handleVoiceInput = async () => {
    if (!transcript.trim()) return;

    // Add user message to history
    setMessages(prev => [...prev, {
      type: 'user',
      content: transcript,
      timestamp: new Date()
    }]);

    setIsLoading(true);
    try {
      const response = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: transcript }),
      });

      const data = await response.json();
      
      // Add AI response to history
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      }]);

      if (onResponse) {
        onResponse(data.response);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full px-3 sm:px-4 py-4 sm:py-6 overflow-hidden relative">
      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden mb-4">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <Bot className="w-12 h-12 sm:w-16 sm:h-16 text-purple-500/50 mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">
                Start a Voice Conversation
              </h2>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 text-center">
                Click the microphone button and start speaking
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} group px-2`}
              >
                <div className={`flex items-end gap-2 sm:gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  {/* Avatar */}
                  <div className={`hidden sm:flex flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="relative group max-w-[85vw] sm:max-w-[70%]">
                    <div className={`p-3 sm:p-4 rounded-2xl shadow-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700'
                    }`}>
                      <div className="prose dark:prose-invert prose-sm max-w-none break-words">
                        <ReactMarkdown
                          components={{
                            p: ({children}) => (
                              <p className="text-sm sm:text-base leading-relaxed mb-1">{children}</p>
                            ),
                            code: ({ className, children, ...props }: any) => {
                              const match = /language-(\w+)/.exec(className || '');
                              return match ? (
                                <div className="rounded-md overflow-hidden my-2">
                                  <SyntaxHighlighter
                                    language={match[1]}
                                    style={atomDark}
                                    customStyle={{
                                      margin: 0,
                                      padding: '0.75rem',
                                      fontSize: '0.8rem',
                                      backgroundColor: 'rgba(0,0,0,0.5)'
                                    }}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                </div>
                              ) : (
                                <code className="bg-black/20 rounded px-1.5 py-0.5 text-sm" {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>

                      {/* Message Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button 
                          className="p-1 sm:p-1.5 rounded-full hover:bg-black/10 transition-colors"
                          onClick={() => navigator.clipboard.writeText(message.content)}
                        >
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-current opacity-75" />
                        </button>
                        <button 
                          className="p-1 sm:p-1.5 rounded-full hover:bg-black/10 transition-colors"
                          onClick={() => setMessages(msgs => msgs.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-current opacity-75" />
                        </button>
                      </div>

                      {/* Timestamp */}
                      <div className="mt-1 text-[10px] sm:text-xs opacity-50">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Status Bar with Mic Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-3">
              {isListening && transcript && (
                <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300 text-sm font-medium mb-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    Currently speaking...
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{transcript}</p>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-2 text-purple-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Processing...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isListening 
                  ? 'Listening... Click to stop' 
                  : 'Click the mic to start speaking'
                }
              </p>
              
              <Button
                onClick={toggleListening}
                variant={isListening ? "destructive" : "default"}
                size="lg"
                className={`rounded-full w-12 h-12 p-0 shadow-lg transition-all transform hover:scale-105 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <div className="relative">
                    <Mic className="w-5 h-5 text-white" />
                    {!isLoading && messages.length === 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-300 rounded-full animate-ping" />
                    )}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 