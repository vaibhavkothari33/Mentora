import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { FaGraduationCap, FaCertificate, FaChartLine, FaTrophy, FaClock, FaStar, FaPlay, FaCheck, FaLock, FaExpand, FaPause, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const VideoPlayer = ({ videoUrl, title }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadMetadata);
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadMetadata);
      };
    }
  }, []);

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
          src={videoUrl}
          className="w-full h-full object-contain"
          playsInline
        />
        
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

  // Simulated course content structure
  const topics = [
    {
      id: 1,
      title: "Introduction to Blockchain",
      duration: "15:30",
      videoUrl: "https://bafybeiajhp6f5rpiu4wvazgzq3scxilkeevdvngkrhny42x3oo7hrs6hbq.ipfs.w3s.link/VID-20250221-WA0059.mp4",
      isLocked: false
    },
    {
      id: 2,
      title: "Cryptography Basics",
      duration: "20:45",
      videoUrl: "https://example.com/video2.mp4",
      isLocked: course.progress < 25
    },
    {
      id: 3,
      title: "Consensus Mechanisms",
      duration: "18:20",
      videoUrl: "https://example.com/video3.mp4",
      isLocked: course.progress < 50
    },
    {
      id: 4,
      title: "Smart Contracts",
      duration: "25:15",
      videoUrl: "https://example.com/video4.mp4",
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
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className={`${theme.card} rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Course Header */}
        <div className={`p-6 border-b ${theme.border}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{course.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              ×
            </button>
          </div>
          <div className="mt-2 flex items-center space-x-4">
            <div className="flex items-center">
              <FaClock className={`mr-2 ${theme.text.secondary}`} />
              <span className={theme.text.secondary}>4 Topics</span>
            </div>
            <div className="flex items-center">
              <FaGraduationCap className={`mr-2 ${theme.text.secondary}`} />
              <span className={theme.text.secondary}>{course.progress}% Complete</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
          {/* Video Player Section - Now takes 2/3 of the width */}
          <div className={`${theme.background} p-6 lg:col-span-2`}>
            {activeVideo ? (
              <div className="space-y-4">
                <VideoPlayer 
                  videoUrl={activeVideo.videoUrl} 
                  title={activeVideo.title}
                />
                <button
                  onClick={() => handleTopicComplete(activeVideo.id)}
                  className={`px-4 py-2 rounded-lg ${
                    completedTopics.has(activeVideo.id)
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {completedTopics.has(activeVideo.id) ? 'Completed' : 'Mark as Complete'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a topic to start learning
              </div>
            )}
          </div>

          {/* Topics List - Now takes 1/3 of the width */}
          <div className={`${theme.card} border-l ${theme.border} overflow-y-auto`}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Course Content</h3>
              <div className="space-y-2">
                {topics.map((topic) => (
                  <motion.div
                    key={topic.id}
                    whileHover={{ x: 4 }}
                    className={`p-4 rounded-lg cursor-pointer ${
                      activeVideo?.id === topic.id
                        ? 'bg-blue-50 dark:bg-gray-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => !topic.isLocked && setActiveVideo(topic)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          completedTopics.has(topic.id)
                            ? 'bg-green-100 text-green-500'
                            : topic.isLocked
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-blue-100 text-blue-500'
                        }`}>
                          {completedTopics.has(topic.id) ? (
                            <FaCheck />
                          ) : topic.isLocked ? (
                            <FaLock />
                          ) : (
                            <FaPlay />
                          )}
                        </div>
                        <div>
                          <h4 className={`font-medium ${
                            topic.isLocked ? 'text-gray-400' : ''
                          }`}>
                            {topic.title}
                          </h4>
                          <span className={`text-sm ${theme.text.secondary}`}>
                            {topic.duration}
                          </span>
                        </div>
                      </div>
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
      progress: 75,
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
      studentName: "John Doe",
      completionDate: "2024-03-15",
      score: "95"
    },
    {
      tokenId: "NFT-002",
      courseId: "CERT-SC-201",
      studentName: "John Doe",
      completionDate: "2024-03-20",
      score: "88"
    }
  ]);

  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const [activeCourse, setActiveCourse] = useState(null);

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