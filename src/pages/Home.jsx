import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaCertificate,FaClock, FaRobot, FaArrowRight, FaPlay, FaChalkboardTeacher, FaUserGraduate, FaAward, FaCheck, FaTasks } from 'react-icons/fa';
import WalletConnect from '../components/WalletConnect';
import Aurora from './Aurora';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const Home = () => {
  const [connectedAccount, setConnectedAccount] = useState('');
  const { darkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const featuredCourses = [
    {
      title: "Blockchain Fundamentals",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000",
      students: "500+",
      rating: 4.8,
      duration: "8 weeks"
    },
    {
      title: "Smart Contract Development",
      image: "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=1000",
      students: "300+",
      rating: 4.9,
      duration: "10 weeks"
    },
    {
      title: "DeFi Masterclass",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000",
      students: "400+",
      rating: 4.7,
      duration: "12 weeks"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#000000]' : 'bg-gradient-to-b from-blue-50 via-white to-blue-50 text-gray-900'}`}>
      <Aurora 
        colorStops={darkMode ? ["#3A29FF", "#FF94B4", "#FF3232"] : ["#60A5FA", "#7C3AED", "#2563EB"]}
        blend={darkMode ? 0.5 : 0.3}
        amplitude={3.0}
        speed={0.5}
      />

      {/* Hero Section with 3D Image */}
      <section className="relative min-h-screen flex items-center justify-center py-20 px-4">
        <div className="absolute inset-0 bg-[#000000] dark:from-blue-500/5 dark:to-purple-500/5"></div>
        <motion.div 
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeIn}
          className="max-w-6xl mx-auto relative grid md:grid-cols-2 gap-8 items-center"
        >
          {/* Left Column - Text Content */}
          <div className="text-left space-y-8 -mt-8">
            <motion.h1 
              className={`text-6xl md:text-7xl font-bold leading-tight ${
                darkMode 
                  ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400' 
                  : 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600'
              } animate-gradient`}
            >
              Transform Your Future with Blockchain Education
            </motion.h1>
            
            <motion.p 
              className={`text-xl md:text-2xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
              variants={fadeIn}
            >
              Join the revolution in decentralized learning. Earn verifiable certificates, 
              learn from experts, and build your career in Web3.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={fadeIn}
            >
              {!connectedAccount && <WalletConnect onConnect={setConnectedAccount} />}
              <Link
                to="/courses"
                className={`${
                  darkMode 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                } text-white px-6 py-3 rounded-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center group text-lg font-semibold shadow-lg hover:shadow-xl`}
              >
                <FaPlay className="mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                Start Learning
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-4 pt-8 text-white"
              variants={fadeIn}
            >
              {[
                { number: "1000+", label: "Students", icon: <FaUserGraduate /> },
                { number: "50+", label: "Courses", icon: <FaChalkboardTeacher /> },
                { number: "500+", label: "Certificates", icon: <FaAward /> }
              ].map((stat, index) => (
                <div key={index} className={`text-center p-4 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm`}>
                  <div className={`text-3xl mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold">{stat.number}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - 3D Visual */}
          <motion.div 
            className="relative mt-8"
            variants={fadeIn}
          >
            <img
              src="https://i.ibb.co/tPc53Kjq/dashboard.png"
              alt="Blockchain Education"
              className="rounded-2xl shadow-2xl transform hover:scale-105 transition-duration-300"
            />
            <div className="absolute -z-10 top-1/2 -right-8 w-24 h-24 bg-purple-500/20 rounded-full blur-xl" />
            <div className="absolute -z-10 bottom-1/2 -left-8 w-32 h-32 bg-blue-500/20 rounded-full blur-xl" />
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`text-4xl md:text-5xl font-bold text-center mb-16 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Featured Courses
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCourses.map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                className={`${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-2xl overflow-hidden shadow-xl group`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-1000/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl text-white font-bold mb-2">{course.title}</h3>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      <FaUserGraduate className="inline mr-2" />
                      {course.students} students
                    </span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      <FaClock className="inline mr-2" />
                      {course.duration}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-gray-400">{course.rating}</span>
                    </div>
                    <Link
                      to="/courses"
                      className={`${
                        darkMode 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white px-4 py-2 rounded-lg text-sm`}
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Process Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`text-4xl md:text-5xl font-bold text-center mb-16 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaUserGraduate />,
                title: "Sign Up",
                description: "Create your account and connect your wallet",
                metric: "5000+ Students",
                color: "from-[#3A29FF] to-[#6C63FF]"
              },
              {
                icon: <FaChalkboardTeacher />,
                title: "Choose Course",
                description: "Browse and enroll in your preferred course",
                metric: "50+ Courses",
                color: "from-[#FF94B4] to-[#FF3232]"
              },
              {
                icon: <FaGraduationCap />,
                title: "Learn",
                description: "Access course content and complete assignments",
                metric: "98% Completion",
                color: "from-[#60A5FA] to-[#7C3AED]"
              },
              {
                icon: <FaCertificate />,
                title: "Get Certified",
                description: "Earn your NFT certificate upon completion",
                metric: "500+ Certificates",
                color: "from-[#4CAF50] to-[#2E7D32]"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className={`${
                  darkMode ? 'bg-[#1a1a2e]/40' : 'bg-white/40'
                } rounded-3xl p-8 shadow-2xl relative overflow-hidden group backdrop-blur-md border border-gray-800/30`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-300/10 to-gray-600/10 group-hover:opacity-20 opacity-0.1 transition-opacity duration-300 backdrop-blur-sm" />
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white text-3xl mb-6 shadow-lg`}>
                    {step.icon}
                  </div>

                  <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {step.title}
                  </h3>

                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                    {step.description}
                  </p>

                  <div className={`text-lg font-semibold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                    {step.metric}
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Action Buttons Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center px-4"
        >
          <h2 className={`text-4xl md:text-5xl font-bold mb-8 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Take Action?
          </h2>
          <p className={`text-xl mb-12 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Choose your path and start your journey with EduChain today.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`${
                darkMode 
                  ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20' 
                  : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'
              } rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full ${
                  darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                } flex items-center justify-center mb-6`}>
                  <FaChalkboardTeacher className={`text-2xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create Course
                </h3>
                <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Share your knowledge and create engaging courses for the community.
                </p>
                <Link
                  to="/create-course"
                  className={`${
                    darkMode 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                  } text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center group`}
                >
                  Get Started
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`${
                darkMode 
                  ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20' 
                  : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'
              } rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full ${
                  darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                } flex items-center justify-center mb-6`}>
                  <FaTasks className={`text-2xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  My Assignments
                </h3>
                <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Track your progress and view your completed assignments.
                </p>
                <Link
                  to="/assignments"
                  className={`${
                    darkMode 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                  } text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center group`}
                >
                  View Assignments
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`text-4xl md:text-5xl font-bold text-center mb-16 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Why Choose EduChain?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaGraduationCap className="text-4xl" />,
                title: "Learn from Experts",
                description: "Get mentored by industry professionals with years of blockchain experience.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: <FaCertificate className="text-4xl" />,
                title: "Earn NFT Certificates",
                description: "Showcase your achievements with blockchain-verified credentials.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: <FaRobot className="text-4xl" />,
                title: "AI-Powered Learning",
                description: "Get personalized support and adaptive learning paths.",
                color: "from-green-500 to-green-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                className={`${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-2xl p-8 shadow-xl relative overflow-hidden group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl text-white font-bold mb-4">{feature.title}</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`text-4xl md:text-5xl font-bold text-center mb-16 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Student Success Stories
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Blockchain Developer",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000",
                quote: "EduChain helped me transition into blockchain development. The NFT certificate gave me credibility in the industry."
              },
              {
                name: "Michael Chen",
                role: "DeFi Specialist",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000",
                quote: "The practical assignments and AI support made learning complex DeFi concepts much easier."
              },
              {
                name: "Emily Rodriguez",
                role: "Smart Contract Engineer",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1000",
                quote: "From beginner to professional smart contract developer - EduChain made it possible."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                className={`${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-2xl p-6 shadow-xl`}
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-bold text-white">{testimonial.name}</h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} italic`}>
                  "{testimonial.quote}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center px-4"
        >
          <h2 className={`text-4xl md:text-5xl font-bold mb-8 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Start Your Journey?
          </h2>
          <p className={`text-xl mb-12 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Join thousands of students already learning on EduChain and transform your career.
          </p>
          
          <div className="flex flex-col items-center space-y-4">
            <Link
              to="/courses"
              className={`${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
              } text-white px-12 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center group`}
            >
              Explore Courses
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
