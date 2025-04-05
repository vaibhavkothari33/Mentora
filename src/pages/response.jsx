// src/pages/AIAssignment.jsx
import React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { useChat } from '../hooks/useAgent';
import { FaSpinner } from 'react-icons/fa';
import { FaArrowDown } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-600 font-semibold">Something went wrong</h2>
          <p className="text-red-500 mt-2">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const AIAssignment = () => {
  const { darkMode } = useTheme();
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [solution, setSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const outputRef = useRef(null);
  
  // Use the useChat hook for bot functionality
  const {
    messages,
    isConnected,
    error,
    logProgress,
    logProgressActive,
    sendMessage
  } = useChat();

  // Check if should show scroll button when messages change
  useEffect(() => {
    if (outputRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = outputRef.current;
      const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isNotAtBottom);
    }
  }, [messages]);

  // Handle scroll to bottom
  const scrollToBottom = () => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
      setShowScrollButton(false);
    }
  };

  // Memoize the renderAIResponse function to prevent unnecessary re-renders
  const renderAIResponse = useCallback((message) => {
    if (!message || !message.content) {
      return null;
    }

    // Helper function to format content based on type
    const formatContent = (content) => {
      if (typeof content === 'string') {
        // Check if it's JSON
        try {
          const parsed = JSON.parse(content);
          return (
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          );
        } catch (e) {
          // If not JSON, return as regular text
          return content;
        }
      } else if (Array.isArray(content)) {
        return (
          <ul className="space-y-2">
            {content.map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="mt-1.5">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span>{typeof item === 'object' ? JSON.stringify(item, null, 2) : item}</span>
              </li>
            ))}
          </ul>
        );
      } else if (typeof content === 'object') {
        return (
          <div className="space-y-3">
            {Object.entries(content).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="font-medium text-blue-600">{key}:</div>
                <div className="pl-4">
                  {formatContent(value)}
                </div>
              </div>
            ))}
          </div>
        );
      }
      return String(content);
    };

    // Handle different message types
    switch (message.type) {
      case 'user':
        return (
          <div className={`flex justify-end ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            <div className="max-w-[80%] bg-blue-600 text-white p-4 rounded-2xl shadow-sm">
              {message.content}
            </div>
          </div>
        );

      case 'info':
        return (
          <div className="flex justify-center">
            <div className={`px-4 py-2 rounded-full text-sm ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              {message.content}
            </div>
          </div>
        );

      case 'util':
        return (
          <div className="flex justify-center">
            <div className={`px-4 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
              <div className="font-medium mb-1">{message.heading}</div>
              {message.content && formatContent(message.content)}
            </div>
          </div>
        );

      case 'agent':
        return (
          <div className={`flex items-start space-x-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                A0
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium mb-1">{message.heading}</div>
              <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                {formatContent(message.content)}
              </div>
            </div>
          </div>
        );

      case 'response':
        return (
          <div className={`flex items-start space-x-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                ✓
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium mb-1">{message.heading}</div>
              <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                {formatContent(message.content)}
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="flex justify-center">
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl max-w-[80%]">
              <div className="flex items-center space-x-2 text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatContent(message.content)}</span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            {formatContent(message.content)}
          </div>
        );
    }
  }, [darkMode]);

  // Memoize the handleSolutionSubmit function
  const handleSolutionSubmit = useCallback(async () => {
    if (!isConnected) {
      return;
    }
  
    setSubmitting(true);
    try {
      // Send the solution using the useChat hook
      await sendMessage(solution);
      
      // Clear solution after submission
      setSolution('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  }, [isConnected, sendMessage, solution]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bot Output Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Bot Output Card */}
            <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Header with Status */}
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    AI Assignment Assistant
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className={`px-4 py-1.5 rounded-full text-sm flex items-center space-x-2 transition-all duration-300 ${
                      isConnected
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        isConnected ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bot Output Messages */}
              <div className="relative">
                <div className="h-[500px] overflow-y-auto p-4 space-y-4" ref={outputRef}>
                  <ErrorBoundary>
                    {messages.map((message) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        key={message.no}
                      >
                        {renderAIResponse(message)}
                      </motion.div>
                    ))}
                  </ErrorBoundary>
                  
                  {/* Progress Bar */}
                  {logProgressActive && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                      <motion.div 
                        className="bg-blue-600 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${logProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-2xl"
                    >
                      <div className="flex items-center space-x-2 text-red-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Scroll to Bottom Button */}
                {showScrollButton && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={scrollToBottom}
                    className="absolute bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaArrowDown className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Solution Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Current Assignment Card */}
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Current Assignment
              </h2>
              {selectedAssignment ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-blue-600">
                    {selectedAssignment.title}
                  </h3>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {selectedAssignment.description}
                  </p>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <span className="text-sm font-medium">
                      Estimated Time: {selectedAssignment.estimatedTime}
                    </span>
                  </div>
                </div>
              ) : (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className="text-center text-gray-500">
                    No assignment selected
                  </p>
                </div>
              )}
            </div>

            {/* Solution Editor Card */}
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Your Solution
              </h2>
              <div className="space-y-4">
                <textarea
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Write your solution here..."
                  className={`w-full h-48 p-4 rounded-xl resize-none transition-colors ${darkMode
                      ? 'bg-gray-700 text-gray-100 placeholder-gray-400'
                      : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSolutionSubmit}
                  disabled={!solution.trim() || submitting || !isConnected}
                  className={`w-full py-3 rounded-xl transition-colors ${submitting || !isConnected
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-semibold shadow-lg`}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FaSpinner className="animate-spin h-5 w-5 text-white" />
                      <span>Submitting...</span>
                    </div>
                  ) : !isConnected ? 'Not Connected' : 'Submit Solution'}
                </motion.button>
              </div>
            </div>

            {/* Resources Card */}
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Resources & Tips
              </h2>
              <div className="space-y-4">
                {[
                  { icon: '📚', text: 'Review the documentation' },
                  { icon: '🧪', text: 'Test your solution thoroughly' },
                  { icon: '💡', text: 'Include detailed comments' },
                  { icon: '🔍', text: 'Check edge cases' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} cursor-pointer transition-colors hover:bg-blue-50`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AIAssignment;
