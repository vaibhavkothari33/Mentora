import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaCheck, FaTasks, FaCode, FaChevronDown } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { aiAssignments } from '../data/aiAssignmentsData';

const Assignments = () => {
  const { darkMode } = useTheme();
  const [expandedAssignments, setExpandedAssignments] = useState({});

  const toggleCheckpoints = (index) => {
    setExpandedAssignments(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#000000]' : 'bg-gradient-to-b from-blue-50 via-white to-blue-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-4xl md:text-5xl font-bold text-center mb-12 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          My Assignments
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aiAssignments.map((assignment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${
                darkMode 
                  ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50' 
                  : 'bg-white/80 backdrop-blur-sm border border-gray-200'
              } rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {assignment.task}
                  </h2>
                </div>
                <a
                  href={assignment.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full ${
                    darkMode 
                      ? 'bg-gray-700/50 hover:bg-gray-700' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors duration-200`}
                >
                  <FaGithub className={`text-xl ${darkMode ? 'text-white' : 'text-gray-700'}`} />
                </a>
              </div>

              <p className={`text-sm mb-6 flex-grow ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {assignment.description}
              </p>

              <div>
                <button
                  onClick={() => toggleCheckpoints(index)}
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
                      expandedAssignments[index] ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedAssignments[index] && (
                  <div className="mt-3 space-y-3">
                    {assignment.checkpoints.map((checkpoint) => (
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
                              {checkpoint.title}
                            </h4>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'} break-words`}>
                              {checkpoint.description}
                            </p>
                            {checkpoint.command && (
                              <div className={`mt-2 p-2 rounded-md text-xs font-mono ${
                                darkMode 
                                  ? 'bg-gray-900 text-gray-300' 
                                  : 'bg-gray-100 text-gray-700'
                              } break-words whitespace-pre-wrap overflow-x-auto`}>
                                {checkpoint.command}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assignments;