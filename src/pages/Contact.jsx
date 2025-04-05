import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import axios from 'axios';

const Contact = () => {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await axios.post(`${import.meta.env.VITE_IP_ADDRESS}/contact`, formData);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen relative ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute -top-40 -right-40 w-96 h-96 rounded-full ${darkMode ? 'bg-blue-900/10' : 'bg-blue-100/50'}`}
        />
        <motion.div 
          animate={{
            x: [0, -100, 100, 0],
            y: [0, 100, -100, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute top-1/3 -left-20 w-64 h-64 rounded-full ${darkMode ? 'bg-purple-900/10' : 'bg-purple-100/50'}`}
        />
        <motion.div 
          animate={{
            x: [0, 150, -150, 0],
            y: [0, -150, 150, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute -bottom-20 right-1/4 w-80 h-80 rounded-full ${darkMode ? 'bg-indigo-900/10' : 'bg-indigo-100/50'}`}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <h1 className={`text-4xl font-bold mb-8 text-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          Contact Us
        </h1>
        
        <div className={`p-6 rounded-lg shadow-lg backdrop-blur-sm ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block mb-2 font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                  darkMode 
                    ? 'bg-gray-700 text-white focus:ring-blue-400' 
                    : 'bg-gray-50 text-gray-900 focus:ring-blue-500'
                }`}
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                  darkMode 
                    ? 'bg-gray-700 text-white focus:ring-blue-400' 
                    : 'bg-gray-50 text-gray-900 focus:ring-blue-500'
                }`}
              />
            </div>

            <div>
              <label htmlFor="message" className="block mb-2 font-medium">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                  darkMode 
                    ? 'bg-gray-700 text-white focus:ring-blue-400' 
                    : 'bg-gray-50 text-gray-900 focus:ring-blue-500'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className={`w-full py-3 px-6 rounded-md text-white font-medium transition-colors duration-200 ${
                status === 'sending'
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>

            {status === 'success' && (
              <p className="text-green-500 text-center">Message sent successfully!</p>
            )}
            {status === 'error' && (
              <p className="text-red-500 text-center">Failed to send message. Please try again.</p>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
