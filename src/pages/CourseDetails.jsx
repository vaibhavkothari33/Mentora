import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaUser, FaClock, FaBook, FaCertificate, FaChalkboardTeacher, 
         FaStar, FaEthereum, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useCourseMarketplace } from '../hooks/useCourseMarketplace';

const CourseDetails = () => {
  const { courseId } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { getClient } = useCourseMarketplace();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const client = getClient();
        const courseData = await client.getCourseInfo(courseId);
        setCourse(courseData);
      } catch (err) {
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
            <div className="flex flex-wrap gap-4">
              <span className={`flex items-center ${theme.text.secondary}`}>
                <FaUser className="mr-2" /> {course.enrolledUsers} enrolled
              </span>
              <span className={`flex items-center ${theme.text.secondary}`}>
                <FaBook className="mr-2" /> {course.moduleCount} modules
              </span>
              <span className={`flex items-center ${theme.text.secondary}`}>
                <FaClock className="mr-2" /> {course.duration} hours
              </span>
              {!course.isActive && (
                <span className={`flex items-center text-red-500`}>
                  Currently Unavailable
                </span>
              )}
            </div>
          </div>

          {/* Enrollment Card */}
          <div className={`${theme.card} rounded-xl shadow-lg p-6 border ${theme.border}`}>
            <div className="text-center mb-6">
              <img 
                src={`https://ipfs.io/ipfs/${course.thumbnailIpfsHash}`}
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
