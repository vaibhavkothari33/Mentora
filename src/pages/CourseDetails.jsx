import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaClock, FaBook, FaChalkboardTeacher, FaGraduationCap, FaCode, FaPlay, FaCheck, FaSpinner, FaWallet, FaEthereum } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useMentoraContract } from '../hooks/useMentoraContract';
import ipfsService from '../utils/ipfsStorage';
import { toast } from 'react-hot-toast';
import Web3 from 'web3';
import { useAccount, useBalance } from 'wagmi';

const CourseDetails = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const { getClient } = useMentoraContract();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const [purchasing, setPurchasing] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const client = getClient();
      const courseInfo = await client.getCourseInfo(id);
      const courseStats = await client.getCourseStats(id);
      const contentIpfsHash = await client.getCoursePreview(id);
      
      let courseContent = null;
      try {
        const content = await ipfsService.retrieveFile(contentIpfsHash);
        
        // Debug logging
        console.log('Content type:', Object.prototype.toString.call(content));
        console.log('Raw content:', content);
        
        // Handle ArrayBuffer
        if (content instanceof ArrayBuffer) {
          const decoder = new TextDecoder('utf-8');
          const contentString = decoder.decode(content);
          console.log('Decoded content:', contentString);
          
          try {
            const contentJSON = JSON.parse(contentString);
            courseContent = contentJSON;
          } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            // Fallback to raw string if JSON parsing fails
            courseContent = contentString;
          }
        } else if (typeof content === 'string') {
          try {
            const contentJSON = JSON.parse(content);
            courseContent = contentJSON;
          } catch (parseError) {
            console.error('String parsing error:', parseError);
            courseContent = content;
          }
        } else {
          console.log('Content is neither ArrayBuffer nor string:', typeof content);
          courseContent = content;
        }
      } catch (err) {
        console.error('Error fetching course content:', err);
        setError('Failed to load course content');
      }

      setCourse({
        ...courseInfo,
        ...courseStats,
        content: courseContent
      });
    } catch (err) {
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!address || !course?.id) return;
      
      try {
        const client = getClient();
        const enrolled = await client.hasUserPurchasedCourse(address, course.id);
        setIsEnrolled(enrolled);
      } catch (error) {
        console.error('Error checking enrollment:', error);
      }
    };

    checkEnrollment();
  }, [address, course?.id, getClient]);

  const handleEnroll = async () => {
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
      
      console.log(course);
      // Convert course price to Wei
      const priceInWei = Web3.utils.toWei(course.price.toString(), 'ether');
      
      // Check if user has enough balance
      if (balance?.value.lt(priceInWei)) {
        toast.error('Insufficient balance to purchase this course');
        return;
      }

      // Show confirmation dialog
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
        // Get contract client and purchase course
        const tx = await getClient().purchaseCourse(course.id, course.price);

        // Wait for transaction confirmation
        await tx.wait();

        // Success! Update UI and show success message
        toast.success('Successfully enrolled in the course!', {
          id: loadingToast,
        });
        
        // Update enrollment status
        setIsEnrolled(true);
        
        // Refresh the page to show updated enrollment status
        window.location.reload();

      } catch (error) {
        // Handle specific error cases
        let errorMessage = 'Failed to purchase course';
        
        if (error.code === 'ACTION_REJECTED') {
          errorMessage = 'Transaction was rejected';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        } else if (error.message.includes('user rejected transaction')) {
          errorMessage = 'You rejected the transaction';
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

  const renderEnrollButton = () => (
    <button
      onClick={handleEnroll}
      disabled={purchasing || isEnrolled || !address}
      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
        ${isEnrolled 
          ? 'bg-green-600 cursor-not-allowed' 
          : purchasing 
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
    >
      {isEnrolled ? (
        <>
          <FaCheck className="text-xl" />
          <span>Enrolled</span>
        </>
      ) : purchasing ? (
        <>
          <FaSpinner className="animate-spin text-xl" />
          <span>Processing...</span>
        </>
      ) : !address ? (
        <>
          <FaWallet className="text-xl" />
          <span>Connect Wallet</span>
        </>
      ) : (
        <>
          <FaEthereum className="text-xl" />
          <span>Enroll Now • {parseFloat(course.price).toFixed(4)} ETH</span>
        </>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text.primary} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text.primary} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Course</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text.primary}`}>
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <div className="absolute inset-0">
          <img
            src={ipfsService.getIPFSUrl(course.thumbnailIpfsHash)}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {course.title}
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-6 mb-8"
          >
            <div className="flex items-center gap-2">
              <FaChalkboardTeacher />
              <span>{course.instructor}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaStar className="text-yellow-400" />
              <span>{course.rating || '4.5'} ({course.totalSales} students)</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock />
              <span>{course.duration} total hours</span>
            </div>
            <div className="flex items-center gap-2">
              <FaGraduationCap />
              <span>
                {course.difficulty === 1 ? 'Beginner' :
                 course.difficulty === 2 ? 'Intermediate' :
                 'Advanced'} Level
              </span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            {renderEnrollButton()}
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors">
              Preview Course
            </button>
          </motion.div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
              {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium capitalize transition-colors ${
                    activeTab === tab 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : theme.text.secondary
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">Course Description</h3>
                  <p className={theme.text.secondary}>{course.description}</p>
                  
                  <div className="mt-8">
                    <h4 className="text-xl font-bold mb-4">What you'll learn</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.content?.learningObjectives?.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FaCheck className="mt-1 text-green-500 flex-shrink-0" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {activeTab === 'curriculum' && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">Course Curriculum</h3>
                  <div className="space-y-4">
                    {course.content?.chapters?.map((chapter, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${theme.card}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{chapter.title}</h4>
                          <span className={theme.text.secondary}>
                            {chapter.duration} min
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {chapter.lessons?.map((lesson, lIndex) => (
                            <li
                              key={lIndex}
                              className="flex items-center gap-2 text-sm"
                            >
                              <FaPlay className="text-blue-500" />
                              <span>{lesson.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`${theme.card} rounded-xl p-6 sticky top-4`}>
              <h3 className="text-xl font-bold mb-4">Course Features</h3>
              <ul className="space-y-4">
                <li className="flex items-center justify-between">
                  <span>Lectures</span>
                  <span className="font-medium">{course.content?.chapters?.length || 0}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Duration</span>
                  <span className="font-medium">{course.duration} hours</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Enrolled</span>
                  <span className="font-medium">{course.enrolledUsers} students</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Certificate</span>
                  <span className="font-medium">Yes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
