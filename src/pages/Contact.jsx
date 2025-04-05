import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaEnvelope, FaDiscord, FaTwitter } from 'react-icons/fa';

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

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <FaEnvelope className="text-2xl text-blue-500" />
              <div>
                <h2 className="text-xl font-semibold">Email</h2>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>support@mentora.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <FaDiscord className="text-2xl text-purple-500" />
              <div>
                <h2 className="text-xl font-semibold">Discord</h2>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Join our community</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <FaTwitter className="text-2xl text-blue-400" />
              <div>
                <h2 className="text-xl font-semibold">Twitter</h2>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Follow us @mentora</p>
              </div>
            </div>
          </div>
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
              />
              <textarea
                placeholder="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
              ></textarea>
              <button
                type="submit"
                disabled={status === 'sending'}
                className={`w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                  status === 'sending' ? 'bg-gray-500 cursor-not-allowed' : ''
                }`}
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
