import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaUsers, FaClock, FaFilter, FaBook, FaChalkboardTeacher, FaGraduationCap, FaCode, FaTimes, FaEthereum, FaCertificate, FaWallet, FaCheck, FaSpinner } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useMentoraContract } from '../hooks/useMentoraContract';
import ipfsService from '../utils/ipfsStorage';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAccount, useBalance } from 'wagmi';
import Web3 from 'web3';
import { toast } from 'react-hot-toast';

const CourseModal = ({ isOpen, setIsOpen, course, theme }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={() => setIsOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full max-w-2xl transform overflow-hidden rounded-2xl ${theme.card} p-6 text-left align-middle shadow-xl transition-all`}>
                <div className="relative">
                  <img
                    src={ipfsService.getIPFSUrl(course.thumbnailIpfsHash)}
                    alt={course.title}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="mt-6">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-tight mb-2"
                  >
                    {course.title}
                  </Dialog.Title>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      course.difficulty === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      course.difficulty === 2 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {course.difficulty === 1 ? 'Beginner' :
                       course.difficulty === 2 ? 'Intermediate' :
                       'Advanced'} Level
                    </span>
                    <span className={`${theme.text.secondary}`}>•</span>
                    <span className="flex items-center gap-1">
                      <FaClock className="text-blue-500" />
                      {course.duration} hours
                    </span>
                  </div>

                  <p className={`${theme.text.secondary} text-lg mb-6`}>
                    {course.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 rounded-xl ${theme.background} ${theme.border}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-blue-500/10">
                          <FaUsers className="text-blue-500 text-xl" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Students</div>
                          <div className="text-2xl font-bold">{course.enrolledUsers}</div>
                        </div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl ${theme.background} ${theme.border}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-yellow-500/10">
                          <FaStar className="text-yellow-500 text-xl" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Rating</div>
                          <div className="text-2xl font-bold">{course.rating || '4.5'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <h4 className="text-lg font-semibold">What you'll learn:</h4>
                    <ul className="grid grid-cols-2 gap-3">
                      {course.content?.learningObjectives?.slice(0, 6).map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FaCertificate className="text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <FaEthereum className="text-2xl text-blue-500" />
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {parseFloat(course.price).toFixed(4)} ETH
                      </span>
                    </div>
                    <Link
                      to={`/courses/${course.id}`}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                      View Full Course
                    </Link>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const CourseCard = ({ course, theme }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          onClick={() => setIsModalOpen(true)}
          className={`cursor-pointer block ${theme.card} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm bg-opacity-95`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative group">
            <img
              src={ipfsService.getIPFSUrl(course.thumbnailIpfsHash)}
              alt={course.title}
              className="w-full h-56 object-cover transform transition-transform duration-300 group-hover:scale-105"
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300`} />
            {!course.isActive && (
              <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium">
                Inactive
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2 line-clamp-1">{course.title}</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <FaChalkboardTeacher className="text-blue-400" />
                  <span className="opacity-90">{course.instructor}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaGraduationCap className="text-green-400" />
                  <span className="opacity-90">5 students</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                course.difficulty === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                course.difficulty === 2 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {course.difficulty === 1 ? 'Beginner' :
                 course.difficulty === 2 ? 'Intermediate' :
                 'Advanced'}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-xs font-medium ${theme.text.secondary} bg-opacity-10 backdrop-blur-sm`}>
                {formatDuration(course.duration)}
              </span>
            </div>

            <p className={`${theme.text.secondary} mb-6 text-sm line-clamp-2 leading-relaxed`}>
              {course.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-xl ${theme.background} ${theme.border} hover:border-blue-500/50 transition-colors`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <FaBook className="text-blue-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Chapters</div>
                    <div className="font-semibold">{course.chaptersCount || '10+'}</div>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-xl ${theme.background} ${theme.border} hover:border-purple-500/50 transition-colors`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <FaCode className="text-purple-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
                    <div className="font-semibold">{course.projectsCount || '5+'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <FaStar className="text-yellow-400" />
                  <span className="font-semibold">{course.rating || '4.5'}</span>
                </div>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                <div className="flex items-center gap-1.5">
                  <FaUsers className="text-blue-500" />
                  <span>{course.totalSales}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {parseFloat(course.price).toFixed(4)} ETH
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <CourseModal 
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        course={course}
        theme={theme}
      />
    </>
  );
};

const BuyCourseButton = ({ course }) => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const [purchasing, setPurchasing] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const { getClient } = useMentoraContract();

  // Check if user is already enrolled
  useEffect(() => {
    const checkUserEnrollment = async () => {
      if (address && course.id) {
        try {
          const enrolled = await getClient().hasUserPurchasedCourse(address, course.id);
          setIsEnrolled(enrolled);
        } catch (error) {
          console.error('Error checking enrollment:', error);
        }
      }
    };

    checkUserEnrollment();
  }, [address, course.id, getClient]);

  const handlePurchase = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (isEnrolled) {
      toast.error('You are already enrolled in this course');
      return;
    }

    try {
      setPurchasing(true);
      
      const priceInWei = this.web3.utils.toWei(course.price.toString(), 'ether');
      // Check if user has enough balance
      if (balance?.value.lt(priceInWei)) {
        toast.error('Insufficient balance to purchase this course');
        return;
      }

      // Show confirmation toast
      const confirmed = window.confirm(
        `Are you sure you want to purchase "${course.title}" for ${course.price} ETH?`
      );

      if (!confirmed) {
        setPurchasing(false);
        return;
      }

      // Create loading toast
      const loadingToast = toast.loading('Processing your purchase...');

      try {
        // Call the contract to purchase the course
        await getClient().purchaseCourse(course.id, course.price);

        // Success! Update UI and show success message
        toast.success('Successfully enrolled in the course!', {
          id: loadingToast,
        });
        
        // Update enrollment status
        setIsEnrolled(true);
        
        // Redirect to course page
        setTimeout(() => {
          window.location.href = `/course/${course.id}`;
        }, 2000);
      } catch (error) {
        // Handle specific error cases
        let errorMessage = 'Failed to purchase course';
        
        if (error.code === 'ACTION_REJECTED') {
          errorMessage = 'Transaction was rejected';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        }
        
        toast.error(errorMessage, {
          id: loadingToast,
        });
        
        console.error('Purchase error:', error);
      }
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error(error.message || 'Failed to process transaction');
    } finally {
      setPurchasing(false);
    }
  };

  // Render different button states
  const renderButtonContent = () => {
    if (!address) {
      return (
        <>
          <FaWallet className="text-xl" />
          <span>Connect Wallet to Purchase</span>
        </>
      );
    }

    if (isEnrolled) {
      return (
        <>
          <FaCheck className="text-xl" />
          <span>Enrolled</span>
        </>
      );
    }

    if (purchasing) {
      return (
        <>
          <FaSpinner className="animate-spin text-xl" />
          <span>Processing Purchase...</span>
        </>
      );
    }

    return (
      <>
        <FaEthereum className="text-xl" />
        <span>Buy Course for {parseFloat(course.price).toFixed(4)} ETH</span>
      </>
    );
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePurchase}
      disabled={purchasing || isEnrolled || !address}
      className={`w-full px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2
        ${isEnrolled 
          ? 'bg-green-600 cursor-not-allowed'
          : purchasing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90'
        } text-white transition-all shadow-lg`}
    >
      {renderButtonContent()}
    </motion.button>
  );
};

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
            // Convert ArrayBuffer to text before parsing
            const content = await ipfsService.retrieveFile(contentIpfsHash);
            if (content instanceof ArrayBuffer) {
              // Convert ArrayBuffer to text
              const decoder = new TextDecoder('utf-8');
              const textContent = decoder.decode(content);
              try {
                courseContent = JSON.parse(textContent);
              } catch (parseError) {
                console.error(`Error parsing JSON for course ${i}:`, parseError);
                courseContent = { error: 'Invalid JSON format' };
              }
            } else if (typeof content === 'string') {
              try {
                courseContent = JSON.parse(content);
              } catch (parseError) {
                console.error(`Error parsing JSON string for course ${i}:`, parseError);
                courseContent = { error: 'Invalid JSON format' };
              }
            } else {
              console.error(`Unexpected content type for course ${i}:`, typeof content);
              courseContent = { error: 'Unexpected content type' };
            }
          } catch (err) {
            console.error(`Error fetching course content for course ${i}:`, err);
            courseContent = { error: 'Failed to fetch content' };
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
    <div className={`min-h-screen ${theme.background} ${theme.text.primary}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Discover Web3 Courses
            </h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-xl ${theme.text.secondary} leading-relaxed`}
            >
              Learn blockchain development from expert instructors and join the future of technology
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl p-8 mb-12 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-6 text-black py-4 rounded-xl border-2 ${theme.border} ${theme.background} ${theme.text.primary} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg`}
              />
              <FaFilter className="absolute right-6 top-1/2 transform -translate-y-1/2 text-black" />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-6 py-4 text-black rounded-xl border-2 ${theme.border} ${theme.background} ${theme.text.primary} min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg`}
            >
              <option value="all">All Courses</option>
              <option value="active">Active Courses</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              theme={theme}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-6`}>
              <FaBook className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No courses found</h3>
            <p className={`${theme.text.secondary} text-lg`}>
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Courses;