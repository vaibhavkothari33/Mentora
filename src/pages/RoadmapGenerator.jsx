import { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
  MiniMap
} from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaSpinner, FaDownload, FaExpand, FaLightbulb, FaSave, FaShareAlt, FaHistory } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { generateRoadmapWithGemini } from '../config/gemini';
import StepNode from '../components/nodes/StepNode';
import AnimatedEdge from '../components/edges/AnimatedEdge';
import ProgressIndicator from '../components/roadmap/ProgressIndicator';
import 'reactflow/dist/style.css';
import '../styles/roadmap.css';

const nodeTypes = {
  stepNode: StepNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

const RoadmapGenerator = () => {
  const { theme, toggleTheme } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState('flow'); // 'flow', 'list', or 'card'
  const flowRef = useRef(null);
  const promptInputRef = useRef(null);

  // Enhanced categories with emojis and tags
  const categories = [
    { name: "Blockchain Development", emoji: "🔗", tags: ["web3", "crypto"] },
    { name: "Smart Contract Security", emoji: "🔒", tags: ["security", "audit"] },
    { name: "DeFi Protocols", emoji: "💱", tags: ["finance", "crypto"] },
    { name: "Web3 Frontend", emoji: "🖥", tags: ["UI", "dApps"] },
    { name: "Solidity Programming", emoji: "📝", tags: ["code", "ethereum"] },
    { name: "Crypto Trading", emoji: "📈", tags: ["markets", "analysis"] },
    { name: "NFT Development", emoji: "🎨", tags: ["art", "collectibles"] },
    { name: "DAO Governance", emoji: "🏛", tags: ["community", "voting"] },
    { name: "Zero Knowledge Proofs", emoji: "🔍", tags: ["privacy", "scaling"] },
    { name: "Cross-chain Development", emoji: "⛓", tags: ["interoperability"] }
  ];

  // Writing prompts to guide users
  const promptSuggestions = [
    "I want to learn blockchain development starting from zero coding knowledge",
    "Create a roadmap for becoming a smart contract auditor in 6 months",
    "How to build a DeFi application with focus on security best practices",
    "What's the best path to learn NFT development for a web developer?"
  ];

  const sampleRoadmap = {
    title: "Sample Roadmap",
    description: "This is a sample roadmap while the API is being configured.",
    stages: [
      {
        title: "Getting Started",
        status: "required",
        steps: [
          {
            title: "Introduction",
            description: "Basic concepts and setup",
            duration: "1-2 hours",
            type: "concept",
            topics: ["Overview", "Setup"],
            resources: [
              {
                name: "Getting Started Guide",
                url: "https://example.com/guide",
                type: "concept"
              }
            ]
          }
        ]
      }
    ]
  };

  const createNodesAndEdges = (roadmap) => {
    const newNodes = [];
    const newEdges = [];
    const levelSpacing = 250; // Increased spacing
    const nodeSpacing = 350; // Increased spacing

    // Calculate total steps
    const totalStepsCount = roadmap.stages.reduce((total, stage) => total + stage.steps.length, 0);
    setTotalSteps(totalStepsCount);
    setCurrentStep(0);

    // Custom layout algorithms
    let currentX = 50;
    let stageY = 50;

    roadmap.stages.forEach((stage, stageIndex) => {
      // Add stage header node
      const stageHeaderId = `stage-${stageIndex}`;
      newNodes.push({
        id: stageHeaderId,
        type: 'stepNode',
        position: { x: 0, y: stageY },
        data: {
          title: stage.title,
          isStageHeader: true,
          status: stage.status,
          stageIndex
        },
        style: { width: 250 }
      });

      // Reset X position for each stage
      currentX = 300;

      const stageNodes = stage.steps.map((step, stepIndex) => {
        const node = {
          id: `node-${stageIndex}-${stepIndex}`,
          type: 'stepNode',
          position: {
            x: currentX + stepIndex * nodeSpacing,
            y: stageY + 20,
          },
          data: {
            ...step,
            status: stage.status,
            stageIndex,
            stepIndex
          },
          style: {
            width: 280,
            height: 'auto'
          }
        };

        return node;
      });

      newNodes.push(...stageNodes);

      // Connect stage header to first step
      if (stageNodes.length > 0) {
        newEdges.push({
          id: `edge-header-${stageIndex}`,
          source: stageHeaderId,
          target: stageNodes[0].id,
          type: 'animated',
          animated: true,
          style: { stroke: theme.darkMode ? '#6366f1' : '#4f46e5' }
        });
      }

      // Create edges between nodes in the same stage
      for (let i = 0; i < stageNodes.length - 1; i++) {
        newEdges.push({
          id: `edge-${stageIndex}-${i}`,
          source: stageNodes[i].id,
          target: stageNodes[i + 1].id,
          type: 'animated',
          animated: true,
          style: { stroke: theme.darkMode ? '#6366f1' : '#4f46e5' }
        });
      }

      // Create edge to next stage header
      if (stageIndex < roadmap.stages.length - 1) {
        const lastNodeInStage = stageNodes[stageNodes.length - 1];
        if (lastNodeInStage) {
          newEdges.push({
            id: `edge-stage-${stageIndex}-next`,
            source: lastNodeInStage.id,
            target: `stage-${stageIndex + 1}`,
            type: 'animated',
            animated: true,
            style: { stroke: theme.darkMode ? '#6366f1' : '#4f46e5' }
          });
        }
      }

      // Update Y position for next stage
      stageY += levelSpacing;
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const generateRoadmap = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured. Please check your environment variables.');
      }
      const generatedRoadmap = await generateRoadmapWithGemini(prompt);

      // Validate the roadmap structure
      if (!generatedRoadmap.title || !generatedRoadmap.stages || !Array.isArray(generatedRoadmap.stages)) {
        throw new Error('Invalid roadmap format received. Please try again.');
      }

      createNodesAndEdges(generatedRoadmap);
      setRoadmap(generatedRoadmap);

      // Save to history
      saveToHistory(generatedRoadmap);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      setError(error.message || 'Failed to generate roadmap. Please try again.');

      if (error.message.includes('JSON')) {
        setError('Failed to generate a valid roadmap format. Please try again with a different prompt.');
      } else if (error.message.includes('API key')) {
        setError('API key configuration error. Please contact the administrator.');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (roadmap) => {
    const timestamp = new Date().toISOString();
    const newHistory = [
      {
        id: timestamp,
        title: roadmap.title,
        prompt,
        timestamp,
        roadmap
      },
      ...savedRoadmaps.slice(0, 9) // Keep only the last 10 roadmaps
    ];
    setSavedRoadmaps(newHistory);
    localStorage.setItem('roadmapHistory', JSON.stringify(newHistory));
  };

  const loadFromHistory = (historyItem) => {
    setPrompt(historyItem.prompt);
    setRoadmap(historyItem.roadmap);
    createNodesAndEdges(historyItem.roadmap);
    setShowHistory(false);
  };

  const onDownloadImage = useCallback(() => {
    if (flowRef.current) {
      const dataUrl = flowRef.current.toImage();
      const link = document.createElement('a');
      link.download = `${roadmap?.title || 'roadmap'}.png`;
      link.href = dataUrl;
      link.click();
    }
  }, [roadmap]);

  const onShareRoadmap = useCallback(() => {
    // Create shareable link functionality here
    const shareData = {
      title: roadmap?.title || 'Learning Roadmap',
      text: `Check out my learning roadmap: ${roadmap?.title}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      navigator.share(shareData);
    } else {
      // Fallback - copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }, [roadmap]);

  const onNodeClick = useCallback((event, node) => {
    // Skip if clicking on stage header
    if (node.data.isStageHeader) return;

    const nodeIndex = parseInt(node.id.split('-')[2]);
    const stageIndex = parseInt(node.id.split('-')[1]);
    const stepNumber = roadmap.stages.slice(0, stageIndex).reduce(
      (total, stage) => total + stage.steps.length,
      0
    ) + nodeIndex;
    setCurrentStep(stepNumber);
  }, [roadmap]);

  // Load saved roadmaps from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('roadmapHistory');
      if (saved) {
        setSavedRoadmaps(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error loading saved roadmaps:', err);
    }
  }, []);

  // Add a development mode warning if API key is missing
  useEffect(() => {
    if (import.meta.env.DEV && !import.meta.env.VITE_GEMINI_API_KEY) {
      console.warn('Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env.local file');
    }
  }, []);

  // Focus the prompt input on component mount
  useEffect(() => {
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter to generate
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (prompt && !loading) {
          generateRoadmap();
        }
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prompt, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#0f1629] to-black text-gray-100">
      {/* Enhanced Hero Section */}
      <div className="relative w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 backdrop-blur-xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4 flex items-center">
                <FaRobot className="mr-4 text-blue-400 text-4xl" />
                Learning Path AI
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                Create your personalized learning roadmap powered by advanced AI technology
              </p>
            </div>
            <div className="flex items-center gap-4">
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Input Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-8 border border-gray-700/50"
        >
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <label className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300">
                What would you like to learn?
              </label>
              <button
                onClick={() => setShowTips(!showTips)}
                className="px-4 py-2 rounded-lg text-blue-400 hover:bg-blue-500/10 flex items-center text-sm transition-all duration-300"
              >
                <FaLightbulb className="mr-2" />
                {showTips ? 'Hide Tips' : 'Show Tips'}
              </button>
            </div>

            <AnimatePresence>
              {showTips && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-6 rounded-xl bg-indigo-950/50 border border-indigo-800/50 text-sm backdrop-blur-sm"
                >
                  <h4 className="font-semibold mb-3 text-lg text-indigo-300">Tips for better roadmaps:</h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300 marker:text-indigo-400">
                    <li>Be specific about your current skill level</li>
                    <li>Mention your learning goals and timeframe</li>
                    <li>Include any specific technologies or frameworks</li>
                    <li>Specify if you prefer practical or theoretical learning</li>
                  </ul>
                  <div className="mt-4">
                    <p className="font-medium mb-2 text-indigo-300">Try these examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {promptSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPrompt(suggestion)}
                          className="px-4 py-2 text-sm rounded-lg bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-200 transition-all duration-300 border border-indigo-700/50"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <textarea
              ref={promptInputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-6 py-4 rounded-xl border border-gray-700/50 bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-lg text-gray-200 placeholder-gray-500 shadow-inner"
              rows="4"
              placeholder="Describe what you want to learn..."
            />
            <p className="text-sm mt-2 text-gray-400 flex items-center">
              <span className="inline-block mr-2 px-2 py-1 rounded-md bg-gray-800/80 border border-gray-700/50">
                Ctrl + Enter
              </span>
              to generate
            </p>
          </div>

          {/* Enhanced Quick Categories */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-300 mb-4">Quick Categories:</label>
            <div className="flex flex-wrap gap-3">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(category.name)}
                  className="group px-5 py-3 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 transition-all duration-300 flex items-center gap-2 border border-gray-700/50 hover:border-gray-600/50 hover:shadow-lg"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">{category.emoji}</span>
                  <span className="text-gray-200 font-medium">{category.name}</span>
                  {category.tags.length > 0 && (
                    <span className="px-2 py-1 rounded-lg text-xs bg-gray-700/80 text-gray-300 group-hover:bg-gray-600/80 transition-colors duration-300">
                      {category.tags[0]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateRoadmap}
              disabled={!prompt || loading}
              className="flex-grow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center text-lg font-medium"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-3 text-xl" />
                  Generating Roadmap...
                </>
              ) : (
                <>
                  <FaRobot className="mr-3 text-xl" />
                  Generate Roadmap
                </>
              )}
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-6 py-4 rounded-xl border border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 flex items-center justify-center text-gray-300 hover:text-white hover:shadow-lg text-lg font-medium"
            >
              <FaHistory className="mr-3" />
              History
            </button>
          </div>

          {/* Enhanced History Dropdown */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-6 rounded-xl border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
              >
                <h4 className="font-semibold mb-4 text-xl text-gray-200">Previous Roadmaps</h4>
                {savedRoadmaps.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No saved roadmaps yet</p>
                ) : (
                  <ul className="space-y-3">
                    {savedRoadmaps.map((item) => (
                      <li
                        key={item.id}
                        className="p-4 rounded-xl cursor-pointer hover:bg-gray-700/50 transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50"
                        onClick={() => loadFromHistory(item)}
                      >
                        <div className="font-medium text-lg text-gray-200 mb-1">{item.title}</div>
                        <div className="text-sm text-gray-400 flex justify-between items-center">
                          <span className="truncate max-w-sm">{item.prompt}</span>
                          <span className="px-3 py-1 rounded-lg bg-gray-800/80 text-gray-300 text-xs">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-red-500/50"
          >
            <p className="text-red-400 flex items-center text-lg">
              <span className="mr-3 text-2xl">⚠</span>
              {error}
            </p>
          </motion.div>
        )}

        {/* Enhanced View Controls */}
        {nodes.length > 0 && (
          <div className="mb-6 flex justify-between items-center backdrop-blur-sm bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
            <div className="flex gap-3">
              {['flow', 'list', 'card'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-6 py-3 rounded-xl text-sm transition-all duration-300 ${viewMode === mode
                      ? 'bg-indigo-900/80 text-indigo-200 font-medium shadow-lg border border-indigo-700/50'
                      : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 border border-gray-700/50'
                    }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)} View
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onDownloadImage}
                className="px-6 py-3 rounded-xl text-blue-400 hover:bg-blue-500/10 flex items-center text-sm transition-all duration-300 border border-gray-700/50"
                title="Download as image"
              >
                <FaDownload className="mr-2" />
                Export
              </button>
              <button
                onClick={onShareRoadmap}
                className="px-6 py-3 rounded-xl text-blue-400 hover:bg-blue-500/10 flex items-center text-sm transition-all duration-300 border border-gray-700/50"
                title="Share roadmap"
              >
                <FaShareAlt className="mr-2" />
                Share
              </button>
            </div>
          </div>
        )}

        {/* Flow Canvas with enhanced styling */}
        {nodes.length > 0 && viewMode === 'flow' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[800px] mb-10"
          >
            <ReactFlowProvider>
              <ReactFlow
                ref={flowRef}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                minZoom={0.2}
                maxZoom={1.5}
                defaultZoom={0.8}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50"
              >
                <Background
                  color="#374151"
                  gap={32}
                  size={1}
                  variant="dots"
                />
                <Controls
                  className="bg-gray-800/90 border border-gray-700 rounded-xl shadow-lg"
                  position="bottom-right"
                  showInteractive={false}
                />
                <MiniMap
                  nodeColor={(n) => {
                    if (n.data?.status === 'required') return '#4f46e5';
                    if (n.data?.status === 'recommended') return '#0891b2';
                    return '#64748b';
                  }}
                  maskColor="rgba(0, 0, 0, 0.3)"
                  className="border border-gray-700 rounded-xl shadow-lg bg-gray-900/90"
                />
                <Panel position="top-right" className="space-x-3">
                  <button
                    onClick={onDownloadImage}
                    className="p-3 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-all duration-300 border border-gray-700/50"
                    title="Download as image"
                  >
                    <FaDownload />
                  </button>
                  <button
                    onClick={() => flowRef.current?.fitView()}
                    className="p-3 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-all duration-300 border border-gray-700/50"
                    title="Fit view"
                  >
                    <FaExpand />
                  </button>
                </Panel>
              </ReactFlow>
            </ReactFlowProvider>

            {roadmap && (
              <ProgressIndicator
                currentStep={currentStep}
                totalSteps={totalSteps}
                stages={roadmap.stages}
              />
            )}
          </motion.div>
        )}

        {/* List View */}
        {nodes.length > 0 && viewMode === 'list' && roadmap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${theme.card} rounded-xl shadow-lg p-6 mb-8`}
          >
            <h2 className="text-2xl font-bold mb-6">{roadmap.title}</h2>
            <p className="mb-8">{roadmap.description}</p>

            <div className="space-y-8">
              {roadmap.stages.map((stage, stageIndex) => (
                <div key={stageIndex} className="space-y-4">
                  <h3 className={`text-xl font-bold pb-2 border-b ${theme.border}`}>
                    {stageIndex + 1}. {stage.title}
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${stage.status === 'required'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                      {stage.status}
                    </span>
                  </h3>

                  <div className="pl-4 border-l-2 border-indigo-500 space-y-4">
                    {stage.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className={`p-4 rounded-lg ${theme.darkMode ? 'bg-gray-800' : 'bg-slate-600'}`}>
                        <h4 className="font-bold ">{stageIndex + 1}.{stepIndex + 1} {step.title}</h4>
                        <p className="text-sm mt-1">{step.description}</p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {step.topics && step.topics.map((topic, i) => (
                            <span key={i} className={`px-2 py-1 text-xs rounded-full ${theme.darkMode ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"}`}>
                              {topic}
                            </span>
                          ))}
                        </div>

                        {step.duration && (
                          <div className="mt-2 text-xs flex items-center">
                            <span className="mr-1">⏱</span>
                            <span>{step.duration}</span>
                          </div>
                        )}

                        {step.resources && step.resources.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium">Resources:</h5>
                            <ul className="mt-1 space-y-1">
                              {step.resources.map((resource, i) => (
                                <li key={i} className="text-sm flex items-center">
                                  <span className="mr-1">📚</span>
                                  {resource.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Card View */}
        {nodes.length > 0 && viewMode === 'card' && roadmap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className={`${theme.card} rounded-xl shadow-lg p-6 mb-8`}>
              <h2 className="text-2xl font-bold">{roadmap.title}</h2>
              <p className="mt-2">{roadmap.description}</p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm">Total stages: {roadmap.stages.length}</span>
                  <span className="mx-2">•</span>
                  <span className="text-sm">Total steps: {totalSteps}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={onDownloadImage}
                    className={`p-2 text-sm rounded-lg ${theme.darkMode ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'} hover:${theme.hover.background} flex items-center`}
                  >
                    <FaSave className="mr-1" />
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Grid layout for cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmap.stages.flatMap((stage, stageIndex) =>
                stage.steps.map((step, stepIndex) => (
                  <motion.div
                    key={`${stageIndex}-${stepIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: (stageIndex * stage.steps.length + stepIndex) * 0.05 }
                    }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    className={`${theme.card} rounded-xl shadow-md p-5 border-l-4 ${stage.status === 'required'
                        ? 'border-indigo-500'
                        : 'border-blue-500'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${theme.darkMode ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'}`}>
                        Stage {stageIndex + 1}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${step.type === 'concept'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                        {step.type || 'practice'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm mb-4">{step.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {step.topics && step.topics.map((topic, i) => (
                        <span key={i} className={`px-2 py-1 text-xs rounded-full ${theme.darkMode ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'}`}>
                          {topic}
                        </span>
                      ))}
                    </div>

                    {step.duration && (
                      <div className="flex items-center text-xs mb-3">
                        <span className="mr-1">⏱</span>
                        <span>{step.duration}</span>
                      </div>
                    )}

                    {step.resources && step.resources.length > 0 && (
                      <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
                        <h5 className="text-xs font-medium mb-1">Resources:</h5>
                        <ul className="space-y-1">
                          {step.resources.slice(0, 2).map((resource, i) => (
                            <li key={i} className="text-xs flex items-center">
                              <span className="mr-1">📚</span>
                              {resource.name}
                            </li>
                          ))}
                          {step.resources.length > 2 && (
                            <li className="text-xs text-indigo-500">+{step.resources.length - 2} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoadmapGenerator;