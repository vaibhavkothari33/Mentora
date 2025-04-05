import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Code, BarChart} from 'lucide-react';
import Aurora from './Aurora';
import { FaGraduationCap, FaCertificate, FaChartLine, FaTrophy, FaClock, FaStar, FaPlay, FaCheck, FaLock, FaExpand, FaPause, FaVolumeMute, FaVolumeUp, FaCode } from 'react-icons/fa';
//import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';


// Mock user data - replace with actual user data from your backend
const userData = {
  name: "John Doe",
  email: "john.doe@example.com",
  profileImage: "https://media.istockphoto.com/id/1130927444/photo/portrait-of-a-happy-young-man.jpg?s=612x612&w=0&k=20&c=mG70qUc4ABP3imh2jWHIsrp5zsY6DuFJMIAef6YxNLE=",
  problemStats: {
    totalSolved: 12,
    streak: 5,
    easy: 3,
    medium: 5,
    hard: 4
  },
  activityData: {
    lastWeekSessions: 5,
    averageSessionTime: 45,
    completionRate: 85
  }
};

function Profile() {
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
    
      const { theme } = useTheme();

  return (
    <div className='bg-gradient-to-b from-gray-900 to-black text-white min-h-screen'>
      <Aurora 
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={0.5}
        amplitude={3.0}
        speed={0.5}
      />  

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'
      >
        <div className='text-center mb-20'>
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className='flex flex-col items-center'
          >
            <img 
              src={userData.profileImage}
              alt={userData.name}
              className='w-32 h-32 rounded-full object-cover mb-6 border-4 border-blue-500'
            />
            <h1 className='text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text'>
              Welcome {userData.name}
            </h1>
            <p className='text-xl text-gray-300'>{userData.email}</p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Problem Solving Stats */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
            <div className="flex items-center mb-4">
              <Code className="w-5 h-5 mr-2 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Problem Solving Stats</h2>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{userData.problemStats.totalSolved}</div>
                <div className="text-sm text-gray-400">Problems Solved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{userData.problemStats.streak}</div>
                <div className="text-sm text-gray-400">Day Streak</div>
              </div>
            </div>

            <div className="space-y-2">
              {/* Easy */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">Easy</span>
                <span className="text-sm text-green-400">{userData.problemStats.easy}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full" 
                  style={{ width: `${(userData.problemStats.easy / userData.problemStats.totalSolved) * 100}%` }}
                />
              </div>

              {/* Medium */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">Medium</span>
                <span className="text-sm text-yellow-400">{userData.problemStats.medium}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full" 
                  style={{ width: `${(userData.problemStats.medium / userData.problemStats.totalSolved) * 100}%` }}
                />
              </div>

              {/* Hard */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">Hard</span>
                <span className="text-sm text-red-400">{userData.problemStats.hard}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-400 h-2 rounded-full" 
                  style={{ width: `${(userData.problemStats.hard / userData.problemStats.totalSolved) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
            <div className="flex items-center mb-4">
              <BarChart className="w-5 h-5 mr-2 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Activity Summary</h2>
            </div>
            <div className="space-y-4">
              {/* Last Week Sessions */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-300">Sessions Last Week</span>
                  <span className="text-sm font-medium text-white">{userData.activityData.lastWeekSessions}</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-8 rounded ${i < userData.activityData.lastWeekSessions ? 'bg-blue-400' : 'bg-gray-700'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Average Session */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-300">Average Session</span>
                  <span className="text-sm font-medium text-white">{userData.activityData.averageSessionTime} min</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full" 
                    style={{ width: `${Math.min(userData.activityData.averageSessionTime / 60 * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Completion Rate */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-300">Task Completion Rate</span>
                  <span className="text-sm font-medium text-white">{userData.activityData.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full" 
                    style={{ width: `${userData.activityData.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ongoing Courses Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-12 mb-16"
        >
          <div className="flex items-center mb-8">
            <FaGraduationCap className={`text-3xl mr-3 ${theme.text.accent}`} />
            <h2 className="text-3xl font-bold">Ongoing Courses</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                id: 1,
                title: "Advanced Smart Contracts",
                description: "Mastering complex smart contract patterns and security best practices",
                progress: 75,
                deadline: "2024-04-15",
                modules: [
                  { name: "Introduction to Advanced Patterns", completed: true },
                  { name: "Gas Optimization", completed: true },
                  { name: "Security Best Practices", completed: true },
                  { name: "Final Project", completed: false }
                ]
              },
              {
                id: 2,
                title: "Web3 Development",
                description: "Building decentralized applications with modern web3 tools",
                progress: 45,
                deadline: "2024-04-20",
                modules: [
                  { name: "Web3.js Basics", completed: true },
                  { name: "Wallet Integration", completed: true },
                  { name: "DApp Architecture", completed: false },
                  { name: "Testing & Deployment", completed: false }
                ]
              }
            ].map((course) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                className={`${theme.card} rounded-xl shadow-xl p-6 border ${theme.border} group hover:shadow-2xl transition-all duration-300`}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 opacity-10 rounded-lg"></div>
                  <div className="relative">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">{course.title}</h3>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        course.progress === 100 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {course.progress}%
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-6 ${theme.text.secondary}`}>
                      {course.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className={theme.text.secondary}>Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Modules List */}
                    <div className="space-y-3 mb-6">
                      {course.modules.map((module, index) => (
                        <div key={index} className="flex items-center">
                          <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                            module.completed 
                              ? 'bg-green-500' 
                              : 'bg-gray-700'
                          }`}>
                            {module.completed && <FaCheck className="text-xs" />}
                          </div>
                          <span className={`text-sm ${
                            module.completed 
                              ? 'text-gray-400 line-through' 
                              : theme.text.secondary
                          }`}>
                            {module.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Deadline */}
                    <div className={`flex items-center text-sm ${theme.text.secondary}`}>
                      <FaClock className="mr-2" />
                      <span>Expected Completion: {new Date(course.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Certificates Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-16"
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
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 opacity-10 rounded-lg"></div>
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
                      <div className="flex justify-between py-2">
                        <span className={theme.text.secondary}>Score</span>
                        <span className="font-bold text-lg bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
                          {cert.score}/100
                        </span>
                      </div>
                    </div>

                    <button className="mt-6 w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      View Certificate
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

export default Profile;