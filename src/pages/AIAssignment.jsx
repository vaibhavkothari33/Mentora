import React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../hooks/useAgent';
import { FaSpinner, FaArrowDown, FaPaperPlane, FaGithub, FaCheck, FaTasks, FaCode, FaChevronDown } from 'react-icons/fa';
// import { IoInformationCircle } from 'react-icons/io5';
import { MdError, MdOutlineSmartToy } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import { useAssignmentManager } from '../hooks/useAssignmentManager';

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

// Add these constants at the top of the file
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID; // Replace with your GitHub OAuth App Client ID
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI;
const GITHUB_CLIENT_SECRET = import.meta.env.VITE_GITHUB_CLIENT_SECRET; // Replace with your GitHub OAuth App Client Secret

async function getRepoStructure(repoUrl) {
  try {
    // Extract owner and repo name from GitHub URL
    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');
    
    // Fetch repository contents from GitHub API
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`);
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Unable to fetch repository structure');
    }

    return formatRepoStructure(data, owner, repo);
  } catch (error) {
    console.error('Error fetching repo structure:', error);
    throw new Error('Failed to fetch repository structure');
  }
}

function formatRepoStructure(items, owner, repo) {
  // Start with the root directory
  let structure = 'Directory structure:\n';
  structure += `└── ${owner}-${repo}/\n`;

  // Sort items: directories first, then files
  const sortedItems = items.sort((a, b) => {
    if (a.type === 'dir' && b.type !== 'dir') return -1;
    if (a.type !== 'dir' && b.type === 'dir') return 1;
    return a.name.localeCompare(b.name);
  });

  // Add each item with proper indentation and tree characters
  sortedItems.forEach((item, index) => {
    const isLast = index === sortedItems.length - 1;
    const prefix = isLast ? '    └── ' : '    ├── ';
    structure += `${prefix}${item.name}\n`;
  });

  return structure;
}

const GitHubRepoSelector = ({ onSelect, selectedRepo, darkMode, onRepoSelect }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check if there's a code in the URL (GitHub callback)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleGitHubCode(code);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGitHubAuth = () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construct GitHub OAuth URL
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=repo`;
      
      // Open GitHub OAuth in a popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        githubAuthUrl,
        'github-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Poll the popup for the redirect
      const checkPopup = setInterval(() => {
        try {
          if (!popup || popup.closed) {
            clearInterval(checkPopup);
            setLoading(false);
            return;
          }

          const popupUrl = popup.location.href;
          if (popupUrl.includes('code=')) {
            clearInterval(checkPopup);
            const code = new URL(popupUrl).searchParams.get('code');
            handleGitHubCode(code);
            popup.close();
          }
        } catch (e) {
          // Ignore cross-origin errors while polling
        }
      }, 500);
    } catch (error) {
      setError('Failed to open GitHub authentication');
      setLoading(false);
    }
  };

  const handleGitHubCode = async (code) => {
    try {
      // Exchange code for access token
      const tokenResponse = await fetch('/github/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
          client_secret: import.meta.env.VITE_GITHUB_CLIENT_SECRET, // This should be handled securely
          code,
          redirect_uri: import.meta.env.VITE_GITHUB_REDIRECT_URI,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        throw new Error(tokenData.error_description || 'Failed to get access token');
      }

      const accessToken = tokenData.access_token;

      // Fetch ALL repositories (update the fetch call)
      const allRepos = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const reposResponse = await fetch(`/api/user/repos?page=${page}&per_page=100`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        const pageRepos = await reposResponse.json();
        
        if (pageRepos.length === 0) {
          hasMore = false;
        } else {
          allRepos.push(...pageRepos);
          page += 1;
        }
      }

      setRepos(allRepos.map(repo => ({
        id: repo.id,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        updated_at: repo.updated_at,
      })));

      setLoading(false);
    } catch (error) {
      console.error('GitHub auth error:', error);
      setError(error.message || 'Failed to authenticate with GitHub');
      setLoading(false);
    }
  };

  const handleRepoSelect = async (repoFullName) => {
    // Only pass the repository URL to onSelect
    const repoUrl = `https://github.com/${repoFullName}`;
    onSelect(repoUrl);
    
    if (repoFullName) {
      try {
        // Get repository structure
        const structure = await getRepoStructure(repoUrl);
        // Pass both URL and structure to parent
        onRepoSelect(`${repoUrl}\n\n${structure}`);
      } catch (error) {
        console.error('Error getting repo structure:', error);
        // If structure fetch fails, just pass the URL
        onRepoSelect(repoUrl);
      }
    }
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

    return (
    <div className={`rounded-2xl p-6 shadow-lg border mb-4 relative overflow-visible
      ${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -mr-32 -mt-32 transform rotate-45"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-full -ml-24 -mb-24"></div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <FaGithub className={`h-6 w-6 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`} />
        </div>
            <div>
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                GitHub Repository
              </h2>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {repos.length ? `${repos.length} repositories available` : 'Connect to view your repositories'}
              </p>
            </div>
          </div>

          {!repos.length && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGitHubAuth}
              disabled={loading}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all duration-200
                ${darkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''} shadow-lg hover:shadow-xl`}
            >
              <FaGithub className="h-5 w-5" />
              <span className="font-medium">{loading ? 'Connecting...' : 'Connect GitHub'}</span>
            </motion.button>
          )}
            </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 mb-4 rounded-xl text-sm flex items-center space-x-3 ${
              darkMode ? 'bg-red-900/20 text-red-300 border border-red-800/30' : 'bg-red-50 text-red-600 border border-red-100'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        {/* Repository Selector */}
        {repos.length > 0 && (
          <div className="space-y-3" ref={dropdownRef}>
            <div className={`relative ${isOpen ? 'z-50' : 'z-0'}`}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 hover:border-gray-500 text-gray-200'
                    : 'bg-white border-gray-300 hover:border-gray-400 text-gray-800'
                }`}
              >
                <span className="flex items-center space-x-3">
                  <FaGithub className="h-5 w-5" />
                  <span className="truncate">{selectedRepo || 'Select a repository'}</span>
                </span>
                <svg
                  className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu with Fixed Height and Scroll */}
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`absolute w-full mt-2 rounded-xl border shadow-lg overflow-hidden z-50 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-white border-gray-200'
                  }`}
                  style={{ 
                    maxHeight: '400px',
                    overflowY: 'auto',
                    // Add custom scrollbar styling
                    scrollbarWidth: 'thin',
                    scrollbarColor: darkMode ? '#4B5563 #1F2937' : '#E5E7EB #F3F4F6'
                  }}
                >
                  <div className="h-full">
                    {repos
                      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                      .map((repo) => (
                        <button
                          key={repo.id}
                          onClick={() => {
                            handleRepoSelect(repo.full_name);
                            setIsOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors
                            ${darkMode
                              ? 'hover:bg-gray-600 text-gray-200'
                              : 'hover:bg-gray-50 text-gray-700'
                            } ${repo.full_name === selectedRepo ? 
                                (darkMode ? 'bg-gray-600' : 'bg-gray-100') 
                                : ''
                            }`}
                        >
                          <FaGithub className={`h-5 w-5 flex-shrink-0 ${
                            repo.private 
                              ? 'text-yellow-500' 
                              : darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">{repo.full_name}</div>
                            {repo.description && (
                              <div className={`text-sm truncate ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {repo.description}
                              </div>
                            )}
                          </div>
                          {repo.private && (
                            <span className={`text-xs px-2 py-1 roundeassignmentd-full flex-shrink-0 ${
                              darkMode 
                                ? 'bg-yellow-900/30 text-yellow-400' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              Private
                            </span>
                          )}
                        </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            </div>
          )}
        </div>
      </div>
    );
};

// Add this utility function before the AIAssignment component
const convertToTitleCase = (str) => {
  return str
    .replace(/_/g, " ") // Replace underscores with spaces
    .toLowerCase() // Convert the entire string to lowercase
    .replace(/\b\w/g, function (match) {
      return match.toUpperCase(); // Capitalize the first letter of each word
    });
};

const AIAssignment = () => {
  const { id } = useParams();
  const { darkMode } = useTheme();
  const { getClient } = useAssignmentManager();
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  // const [solution, setSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const outputRef = useRef(null);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [repoStructure, setRepoStructure] = useState('');
  const [expandedCheckpoints, setExpandedCheckpoints] = useState({});

  // Use the useChat hook for bot functionality
  const {
    messages,
    isConnected,
    error: chatError,
    logProgress,
    logProgressActive,
    sendMessage
  } = useChat();

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        const client = getClient();
        const assignment = await client.getAssignment(parseInt(id));
        setSelectedAssignment({
          id,
          checkpoints: assignment.evaluationCriteria.split('\n\n').map((check, index) => ({
            id: index + 1,
            title: check.split('\n')[0].replace(/Task \d+: /, ""),
            description: check.split('\n').slice(1).join('\n'),
          })),
          ...assignment
        });
      } catch (err) {
        console.error('Error fetching assignment:', err);
        setError('Failed to load assignment. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAssignment();
    }
  }, [id, getClient]);

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

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && outputRef.current) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Memoize the renderAIResponse function to prevent unnecessary re-renders
  const renderAIResponse = useCallback((message) => {
    if (!message || !message.content) return null;
  
    const formatContent = (content) => {
      try {
        // Check if the entire content is valid JSON (not just code blocks)
        try {
          const parsed = JSON.parse(content);
          
          if (parsed.thoughts && parsed.tool_args) {
            return (
              <div className="space-y-4">
                {/* Tool Output Section */}
                {parsed.tool_args.text && (
                  <div className={`rounded-xl p-6 ${
                    darkMode 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-white border border-gray-200'
                  } shadow-lg`}>
                    <div className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none text-white`}>
                      <ReactMarkdown>{parsed.tool_args.text}</ReactMarkdown>
                    </div>
                  </div>
                )}
                
                {/* Thoughts Section */}
                {Array.isArray(parsed.thoughts) && parsed.thoughts.length > 0 && (
                  <details className="group">
                    <summary className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
                      darkMode 
                        ? 'text-blue-400 hover:bg-gray-800/50' 
                        : 'text-blue-600 hover:bg-gray-50'
                    }`}>
                      <svg className="w-5 h-5 transform transition-transform group-open:rotate-90" 
                           viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                      <span className="font-medium">View AI's Thought Process</span>
                    </summary>
                    
                    <div className={`mt-3 p-4 rounded-xl ${
                      darkMode 
                        ? 'bg-gray-800/50 border border-gray-700' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <ul className="space-y-3">
                        {parsed.thoughts.map((thought, index) => (
                          <li key={index} className={`flex items-start gap-3 p-2 rounded-lg ${
                            darkMode 
                              ? 'hover:bg-gray-800/50' 
                              : 'hover:bg-gray-50'
                          }`}>
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                              darkMode 
                                ? 'bg-blue-900/50 text-blue-400' 
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {index + 1}
                            </span>
                            <span className={`text-sm ${
                              darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {thought}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )}
              </div>
            );
          }
          
          // For any other valid JSON that doesn't match our specific format
          return (
            <div className={`rounded-xl p-6 ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <div className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none text-white`}>
                <pre className={`language-json rounded p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <code>{JSON.stringify(parsed, null, 2)}</code>
                </pre>
              </div>
            </div>
          );
        } catch (directJsonError) {
          // Not direct JSON, check for code blocks
          if (content.includes('```json')) {
            // Extract JSON content between the backticks
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
              const jsonContent = jsonMatch[1].trim();
              
              try {
                const parsed = JSON.parse(jsonContent);
                
                if (parsed.thoughts && parsed.tool_args) {
                  // Same rendering as above for our specific format
                  return (
                    <div className="space-y-4">
                      {/* Tool Output Section */}
                      {parsed.tool_args.text && (
                        <div className={`rounded-xl p-6 ${
                          darkMode 
                            ? 'bg-gray-800 border border-gray-700' 
                            : 'bg-white border border-gray-200'
                        } shadow-lg`}>
                          <div className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none text-white`}>
                            <ReactMarkdown>{parsed.tool_args.text}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      
                      {/* Thoughts Section */}
                      {Array.isArray(parsed.thoughts) && parsed.thoughts.length > 0 && (
                        <details className="group">
                          <summary className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
                            darkMode 
                              ? 'text-blue-400 hover:bg-gray-800/50' 
                              : 'text-blue-600 hover:bg-gray-50'
                          }`}>
                            <svg className="w-5 h-5 transform transition-transform group-open:rotate-90" 
                                 viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                            <span className="font-medium">View AI's Thought Process</span>
                          </summary>
                          
                          <div className={`mt-3 p-4 rounded-xl ${
                            darkMode 
                              ? 'bg-gray-800/50 border border-gray-700' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <ul className="space-y-3">
                              {parsed.thoughts.map((thought, index) => (
                                <li key={index} className={`flex items-start gap-3 p-2 rounded-lg ${
                                  darkMode 
                                    ? 'hover:bg-gray-800/50' 
                                    : 'hover:bg-gray-50'
                                }`}>
                                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                                    darkMode 
                                      ? 'bg-blue-900/50 text-blue-400' 
                                      : 'bg-blue-100 text-blue-600'
                                  }`}>
                                    {index + 1}
                                  </span>
                                  <span className={`text-sm ${
                                    darkMode ? 'text-gray-300' : 'text-gray-600'
                                  }`}>
                                    {thought}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </details>
                      )}
                    </div>
                  );
                }
                
                // For any other valid JSON in code blocks
                const contentWithFormattedJson = content.replace(
                  /```json\n([\s\S]*?)\n```/g, 
                  (match, jsonStr) => {
                    try {
                      const obj = JSON.parse(jsonStr.trim());
                      return '```json\n' + JSON.stringify(obj, null, 2) + '\n```';
                    } catch (e) {
                      return match;
                    }
                  }
                );
                
                return (
                  <div className={`rounded-xl p-6 ${
                    darkMode 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-white border border-gray-200'
                  } shadow-lg`}>
                    <div className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none text-white`}>
                      <ReactMarkdown>{contentWithFormattedJson}</ReactMarkdown>
                    </div>
                  </div>
                );
              } catch (jsonError) {
                console.error('JSON parsing error:', jsonError);
              }
            }
          }
        }
        
        // Fallback for non-JSON content or invalid JSON
        return (
          <div className={`rounded-xl p-6 ${
            darkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none text-white`}>
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        );
      } catch (e) {
        console.error('Content formatting error:', e);
        return (
          <div className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none text-white`}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        );
      }
    };
  
    // Enhanced message type rendering
    switch (message.type) {
      case 'agent':
        return (
          <div className="mb-6">
            {message.heading && (
              <div className={`flex items-center gap-2 mb-3 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                <MdOutlineSmartToy className="h-5 w-5" />
                {/* <h3 className="font-medium">{message.heading}</h3> */}
              </div>
            )}
            {formatContent(message.content)}
          </div>
        );
      case 'code_exe':
        return (
          <div className="mb-6 text-blue-600">
            {message.heading && (
              <div className={`flex items-center gap-2 mb-3 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                <FaCode className="h-5 w-5" />
                {/* <h3 className="font-medium">{message.heading}</h3> */}
              </div>
            )}
            <div className={`rounded-lg p-4 font-mono text-sm whitespace-pre-wrap ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700 text-gray-300' 
                : 'bg-gray-50 border border-gray-200 text-gray-700'
            }`}>
              {message.content}
            </div>
          </div>
        );
      case 'response':
        return (
          <div className="mb-6 text-white">
            {message.heading && (
              <div className={`flex text-white items-center gap-2 mb-3 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="font-medium">Generating Response</h3>
              </div>
            )}
            {formatContent(message.content)}
          </div>
        );
  
      case 'info':
        return (
          <div className="flex justify-center my-3">
            <div className={`inline-flex text-white items-center gap-2 px-4 py-2 rounded-full text-sm ${
              darkMode 
                ? 'bg-gray-800/50 text-gray-300 border border-gray-700' 
                : 'bg-gray-50 text-gray-600 border border-gray-200'
            }`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{message.content}</span>
            </div>
          </div>
        );
  
      case 'util':
        return (
          <div className="mb-4">
            {message.heading && (
              <div className={`flex text-white items-center gap-2 mb-3 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <h4 className="font-medium text-sm">{message.heading}</h4>
              </div>
            )}
            {message.content && message.content.includes('github.com') ? (
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <a 
                  href={message.content.match(/(https:\/\/github\.com\/[^\s]+)/)?.[0]} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                >
                  <FaGithub className="text-lg" />
                  {message.content.match(/(https:\/\/github\.com\/[^\s]+)/)?.[0]}
                </a>
              </div>
            ) : (
              formatContent(message.content)
            )}
          </div>
        );
  
      case 'user':
        return (
          <div className="flex justify-end mb-6">
            <div className={`max-w-[80%] p-4 rounded-xl shadow-lg ${
              darkMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {message.content.includes('github.com') ? (
                <a 
                  href={message.content.match(/(https:\/\/github\.com\/[^\s]+)/)?.[0]} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white hover:underline"
                >
                  <FaGithub className="text-lg" />
                  {message.content.match(/(https:\/\/github\.com\/[^\s]+)/)?.[0]}
                </a>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
          </div>
        );
  
      default:
        return (
          <div className="mb-4">
            {formatContent(message.content)}
          </div>
        );
    }
  }, [darkMode]); 

  // Memoize the handleSolutionSubmit function
  const handleSolutionSubmit = useCallback(async () => {
    if (!isConnected || !selectedRepo.trim()) return;

    setSubmitting(true);
    try {
      // Extract GitHub repository URL from the selected repo
      const repoUrl = selectedRepo.trim();
      const githubUrlMatch = repoUrl.match(/(https:\/\/github\.com\/[^\s]+)/);
      
      if (!githubUrlMatch) {
        throw new Error('No valid GitHub repository URL found');
      }

      const githubUrl = githubUrlMatch[1];
      const prompt = selectedAssignment.metaPrompt.replace('{{ github_link }}', githubUrl);
      
      // Send the prompt directly
      await sendMessage(prompt);
    } catch (error) {
      console.error('Error:', error);
      // Show error to the user
      setError(error.message || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  }, [isConnected, sendMessage, selectedRepo, selectedAssignment]);

  const toggleCheckpoints = (assignmentId) => {
    setExpandedCheckpoints(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  const handleRepoSelect = (repoUrlAndStructure) => {
    // Extract the repository URL and structure
    const [repoUrl, ...structureParts] = repoUrlAndStructure.split('\n\n');
    setSelectedRepo(repoUrl);
    setRepoStructure(structureParts.join('\n\n'));
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mb-4" />
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex text-red-600 items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg max-w-md w-full`}>
          <div className="flex items-center gap-3 mb-4">
            <MdError className="h-6 w-6 text-red-500" />
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Error</h2>
          </div>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`w-full py-2 rounded-lg ${
              darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!selectedAssignment) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg max-w-md w-full`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Assignment Not Found
          </h2>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            The requested assignment could not be found.
          </p>
          <button
            onClick={() => window.history.back()}
            className={`w-full py-2 rounded-lg ${
              darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Chat section */}
          <motion.div className="lg:col-span-2">
            {/* Add GitHub Repo Selector at the top */}
            <GitHubRepoSelector
              onSelect={setSelectedRepo}
              selectedRepo={selectedRepo}
              darkMode={darkMode}
              onRepoSelect={handleRepoSelect}
            />
            
            {/* Bot Output Card */}
            <div className={`rounded-xl overflow-hidden shadow-lg border
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              {/* Header with Status */}
              <div className={`p-4 border-b
                ${darkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                    }`}>
                      <MdOutlineSmartToy className="h-6 w-6" />
                    </div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      AI Assignment Assistant
                  </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1.5 rounded-full text-sm flex items-center space-x-2 transition-all duration-300 ${isConnected
                        ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                        : darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                      }`}>
                      <div className={`w-2 h-2 rounded-full ${isConnected
                          ? 'bg-green-500 animate-pulse'
                          : 'bg-red-500'
                        }`} />
                      <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bot Output Messages */}
              <div className="relative">
                <div className={`h-[500px] overflow-y-auto p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'
                  }`} ref={outputRef}>
                <ErrorBoundary>
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center">
                        <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${darkMode
                            ? 'bg-blue-900/20 text-blue-400'
                            : 'bg-blue-100 text-blue-600'
                          }`}>
                          <MdOutlineSmartToy className="h-8 w-8" />
                        </div>
                        <h3 className={`text-xl font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>Welcome to AI Assistant</h3>
                        <p className={`text-center max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          Submit your assignment or ask a question to get started!
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          key={message.no}
                        >
                        {renderAIResponse(message)}
                    </motion.div>
                      ))
                    )}
                </ErrorBoundary>

                  {/* Progress Bar */}
                  {logProgressActive && (
                    <div className={`w-full rounded-full h-2 overflow-hidden mt-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                          <motion.div
                        className={`h-2 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-blue-600'
                          }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${logProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                      </div>
                  )}

                  {/* Error Message */}
                  {chatError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 rounded-lg border mt-4 ${darkMode
                          ? 'bg-red-900/30 border-red-800 text-red-300'
                          : 'bg-red-50 border-red-200 text-red-600'
                        }`}
                    >
                      <div className="flex items-center space-x-2">
                        <MdError className="w-5 h-5 flex-shrink-0" />
                        <span>{chatError}</span>
                    </div>
                  </motion.div>
                )}
              </div>

                {/* Scroll to Bottom Button */}
                {showScrollButton && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={scrollToBottom}
                    className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg z-10 transition-colors ${darkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    <FaArrowDown className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right column (Solution Section) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Current Assignment Card */}
            <div className={`rounded-xl p-6 shadow-lg border
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Current Assignment
              </h2>
              
              <div className="space-y-4">

                {selectedAssignment && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedAssignment.title}
                  </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedAssignment.description}
                  </p>
                </div>

                    <div>
                      <button
                        onClick={() => toggleCheckpoints(selectedAssignment.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg ${
                          darkMode ? 'bg-gray-700/30 text-white' : 'bg-gray-50 text-gray-900'
                        } transition-colors duration-200`}
                      >
                        <div className="flex items-center space-x-2">
                          <FaCheck className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                          <span className="font-medium">Checkpoints</span>
                        </div>
                        <FaChevronDown
                          className={`transform transition-transform duration-200 ${
                            expandedCheckpoints[selectedAssignment.id] ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {expandedCheckpoints[selectedAssignment.id] && (
                        <div className="mt-3 space-y-3">
                          {selectedAssignment.checkpoints.map((checkpoint) => (
                            <div
                              key={checkpoint.id}
                              className={`p-3 rounded-lg ${
                                darkMode 
                                  ? 'bg-gray-700/30 border border-gray-600/30' 
                                  : 'bg-gray-50 border border-gray-200'
                              } overflow-hidden`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-1 rounded-full ${
                                  darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                                } flex-shrink-0`}>
                                  <FaCode className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                                    {convertToTitleCase(checkpoint.title)}
                                  </h4>
                                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'} break-words`}>
                                    {checkpoint.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GitHub Repo Structure Card */}
            <div className={`rounded-xl p-6 shadow-lg border
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Your Solution
              </h2>
              <div className="space-y-4">
                {selectedRepo ? (
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} break-words`}>
                      {selectedRepo}
                      {repoStructure && (
                        <>
                          <br /><br />
                          <pre className="whitespace-pre font-mono">
                            {repoStructure}
                          </pre>
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Select a GitHub repository to submit
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSolutionSubmit}
                  disabled={!selectedRepo.trim() || submitting || !isConnected}
                  className={`w-full py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 ${submitting || !isConnected || !selectedRepo.trim()
                      ? darkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } shadow-md`}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin h-5 w-5" />
                      <span>Submitting...</span>
                    </>
                  ) : !isConnected ? (
                    <>
                      <MdError className="h-5 w-5" />
                      <span>Not Connected</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="h-5 w-5" />
                      <span>Submit Solution</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AIAssignment;
