import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaUsers, FaClock, FaFilter } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useMentoraContract } from '../hooks/useMentoraContract';
import ipfsService from '../utils/ipfsStorage';

const Courses = () => {
  const { theme } = useTheme();
  const { getClient } = useMentoraContract();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' or 'active'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const client = getClient();
      const courseCount = await client.getCourseCount();
      
      const fetchedCourses = [];
      for (let i = 1; i <= courseCount; i++) {
        try {
          const courseInfo = await client.getCourseInfo(i);
          const courseStats = await client.getCourseStats(i);
          
          // Fetch course content for preview
          const contentIpfsHash = await client.getCoursePreview(i);
          let courseContent = null;
          try {
            const content = await ipfsService.retrieveFile(contentIpfsHash);
            courseContent = JSON.parse(content);
          } catch (err) {
            console.error(`Error fetching course content for course ${i}:`, err);
          }

          fetchedCourses.push({
            ...courseInfo,
            ...courseStats,
            content: courseContent
          });
        } catch (err) {
          console.error(`Error fetching course ${i}:`, err);
        }
      }

      setCourses(fetchedCourses);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesFilter = filter === 'all' || course.isActive;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text.primary} py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text.primary} py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text.primary} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Available Courses</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full md:w-64 px-4 py-2 rounded-lg border ${theme.border} ${theme.background} ${theme.text.primary}`}
              />
              <FaFilter className="absolute right-4 top-3 text-gray-400" />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${theme.border} ${theme.background} ${theme.text.primary}`}
            >
              <option value="all">All Courses</option>
              <option value="active">Active Courses</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className={`block ${theme.card} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300`}
            >
              <div className="relative">
                <img
                  src={ipfsService.getIPFSUrl(course.thumbnailIpfsHash)}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                {!course.isActive && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded">
                    Inactive
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                <p className={`${theme.text.secondary} mb-4 line-clamp-2`}>
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span>{course.totalSales}</span>
                  </div>
                  <div className="flex items-center">
                    <FaUsers className="text-blue-500 mr-1" />
                    <span>{course.enrolledUsers}</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="text-gray-500 mr-1" />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {parseFloat(course.price).toFixed(4)} ETH
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    course.difficulty === 1 ? 'bg-green-100 text-green-800' :
                    course.difficulty === 2 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.difficulty === 1 ? 'Beginner' :
                     course.difficulty === 2 ? 'Intermediate' :
                     'Advanced'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl">No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;