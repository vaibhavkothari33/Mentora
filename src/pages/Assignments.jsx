import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaSpinner, FaCheck, FaTasks, FaCode, FaChevronDown } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useAssignmentManager } from '../hooks/useAssignmentManager';

const Assignments = () => {
  const { theme } = useTheme();
  const { getClient } = useAssignmentManager();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAssignments, setExpandedAssignments] = useState({});

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const client = getClient();
      
      // Get all assignments
      const fetchedAssignments = (await client.getAllAssignments())
        .map((assignment, index) => ({
            id: index,
            ...assignment
        }));
      
      setAssignments(fetchedAssignments);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCheckpoints = (index) => {
    setExpandedAssignments(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleAssignmentClick = (assignment) => {
    navigate(`/ai-assignment/${assignment.id}`, { state: { assignment } });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text.primary} flex items-center justify-center`}>
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-4xl mb-4" />
          <p>Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text.primary} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchAssignments}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text.primary} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold"
          >
            Assignments
          </motion.h1>
          
          <Link
            to="/create-assignment"
            className={`flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors`}
          >
            <FaPlus className="mr-2" />
            Create Assignment
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleAssignmentClick(assignment)}
              className={`${theme.card} rounded-xl p-6 shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105 transition-transform duration-200`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{assignment.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  assignment.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {assignment.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className={`${theme.text.secondary} mb-4 line-clamp-3`}>
                {assignment.description}
              </p>

              <div className="mb-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCheckpoints(index);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg ${
                    theme.border
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FaCheck className="text-green-500" />
                    <span className="font-medium">Details</span>
                  </div>
                  <FaChevronDown
                    className={`transform transition-transform duration-200 ${
                      expandedAssignments[index] ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedAssignments[index] && (
                  <div className="mt-3 space-y-3">
                    <div className={`p-3 rounded-lg ${theme.border}`}>
                      <h4 className="font-medium mb-2">Question</h4>
                      <p className={`text-sm ${theme.text.secondary}`}>
                        {assignment.question}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className={`${theme.text.secondary}`}>
                  Created: {formatDate(assignment.createdAt)}
                </span>
                <span className={`${theme.text.secondary}`}>
                  Creator: {`${assignment.creator.slice(0, 6)}...${assignment.creator.slice(-4)}`}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl">No assignments found.</p>
            <Link
              to="/create-assignment"
              className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Create Your First Assignment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
