import { useState, useEffect } from 'react';
import { FaGraduationCap, FaEthereum, FaUserGraduate, FaBookOpen, FaClock, FaStar } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { useCourseMarketplace } from '../hooks/useCourseMarketplace';
import { ethers } from 'ethers';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const { theme } = useTheme();
  const { getClient } = useCourseMarketplace();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const client = getClient();
        if (!client) {
          throw new Error("CourseMarketplace client not initialized");
        }
        const coursesData = await client.getAllCourses();
        
        // Transform course data to match component needs
        const transformedCourses = coursesData.map(course => ({
          id: course.id.toString(),
          title: course.title,
          description: course.description,
          thumbnailIpfsHash: `https://ipfs.io/ipfs/${course.thumbnailIpfsHash}`,
          creator: course.creator,
          price: ethers.utils.formatEther(course.price.toString()),
          isActive: course.isActive,
          totalSales: course.totalSales.toString(),
          moduleCount: course.moduleCount.toString()
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

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.background} ${theme.text.primary} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Blockchain Courses</h1>
          <p className={`${theme.text.secondary} max-w-2xl mx-auto`}>
            Master blockchain technology with our curated collection of courses
          </p>
          
          {/* Filter tabs */}
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
              {/* Course image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.thumbnailIpfsHash} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {course.price} ETH
                </div>
              </div>
              
              <div className="p-6 flex-grow flex flex-col">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    course.isActive 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                  }`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
                    {course.moduleCount} Modules
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100">
                    <FaClock className="inline mr-1" />
                    {course.duration}h
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                
                <p className={`${theme.text.secondary} mb-4 line-clamp-3 text-sm flex-grow`}>
                  {course.description}
                </p>
                
                <div className="space-y-3 mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm truncate max-w-[150px]" title={course.creator}>
                        {`${course.creator.slice(0, 6)}...${course.creator.slice(-4)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <FaUserGraduate className="mr-1 inline" />
                        <span>{course.enrolledUsers} enrolled</span>
                      </div>
                      <div>
                        <FaBookOpen className="mr-1 inline" />
                        <span>{course.totalSales} sales</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center">
                      <FaEthereum className={`mr-1 ${theme.text.accent} text-lg`} />
                      <span className="font-bold">{ethers.utils.formatEther(course.price.toString())} ETH</span>
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