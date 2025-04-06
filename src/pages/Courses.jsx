import { useState, useEffect } from 'react';
import { FaGraduationCap, FaEthereum, FaUserGraduate, FaBookOpen, FaClock, FaStar, FaPlayCircle } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { useMentoraContract } from '../hooks/useMentoraContract';
import { ethers } from 'ethers';
import ipfsService from '../utils/ipfsStorage';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const { theme } = useTheme();
  const { getClient } = useMentoraContract();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const client = getClient();
        if (!client) {
          throw new Error("MentoraClient client not initialized");
        }
        const coursesData = await client.getAllCourses();
        
        // Transform course data to match component needs
        const transformedCourses = await Promise.all(coursesData.map(async course => {
          // Get module titles and intro video
          const moduleTitles = await client.getModuleTitles(course.id);
          const introVideo = await client.getCourseIntroVideo(course.id);

          return {
            id: course.id,
            title: course.title,
            description: course.description,
            category: course.category,
            difficulty: course.difficulty,
            thumbnailIpfsHash: course.thumbnailIpfsHash,
            introVideoIpfsHash: introVideo,
            creator: course.creator,
            price: course.price,
            isActive: course.isActive,
            totalSales: course.totalSales,
            totalRevenue: course.totalRevenue,
            moduleCount: course.moduleCount,
            enrolledUsers: course.enrolledUsers,
            duration: course.duration,
            moduleTitles: moduleTitles
          };
        }));
        
        setCourses(transformedCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [getClient]);

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text.primary} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-current border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text.primary} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-xl mb-4">Error loading courses</p>
          <p className={`${theme.text.secondary}`}>{error}</p>
        </div>
      </div>
    );
  }

  const getDifficultyLabel = (level) => {
    switch(level) {
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      default: return 'All Levels';
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.background} ${theme.text.primary} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Blockchain Courses</h1>
          <p className={`${theme.text.secondary} max-w-2xl mx-auto`}>
            Master blockchain technology with our curated collection of courses
          </p>
          
          <div className="flex flex-wrap justify-center mt-8 gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'all' 
                ? `bg-gradient-to-r ${theme.primary} text-white` 
                : `bg-opacity-20 bg-gray-200 dark:bg-gray-700 ${theme.text.secondary}`}`}
            >
              All Courses
            </button>
            <button 
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'active' 
                ? `bg-gradient-to-r ${theme.primary} text-white` 
                : `bg-opacity-20 bg-gray-200 dark:bg-gray-700 ${theme.text.secondary}`}`}
            >
              Active Courses
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses
            .filter(course => filter === 'all' || (filter === 'active' && course.isActive))
            .map((course) => (
            <div key={course.id} className={`${theme.card} rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 border ${theme.border} flex flex-col`}>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={ipfsService.getIPFSUrl(course.thumbnailIpfsHash)} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                {course.introVideoIpfsHash && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <FaPlayCircle className="text-white text-4xl opacity-80 hover:opacity-100 cursor-pointer" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {ethers.utils.formatEther(course.price)} ETH
                </div>
              </div>
              
              <div className="p-6 flex-grow flex flex-col">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    course.isActive 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                  }`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
                    {getDifficultyLabel(course.difficulty)}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100">
                    {course.category}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                
                <p className={`${theme.text.secondary} mb-4 line-clamp-3 text-sm flex-grow`}>
                  {course.description}
                </p>

                <div className="mb-4">
                  <h3 className="font-medium mb-2">Modules:</h3>
                  <ul className="text-sm space-y-1">
                    {course.moduleTitles.slice(0, 3).map((title, index) => (
                      <li key={index} className={`${theme.text.secondary}`}>
                        • {title}
                      </li>
                    ))}
                    {course.moduleTitles.length > 3 && (
                      <li className={`${theme.text.secondary} italic`}>
                        + {course.moduleTitles.length - 3} more modules
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="space-y-3 mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm truncate max-w-[150px]" title={course.creator}>
                        {`${course.creator.slice(0, 6)}...${course.creator.slice(-4)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div title="Duration">
                        <FaClock className="mr-1 inline" />
                        <span>{formatDuration(course.duration)}</span>
                      </div>
                      <div title="Enrolled Students">
                        <FaUserGraduate className="mr-1 inline" />
                        <span>{course.enrolledUsers}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center">
                      <FaEthereum className={`mr-1 ${theme.text.accent} text-lg`} />
                      <span className="font-bold">{ethers.utils.formatEther(course.price)} ETH</span>
                    </div>
                    <Link
                      to={`/courses/${course.id}`}
                      className={`bg-gradient-to-r ${theme.primary} text-white px-4 py-2 rounded-lg hover:shadow-lg transform transition-all duration-200 hover:scale-105 text-center flex-shrink-0`}
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className={`text-center py-16 ${theme.text.secondary}`}>
            <FaGraduationCap className="text-5xl mx-auto mb-4 opacity-50" />
            <p className="text-xl">No courses available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;