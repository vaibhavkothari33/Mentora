import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { FaGraduationCap, FaCertificate, FaChartLine, FaTrophy, FaClock, FaStar, FaPlay, FaCheck, FaLock, FaExpand, FaPause, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import ipfsService from '../utils/ipfsStorage';
import { Code, BarChart } from 'lucide-react';
import Aurora from './Aurora';

const VideoPlayer = ({ videoUrl, title }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  // Convert IPFS URL to HTTP URL if needed
  const getVideoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('ipfs://')) {
      const cid = url.replace('ipfs://', '');
      return `https://${cid}.ipfs.w3s.link`;
    }
    return url;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadMetadata);
      video.addEventListener('error', handleVideoError);
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadMetadata);
        video.removeEventListener('error', handleVideoError);
      };
    }
  }, []);

  const handleVideoError = (e) => {
    console.error('Video error:', e);
    setError('Error loading video. Please try again later.');
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

  const handleLoadMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
    if (videoRef.current) {
      videoRef.current.currentTime = clickPosition * videoRef.current.duration;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    const videoContainer = videoRef.current.parentElement;
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative group">
      <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={getVideoUrl(videoUrl)}
          className="w-full h-full object-contain"
          playsInline
        />
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center p-4">
              <p className="text-red-500 mb-2">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
                className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            {/* Progress Bar */}
            <div 
              className="w-full h-1 bg-gray-600 rounded cursor-pointer"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-blue-500 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={togglePlay}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>

                <button 
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>

                <div className="w-24 flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div className="text-sm">
                  {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                </div>
              </div>

              <button 
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <FaExpand />
              </button>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold mt-4">{title}</h3>
    </div>
  );
};

const CourseContent = ({ course, onClose, onUpdateProgress }) => {
  const { theme } = useTheme();
  const [activeVideo, setActiveVideo] = useState(null);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [activeTab, setActiveTab] = useState('content'); // ['content', 'overview', 'resources']

  // Enhanced course content structure
  const topics = [
    {
      id: 1,
      title: "Introduction to Blockchain",
      duration: "15:30",
      videoUrl: "https://bafybeici6bd5egsbfcpwb3pnwznfpaunr2cs3tugshlkvgwhycckuvs2wa.ipfs.w3s.link/What%20is%20Blockchain.mp4",
      description: "Learn the fundamental concepts of blockchain technology and its applications.",
      objectives: [
        "Understand blockchain basics",
        "Learn about distributed ledgers",
        "Explore blockchain use cases"
      ],
      resources: [
        { type: 'pdf', name: 'Blockchain Basics Guide', url: 'https://bafybeihubwvljhf4nsfqeape7d62ka27d5hpajpjj2wnloazpsi67rsdeu.ipfs.w3s.link/Smart%20Contract.mp4' },
        { type: 'link', name: 'Additional Reading', url: '#' }
      ],
      isLocked: false
    },
    {
      id: 2,
      title: "Cryptography Basics",
      duration: "20:45",
      videoUrl: "https://bafybeihubwvljhf4nsfqeape7d62ka27d5hpajpjj2wnloazpsi67rsdeu.ipfs.w3s.link/Smart%20Contract.mp4",
      isLocked: course.progress < 25
    },
    {
      id: 3,
      title: "Consensus Mechanisms",
      duration: "18:20",
      videoUrl: "https://bafybeih2s6sohmlaoeji6v46ulacoxd57qpxl2plrrba4frog3wl2sufgi.ipfs.w3s.link/DeFi.mp4",
      isLocked: course.progress < 50
    },
    {
      id: 4,
      title: "Smart Contracts",
      duration: "25:15",
      videoUrl: "https://bafybeih2s6sohmlaoeji6v46ulacoxd57qpxl2plrrba4frog3wl2sufgi.ipfs.w3s.link/DeFi.mp4",
      isLocked: course.progress < 75
    }
  ];

  const handleTopicComplete = (topicId) => {
    setCompletedTopics(prev => new Set([...prev, topicId]));
    const progress = Math.round((completedTopics.size + 1) / topics.length * 100);
    onUpdateProgress(course.id, progress);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className={`${theme.card} rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Course Header */}
        <div className={`p-6 border-b ${theme.border}`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{course.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <FaClock className={`mr-2 ${theme.text.secondary}`} />
                  <span className={theme.text.secondary}>4 Topics • 2 Hours Total</span>
                </div>
                <div className="flex items-center">
                  <FaGraduationCap className={`mr-2 ${theme.text.secondary}`} />
                  <span className={theme.text.secondary}>{course.progress}% Complete</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  course.progress === 100 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {course.progress === 100 ? 'Completed' : 'In Progress'}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-4 mt-6">
            {['Content', 'Overview', 'Resources'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.toLowerCase()
                    ? `bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`
                    : `hover:bg-gray-100 dark:hover:bg-gray-700 ${theme.text.secondary}`
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(90vh-180px)]">
          {/* Main Content Area */}
          <div className={`${theme.background} p-6 lg:col-span-2 overflow-y-auto`}>
            {activeTab === 'content' && (
              <>
                {activeVideo ? (
                  <div className="space-y-6">
                    <VideoPlayer 
                      videoUrl={activeVideo.videoUrl} 
                      title={activeVideo.title}
                    />
                    <div className={`p-6 rounded-xl border ${theme.border}`}>
                      <h3 className="text-xl font-semibold mb-4">{activeVideo.title}</h3>
                      <p className={`mb-4 ${theme.text.secondary}`}>{activeVideo.description}</p>
                      
                      <h4 className="font-semibold mb-2">Learning Objectives:</h4>
                      <ul className="space-y-2 mb-6">
                        {activeVideo.objectives?.map((objective, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleTopicComplete(activeVideo.id)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                          completedTopics.has(activeVideo.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg'
                        }`}
                      >
                        {completedTopics.has(activeVideo.id) ? (
                          <span className="flex items-center gap-2">
                            <FaCheck /> Completed
                          </span>
                        ) : (
                          'Mark as Complete'
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className={`p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4`}>
                      <FaPlay className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Ready to Start Learning?</h3>
                    <p className={`${theme.text.secondary} max-w-md`}>
                      Select a topic from the curriculum to begin your learning journey.
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className={`p-6 rounded-xl border ${theme.border}`}>
                  <h3 className="text-xl font-semibold mb-4">Course Overview</h3>
                  <p className={`mb-6 ${theme.text.secondary}`}>
                    This comprehensive course covers the fundamentals of blockchain technology,
                    from basic concepts to advanced implementations. You'll learn through
                    practical examples and hands-on exercises.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800`}>
                      <h4 className="font-semibold mb-2">Prerequisites</h4>
                      <ul className={`space-y-2 ${theme.text.secondary}`}>
                        <li>Basic programming knowledge</li>
                        <li>Understanding of cryptography</li>
                        <li>Familiarity with web technologies</li>
                      </ul>
                    </div>
                    
                    <div className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800`}>
                      <h4 className="font-semibold mb-2">What You'll Learn</h4>
                      <ul className={`space-y-2 ${theme.text.secondary}`}>
                        <li>Blockchain fundamentals</li>
                        <li>Smart contract development</li>
                        <li>DApp architecture</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className={`p-6 rounded-xl border ${theme.border}`}>
                  <h3 className="text-xl font-semibold mb-4">Course Timeline</h3>
                  <div className="space-y-4">
                    {topics.map((topic, index) => (
                      <div key={topic.id} className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          completedTopics.has(topic.id)
                            ? 'bg-green-100 text-green-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{topic.title}</h4>
                          <p className={`text-sm ${theme.text.secondary}`}>{topic.duration}</p>
                        </div>
                        {completedTopics.has(topic.id) && (
                          <FaCheck className="text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-6">
                <div className={`p-6 rounded-xl border ${theme.border}`}>
                  <h3 className="text-xl font-semibold mb-4">Course Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {topics.map(topic => (
                      <div key={topic.id} className={`p-4 rounded-lg border ${theme.border}`}>
                        <h4 className="font-medium mb-3">{topic.title}</h4>
                        <ul className="space-y-2">
                          {topic.resources?.map((resource, index) => (
                            <li key={index}>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                  theme.text.secondary
                                }`}
                              >
                                {resource.type === 'pdf' ? (
                                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                )}
                                {resource.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Topics List */}
          <div className={`${theme.card} border-l ${theme.border} overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Course Curriculum</h3>
                <span className={`text-sm ${theme.text.secondary}`}>
                  {completedTopics.size}/{topics.length} Completed
                </span>
              </div>
              
              <div className="space-y-2">
                {topics.map((topic) => (
                  <motion.div
                    key={topic.id}
                    whileHover={{ x: 4 }}
                    className={`p-4 rounded-xl cursor-pointer transition-colors ${
                      activeVideo?.id === topic.id
                        ? 'bg-blue-50 dark:bg-gray-700/50 border border-blue-200 dark:border-blue-500/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => !topic.isLocked && setActiveVideo(topic)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          completedTopics.has(topic.id)
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : topic.isLocked
                              ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                              : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {completedTopics.has(topic.id) ? (
                            <FaCheck className="w-4 h-4" />
                          ) : topic.isLocked ? (
                            <FaLock className="w-4 h-4" />
                          ) : (
                            <FaPlay className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium truncate ${
                            topic.isLocked ? 'text-gray-400' : ''
                          }`}>
                            {topic.title}
                          </h4>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm pl-11">
                      <span className={theme.text.secondary}>{topic.duration}</span>
                      {topic.isLocked && (
                        <span className="text-sm text-gray-400">
                          Unlocks at {topic.id * 25}%
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Dashboard = ({ eduChain, certificateNFT, account }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([
    {
      id: 1,
      title: "Blockchain Fundamentals",
      progress: 55,
      hasCompleted: false
    },
    {
      id: 2,
      title: "Smart Contract Development",
      progress: 100,
      hasCompleted: true
    },
    {
      id: 3,
      title: "DeFi Protocols & Applications",
      progress: 30,
      hasCompleted: false
    },
    {
      id: 4,
      title: "Web3 Development with React",
      progress: 60,
      hasCompleted: false
    }
  ]);

  const [certificates, setCertificates] = useState([
    {
      tokenId: "NFT-001",
      courseId: "CERT-BF-101",
      studentName: "Vaibhav Kothari",
      completionDate: "2025-04-05",
      score: "95"
    },
    {
      tokenId: "NFT-002",
      courseId: "CERT-SC-201",
      studentName: "Vaibhav Kothari",
      completionDate: "2025-04-05",
      score: "88"
    }
  ]);

  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const [activeCourse, setActiveCourse] = useState(null);

  // Add new state for user profile data
  const [userData] = useState({
    name: "Vaibhav Kothari",
    email: "vaibhavkothari50@gmail.com",
    profileImage: "https://media.licdn.com/dms/image/v2/D5603AQHeVQkIycTb2Q/profile-displayphoto-shrink_400_400/B56ZWkr_TqHoAg-/0/1742224750690?e=1749081600&v=beta&t=wqS-4KI6dTgBG7loYFEDg25pOWFS4oHLYxA8nFLForQ",
    problemStats: {
      totalSolved: 150,
      streak: 7,
      easy: 80,
      medium: 50,
      hard: 20
    },
    activityData: {
      lastWeekSessions: 5,
      averageSessionTime: 45,
      completionRate: 85
    }
  });

  const updateProgress = async (courseId, newProgress) => {
    setEnrolledCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, progress: Math.min(newProgress, 100) } 
        : course
    ));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const handleContinueLearning = (course) => {
    setActiveCourse(course);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text.primary} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-current border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text.primary}`}>
      {/* Hero Section with Profile Overview */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-black">
        <Aurora 
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={3.0}
          speed={0.5}
        />
        <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between"
          >
            {/* Profile Info */}
            <div className="text-center md:text-left mb-8 md:mb-0">
              <div className="flex items-center gap-6">
                <img 
                  src="https://media.licdn.com/dms/image/v2/D5603AQHeVQkIycTb2Q/profile-displayphoto-shrink_400_400/B56ZWkr_TqHoAg-/0/1742224750690?e=1749081600&v=beta&t=wqS-4KI6dTgBG7loYFEDg25pOWFS4oHLYxA8nFLForQ"
                  alt={userData.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                />
                <div>
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                    Welcome back, {userData.name}
                  </h1>
                  <p className="text-gray-300">{userData.email}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{userData.problemStats.totalSolved}</div>
                <div className="text-sm text-gray-400">Problems Solved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{userData.problemStats.streak}</div>
                <div className="text-sm text-gray-400">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{userData.activityData.completionRate}%</div>
                <div className="text-sm text-gray-400">Completion Rate</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Performance Stats Grid */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Problem Solving Stats */}
          <motion.div
            variants={itemVariants}
            className={`${theme.card} rounded-xl shadow-xl p-6 border ${theme.border}`}
          >
            <div className="flex items-center mb-4">
              <Code className="w-5 h-5 mr-2 text-blue-400" />
              <h2 className="text-lg font-semibold">Problem Solving Stats</h2>
            </div>
            
            <div className="space-y-4">
              {/* Easy Problems */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Easy ({userData.problemStats.easy})</span>
                  <span className="text-sm text-green-400">{Math.round(userData.problemStats.easy / userData.problemStats.totalSolved * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(userData.problemStats.easy / userData.problemStats.totalSolved) * 100}%` }}
                  />
                </div>
              </div>

              {/* Medium Problems */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Medium ({userData.problemStats.medium})</span>
                  <span className="text-sm text-yellow-400">{Math.round(userData.problemStats.medium / userData.problemStats.totalSolved * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(userData.problemStats.medium / userData.problemStats.totalSolved) * 100}%` }}
                  />
                </div>
              </div>

              {/* Hard Problems */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Hard ({userData.problemStats.hard})</span>
                  <span className="text-sm text-red-400">{Math.round(userData.problemStats.hard / userData.problemStats.totalSolved * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(userData.problemStats.hard / userData.problemStats.totalSolved) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Activity Summary */}
          <motion.div
            variants={itemVariants}
            className={`${theme.card} rounded-xl shadow-xl p-6 border ${theme.border}`}
          >
            <div className="flex items-center mb-4">
              <BarChart className="w-5 h-5 mr-2 text-blue-400" />
              <h2 className="text-lg font-semibold">Activity Summary</h2>
            </div>

            <div className="space-y-6">
              {/* Weekly Sessions */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Weekly Sessions</span>
                  <span className="text-sm font-medium">{userData.activityData.lastWeekSessions}/7 days</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i}
                      className={`h-8 rounded ${
                        i < userData.activityData.lastWeekSessions 
                          ? 'bg-blue-400 dark:bg-blue-500' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Average Session Time */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Average Session Time</span>
                  <span className="text-sm font-medium">{userData.activityData.averageSessionTime} min</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(userData.activityData.averageSessionTime / 60 * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Task Completion Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Task Completion Rate</span>
                  <span className="text-sm font-medium">{userData.activityData.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${userData.activityData.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hero Stats Section */}
        <div className="relative overflow-hidden">
          <div className={`absolute inset-0 ${theme.background} opacity-90`}></div>
          <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Stats Cards */}
              {[
                {
                  icon: <FaGraduationCap className="text-3xl" />,
                  title: "Enrolled Courses",
                  value: enrolledCourses.length,
                  color: "from-blue-500 to-blue-600"
                },
                {
                  icon: <FaCertificate className="text-3xl" />,
                  title: "Certificates Earned",
                  value: certificates.length,
                  color: "from-emerald-500 to-emerald-600"
                },
                {
                  icon: <FaChartLine className="text-3xl" />,
                  title: "Average Progress",
                  value: `${Math.round(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length)}%`,
                  color: "from-violet-500 to-violet-600"
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`${theme.card} rounded-2xl shadow-xl p-6 border ${theme.border} relative overflow-hidden group`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className={`text-sm ${theme.text.secondary}`}>{stat.title}</p>
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Enrolled Courses Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <FaGraduationCap className={`text-3xl mr-3 ${theme.text.accent}`} />
              <h2 className="text-3xl font-bold">My Learning Journey</h2>
            </div>
            <select className={`${theme.card} border ${theme.border} rounded-lg px-4 py-2`}>
              <option>All Courses</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                className={`${theme.card} rounded-xl shadow-xl p-6 border ${theme.border} group hover:shadow-2xl transition-all duration-300`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold flex-1">{course.title}</h3>
                  {course.progress === 100 && (
                    <FaTrophy className="text-yellow-500 text-xl" />
                  )}
                </div>

                <div className="mb-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className={theme.text.secondary}>Progress</span>
                    <span className={`font-medium ${course.progress === 100 ? 'text-green-500' : theme.text.accent}`}>
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full bg-gradient-to-r ${
                        course.progress === 100
                          ? 'from-green-400 to-green-500'
                          : 'from-blue-400 to-blue-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-6">
                  <div className="flex items-center">
                    <FaClock className={`mr-2 ${theme.text.secondary}`} />
                    <span className={theme.text.secondary}>Est. 6 weeks</span>
                  </div>
                  <div className="flex items-center">
                    <FaStar className="text-yellow-500 mr-1" />
                    <span className={theme.text.secondary}>4.8/5</span>
                  </div>
                </div>

                <button
                  onClick={() => handleContinueLearning(course)}
                  disabled={course.progress === 100}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                    course.progress === 100
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:scale-[1.02]'
                  }`}
                >
                  {course.progress === 100 ? 'Completed' : 'Continue Learning'}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Certificates Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center mb-8">
            <FaCertificate className={`text-3xl mr-3 ${theme.text.accent}`} />
            <h2 className="text-3xl font-bold">Achievements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <motion.div
                key={cert.tokenId}
                variants={itemVariants}
                className={`${theme.card} rounded-xl shadow-xl p-6 border ${theme.border} group hover:shadow-2xl transition-all duration-300`}
              >
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 opacity-10 rounded-lg`}></div>
                  <div className="relative p-4">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                        <FaCertificate className="text-4xl text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-center mb-6">
                      {cert.courseId}
                    </h3>

                    <div className="space-y-4">
                      <div className={`flex justify-between py-2 border-b ${theme.border}`}>
                        <span className={theme.text.secondary}>Student</span>
                        <span className="font-medium">{cert.studentName}</span>
                      </div>
                      <div className={`flex justify-between py-2 border-b ${theme.border}`}>
                        <span className={theme.text.secondary}>Completed</span>
                        <span className="font-medium">{cert.completionDate}</span>
                      </div>
                      <div className={`flex justify-between py-2`}>
                        <span className={theme.text.secondary}>Score</span>
                        <span className="font-bold text-lg bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
                          {cert.score}/100
                        </span>
                      </div>
                    </div>

                    <button className={`mt-6 w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}>
                      View Certificate
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Course Content Modal */}
      <AnimatePresence>
        {activeCourse && (
          <CourseContent
            course={activeCourse}
            onClose={() => setActiveCourse(null)}
            onUpdateProgress={updateProgress}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard; 