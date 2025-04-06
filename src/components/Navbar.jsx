import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaGraduationCap, FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import WalletConnect from './WalletConnect';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ account, onConnect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('nav')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/courses', label: 'Courses' },
    // { path: '/profile', label: 'Profile' },
    { path: '/create-course', label: 'Create Course' },
    { path: '/roadmap', label: 'Learning Roadmap' },
    // { path: '/ai-assignment', label: 'AI Assignments' },
    { path: '/assignments', label: 'Assignments' },
    { path: '/about', label: 'About' },
    { path: '/dashboard', label: 'Profile' },
    // { path: '/contact', label: 'Contact' }
  ];

  return (
    <nav className={`${darkMode ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-md shadow-lg sticky top-0 z-50 transition-all duration-300 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <FaGraduationCap className={`text-2xl ${darkMode ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-500'} transition-colors duration-200`} />
            <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mentora</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-2 py-1 ${
                  isActive(link.path)
                    ? darkMode
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-blue-600 border-b-2 border-blue-600'
                    : darkMode
                    ? 'text-gray-300 hover:text-white hover:border-b-2 hover:border-gray-300'
                    : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-400'
                } transition-all duration-200`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                darkMode
                  ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              } transition-all duration-200 transform hover:scale-110`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            </button>

            {/* Wallet Connect */}
            {!account ? (
              <WalletConnect onConnect={onConnect} />
            ) : (
              <div
                className={`px-4 py-2 rounded-full ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-blue-100 hover:bg-blue-200'
                } flex items-center transform hover:scale-105 transition-all duration-200 cursor-pointer`}
              >
                <span className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Connected:</span>
                <span className={`font-mono truncate max-w-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className={`md:hidden p-2 rounded-md ${
                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } transition-colors duration-200`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <FaTimes className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`} />
              ) : (
                <FaBars className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 shadow-lg">
            <div className={`px-2 pt-2 pb-3 space-y-1 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    isActive(link.path)
                      ? darkMode
                        ? 'bg-gray-800 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;