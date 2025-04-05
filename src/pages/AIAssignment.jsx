// src/pages/AIAssignment.jsx
import { useState, useRef, useEffect, Component } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_IP_ADDRESS;

// Add context management functions
const getStoredContext = () => {
  return localStorage.getItem('agentZeroContext');
};

const setStoredContext = (context) => {
  localStorage.setItem('agentZeroContext', context);
};

const sendToAgentZero = async (messageData) => {
  try {
    console.log('Sending to Agent Zero:', messageData);
    
    const storedContext = getStoredContext();
    const formData = new FormData();
    
    if (storedContext) {
      formData.append('context', storedContext);
    }
    
    if (messageData.message_id) {
      formData.append('message_id', messageData.message_id);
    }
    
    formData.append('message', JSON.stringify({
      type: 'user_message',
      content: messageData.solution,
      timestamp: new Date().toISOString()
    }));

    if (messageData.files?.length > 0) {
      messageData.files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
    }

    const response = await axios.post(`${API_BASE_URL}/message_async`, formData, {
      headers: {
        'Accept': 'application/json',
      },
      withCredentials: false,
      timeout: 30000
    });
    
    console.log('Response from /message_async:', response.data);
    
    return {
      type: 'agent_response',
      content: response.data.message || "Message received by Agent Zero",
      context: response.data.context,
      message_id: response.data.message_id || messageData.message_id
    };
  } catch (error) {
    console.error('Agent Zero Error:', error);
    throw error;
  }
};

const retryRequest = async (fn, maxRetries = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw lastError;
};

const checkAgentZeroConnection = async () => {
  return retryRequest(async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.status === 200;
  });
};

const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return `Server Error: ${error.response.data.message || 'Unknown error'}`;
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Error in request setup
    return 'Error setting up request. Please try again.';
  }
};

class ErrorBoundary extends Component {
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
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(true);
  const chatHistoryRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [solution, setSolution] = useState('');
  const [solutionFiles, setSolutionFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [agentResponse, setAgentResponse] = useState(null);

  // Add effect to initialize context
  useEffect(() => {
    // Clear context when component mounts (optional, remove if you want to persist across sessions)
    localStorage.removeItem('agentZeroContext');

    // Clean up context when component unmounts
    return () => {
      localStorage.removeItem('agentZeroContext');
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkAgentZeroConnection();
      setConnected(isConnected);
    };
    checkConnection();
  }, []);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    files.forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'bmp'].includes(ext);

