import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaUser, FaClock, FaBook, FaCertificate, FaChalkboardTeacher, 
         FaStar, FaEthereum, FaLinkedin, FaGithub, FaGlobe, FaDownload } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useMentoraContract } from '../hooks/useMentoraContract';
import ipfsService from '../utils/ipfsStorage';

const CourseDetails = () => {
  const { courseId } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { getClient } = useMentoraContract();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseContent, setCourseContent] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const client = getClient();
        const courseData = await client.getCourseInfo(courseId);
        setCourse(courseData);
        
        // Fetch course content from IPFS
        const contentURI = await client.getCourseContentURI(courseId);
        if (contentURI) {
          const content = await ipfsService.retrieveJSON(contentURI);
          setCourseContent(content);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, getClient]);

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text.primary} flex flex-col items-center justify-center`}>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text.primary} flex flex-col items-center justify-center`}>
        <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
        <button 
          onClick={() => navigate('/courses')}
          className={`bg-gradient-to-r ${theme.primary} text-white px-6 py-2 rounded-lg`}
        >
          Return to Courses
        </button>
      </div>
    );
  }

  const getDifficultyLabel = (level) => {
    switch (level) {
      case 1: return "Beginner";
      case 2: return "Intermediate";
      case 3: return "Advanced";
      default: return "All Levels";
    }
  };

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text.primary} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            to="/courses" 
            className={`${theme.text.secondary} hover:${theme.text.accent} flex items-center`}
          >
            ← Back to Courses
          </Link>
        </div>

        {/* Course Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className={`${theme.text.secondary} text-lg mb-6`}>
              {course.description}
            </p>
            <div className="flex flex-wrap gap-4 mb-4">
              <span className={`flex items-center ${theme.text.secondary}`}>
                <FaUser className="mr-2" /> {course.enrolledUsers} enrolled
              </span>
              <span className={`flex items-center ${theme.text.secondary}`}>
                <FaBook className="mr-2" /> {course.moduleCount} modules
              </span>
              <span className={`flex items-center ${theme.text.secondary}`}>
                <FaClock className="mr-2" /> {Math.floor(course.duration / 60)}h {course.duration % 60}m
              </span>
              <span className={`flex items-center ${theme.text.secondary}`}>
                <FaStar className="mr-2" /> {getDifficultyLabel(course.difficulty)}
              </span>
              <span className={`flex items-center ${theme.text.secondary}`}>
                <FaChalkboardTeacher className="mr-2" /> {course.category}
              </span>
            </div>
            
            {/* Intro Video */}
            {courseContent && courseContent.introVideoIpfsHash && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">Course Introduction</h3>
                <div className="aspect-w-16 aspect-h-9">
                  <video 
                    src={ipfsService.getIPFSUrl(courseContent.introVideoIpfsHash)}
                    controls
                    poster={ipfsService.getIPFSUrl(course.thumbnailIpfsHash)}
                    className="w-full rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Enrollment Card */}
          <div className={`${theme.card} rounded-xl shadow-lg p-6 border ${theme.border}`}>
            <div className="text-center mb-6">
              <img 
                src={ipfsService.getIPFSUrl(course.thumbnailIpfsHash)}
                alt={course.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="flex items-center justify-center mb-4">
                <FaEthereum className={`text-2xl ${theme.text.accent} mr-2`} />
                <span className="text-3xl font-bold">{course.price} ETH</span>
              </div>
              <button 
                className={`w-full bg-gradient-to-r ${theme.primary} text-white py-3 rounded-lg hover:shadow-lg transform transition-all duration-200 hover:scale-105 ${!course.isActive && 'opacity-50 cursor-not-allowed'}`}
                disabled={!course.isActive}
              >
                {course.isActive ? 'Enroll Now' : 'Currently Unavailable'}
              </button>
            </div>
            <div className="text-sm text-center">
              <p>Total Sales: {course.totalSales}</p>
              <p>Course ID: {course.id}</p>
            </div>
          </div>
        </div>

        {/* Course Content */}
        {courseContent && courseContent.moduleTitles && (
          <div className={`${theme.card} rounded-xl p-6 border ${theme.border} mb-12`}>
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
            <div className="space-y-4">
              {courseContent.moduleTitles.map((title, index) => (
                <div key={index} className={`p-4 rounded-lg border ${theme.border}`}>
                  <h3 className="text-lg font-semibold mb-2">Module {index + 1}: {title}</h3>
                  <div className="flex items-center mb-3">
                    <FaPlay className={`mr-2 ${theme.text.secondary}`} />
                    <a 
                      href={ipfsService.getIPFSUrl(courseContent.moduleIpfsHashes[index])}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${theme.text.accent} hover:underline`}
                    >
                      Watch Module Video
                    </a>
                  </div>
                  
                  {courseContent.materialIpfsHashes && courseContent.materialIpfsHashes[index] && 
                   courseContent.materialIpfsHashes[index].length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Additional Materials:</h4>
                      <ul className="space-y-2">
                        {courseContent.materialIpfsHashes[index].map((materialHash, matIndex) => (
                          <li key={matIndex} className="flex items-center">
                            <FaDownload className={`mr-2 ${theme.text.secondary}`} />
                            <a 
                              href={ipfsService.getIPFSUrl(materialHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${theme.text.accent} hover:underline`}
                            >
                              Material {matIndex + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Creator Section */}
        <div className={`${theme.card} rounded-xl p-6 border ${theme.border} mb-12`}>
          <h2 className="text-2xl font-bold mb-6">Creator</h2>
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="font-semibold">Creator Address</h3>
              <p className={theme.text.secondary}>{course.creator}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
