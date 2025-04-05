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
      className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
    >
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className={`text-4xl font-bold mb-8 text-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          Contact Us
        </h1>
        
        <div className={`p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
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