      if (isImage) {
        const reader = new FileReader();
        reader.onload = e => {
          setAttachments(prev => [...prev, {
            file,
            url: e.target.result,
            type: 'image',
            name: file.name,
            extension: ext
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachments(prev => [...prev, {
          file,
          type: 'file',
          name: file.name,
          extension: ext
        }]);
      }
    });
  };

  const renderAIResponse = (message) => {
    if (!message || !message.content) {
      return null;
    }

     if (message.isAgentZero) {
    return (
      <div className={`flex items-start space-x-3 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
        <div className="flex-shrink-0">
          <img
            src="https://i.ibb.co/v66QRQXd/Screenshot-2025-04-05-014242.png"
            alt="Agent Zero"
            className="w-8 h-8 rounded-full"
          />
        </div>
        <div className="w-full">
          <p className="font-semibold mb-1">Agent Zero</p>
          
          {message.isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-pulse h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="animate-pulse h-2 w-2 bg-blue-500 rounded-full" style={{animationDelay: '0.2s'}}></div>
              <div className="animate-pulse h-2 w-2 bg-blue-500 rounded-full" style={{animationDelay: '0.4s'}}></div>
              <span className="ml-2 text-sm text-gray-500">Processing your request...</span>
            </div>
          ) : (
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {typeof message.content === 'string' 
                ? message.content 
                : typeof message.content === 'object' && message.content.content 
                  ? message.content.content
                  : JSON.stringify(message.content)}
            </div>
          )}
        </div>
      </div>
    );
  }
    if (typeof message.content === 'string') {
      return message.content;
    }

    if (message.content && typeof message.content === 'object') {
      // Handle error messages
      if (message.type === 'error') {
        return (
          <div className="text-red-500">
            {message.content.message || message.content.toString()}
          </div>
        );
      }
    
      // Handle normal object responses
      return (
        <div className="space-y-4">
          {message.content.title && (
            <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {message.content.title}
            </h3>
          )}
  
          {message.content.description && (
            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              {message.content.description}
            </p>
          )}

          {message.content.requirements?.length > 0 && (
            <div>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Requirements:
              </h4>
              <ul className="list-disc pl-5">
                {message.content.requirements.map((req, index) => (
                  <li key={index} className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {message.content.hints?.length > 0 && (
            <div>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Hints:
              </h4>
              <ul className="list-disc pl-5">
                {message.content.hints.map((hint, index) => (
                  <li key={index} className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {hint}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {message.content.estimatedTime && (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Estimated Time: {message.content.estimatedTime}
            </p>
          )}

          {/* Fallback for other object properties */}
          {!message.content.title && !message.content.description && (
            <pre className={`whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
              {JSON.stringify(message.content, null, 2)}
            </pre>
          )}
        </div>
      );
    }

    // Fallback for any other type of content
    return (
      <pre className={`whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
        {String(message.content)}
      </pre>
    );
  };

  const handleSolutionSubmit = async () => {
    if (!connected) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        type: 'error',
        content: 'Cannot connect to Agent Zero. Please try again later.'
      }]);
      return;
    }
  
    setSubmitting(true);
    try {
      // Add user message to chat first
      const userMessageId = Math.random().toString(36).substring(7);
      setMessages(prev => [...prev, {
        id: userMessageId,
        type: 'user',
        content: solution,
        isAgentZero: false
      }]);
  
      // Prepare message with files
      const messageData = {
        solution: solution,
        files: solutionFiles
      };
  
      // Show loading message
      const loadingId = Math.random().toString(36).substring(7);
      setMessages(prev => [...prev, {
        id: loadingId,
        type: 'agent',
        content: "Processing your request...",
        isAgentZero: true,
        isLoading: true
      }]);
  
      // Send message and get initial response with context
      const initialResponse = await sendToAgentZero(messageData);
      console.log('Initial response from Agent Zero:', initialResponse);
      
      // Store the context for future polling
      if (initialResponse.context) {
        setStoredContext(initialResponse.context);
      }
  
      // Start polling for the actual response
      const fullResponse = await pollForCompletedResponse(initialResponse.context);
      console.log('Full response from Agent Zero:', fullResponse);
  
      // Replace loading message with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId ? {
          ...msg,
          content: fullResponse.content || "No response content received",
          isLoading: false
        } : msg
      ));
  
      // Store the agent response for potential future use
      setAgentResponse(fullResponse);
      
      // Clear solution after submission
      setSolution('');
      setSolutionFiles([]);
  
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        type: 'error',
        content: handleApiError(error)
      }]);
      setConnected(false);
    } finally {
      setSubmitting(false);
    }
  };
  const pollForCompletedResponse = async (contextId, maxAttempts = 30) => {
    console.log(`Starting to poll for completed response with context: ${contextId}`);
    
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        // Use GET request with context as a query parameter
        const response = await axios.get(`${API_BASE_URL}/poll`, {
          params: { 
            context: contextId 
          },
          headers: {
            'Accept': 'application/json',
          },
          withCredentials: false
        });
  
        console.log(`Poll attempt ${attempts + 1}:`, response.data);
  
        // If we have a real response (not just acknowledgment)
        if (
          response.data.status === 'completed' || 
          (response.data.message && response.data.message !== 'Message received.') ||
          response.data.response
        ) {
          return {
            type: 'agent_response',
            content: response.data.message || response.data.response,
            context: contextId
          };
        }
        
        // If still processing, wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      } catch (error) {
        console.error(`Polling Error (attempt ${attempts + 1}):`, error);
        
        // Wait a bit longer after an error
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
        
        // If we've had many errors, throw
        if (attempts > maxAttempts / 2) {
          throw error;
        }
      }
    }
    
    throw new Error('Response timeout after maximum polling attempts');
  };
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Section - Now with better styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Assignment Chat Card */}
            <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Header with Status */}
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                    AI Assignment Chat
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-sm flex items-center ${connected
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      {connected ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                <ErrorBoundary>
                  {messages.map((message) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={message.id}
                      className={`flex ${message.type === 'user'
                          ? 'justify-end'
                          : message.isAgentZero
                            ? 'justify-start bg-blue-50 dark:bg-blue-900/20'
                            : 'justify-start'
                        }`}
                    >
                      <div className={`max-w-[80%] rounded-2xl p-4 ${message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.isAgentZero
                            ? darkMode
                              ? 'bg-blue-900/50 text-blue-100'
                              : 'bg-blue-50 text-blue-900'
                            : darkMode
                              ? 'bg-gray-700 text-gray-100'
                              : 'bg-gray-100 text-gray-900'
                        }`}>
                        {renderAIResponse(message)}
                      </div>
                    </motion.div>
                  ))}
                </ErrorBoundary>
                {/* Loading Animation */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className={`rounded-2xl p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                      <div className="flex space-x-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{
                              y: [0, -10, 0],
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            className={`w-3 h-3 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-500'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
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
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
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
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                    <span className="text-sm font-medium">
                      Estimated Time: {selectedAssignment.estimatedTime}
                    </span>
                  </div>
                </div>
              ) : (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                  <p className="text-center text-gray-500">
                    No assignment selected
                  </p>
                </div>
              )}
            </div>

            {/* Solution Editor Card */}
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
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

                {/* File Upload Area */}
                <div className={`p-4 rounded-xl border-2 border-dashed ${darkMode
                    ? 'border-gray-600 bg-gray-700'
                    : 'border-gray-300 bg-gray-50'
                  }`}>
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4 flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload files</span>
                        <input
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={(e) => setSolutionFiles(Array.from(e.target.files))}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Any file up to 10MB
                    </p>
                  </div>
                </div>

                {/* File List */}
                {solutionFiles.length > 0 && (
                  <div className="space-y-2">
                    {solutionFiles.map((file, index) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate max-w-xs">{file.name}</span>
                        </div>
                        <button
                          onClick={() => setSolutionFiles(files => files.filter((_, i) => i !== index))}
                          className="p-1 hover:bg-red-100 rounded-full text-red-500 hover:text-red-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSolutionSubmit}
                  disabled={!solution.trim() || submitting}
                  className={`w-full py-3 rounded-xl transition-colors ${submitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-semibold shadow-lg`}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting...</span>
                    </div>
                  ) : 'Submit Solution'}
                </motion.button>
              </div>
            </div>

            {/* Resources Card */}
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
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
                    className={`flex items-center space-x-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      } cursor-pointer transition-colors hover:bg-blue-50`}
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