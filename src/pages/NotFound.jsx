import { Link } from 'react-router-dom';
import { FaHome, FaBookOpen, FaExclamationTriangle } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const NotFound = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.background} ${theme.text.primary} flex items-center justify-center p-4`}>
      <div className={`max-w-2xl mx-auto text-center ${theme.card} rounded-2xl shadow-xl p-8 border ${theme.border}`}>
        {/* 404 Animation */}
        <div className="mb-8 relative">
          <div className={`text-8xl md:text-9xl font-bold opacity-10 ${theme.text.accent}`}>404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaExclamationTriangle className={`text-5xl ${theme.text.accent} animate-bounce`} />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Oops! Page Not Found
        </h1>
        <p className={`${theme.text.secondary} text-lg mb-8 max-w-md mx-auto`}>
          Looks like you've ventured into uncharted territory. Don't worry, even the best explorers get lost sometimes!
        </p>

        {/* Navigation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
          <Link
            to="/"
            className={`flex items-center justify-center gap-2 bg-gradient-to-r ${theme.primary} text-white px-6 py-3 rounded-lg hover:shadow-lg transform transition-all duration-200 hover:scale-105`}
          >
            <FaHome className="text-xl" />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/courses"
            className={`flex items-center justify-center gap-2 ${theme.card} border-2 ${theme.border} ${theme.text.accent} px-6 py-3 rounded-lg hover:shadow-lg transform transition-all duration-200 hover:scale-105`}
          >
            <FaBookOpen className="text-xl" />
            <span>Browse Courses</span>
          </Link>
        </div>

        {/* Fun Facts */}
        <div className={`mt-12 pt-8 border-t ${theme.border}`}>
          <h2 className="font-semibold mb-4">While you're here, did you know?</h2>
          <div className={`${theme.text.secondary} text-sm`}>
            The term "404" comes from the early days of the HTTP protocol, 
            where it indicated that the server couldn't find the requested page.
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
