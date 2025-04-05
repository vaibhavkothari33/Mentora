// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaTwitter, FaGithub, FaLinkedin, FaDiscord } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { darkMode } = useTheme();
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Company',
      links: [
        { label: 'About', path: '/about' },
        { label: 'Courses', path: '/courses' },
        { label: 'Instructors', path: '/instructors' },
        { label: 'Contact', path: '/contact' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', path: '/docs' },
        { label: 'Blog', path: '/blog' },
        { label: 'FAQ', path: '/faq' },
        { label: 'Support', path: '/support' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Cookie Policy', path: '/cookies' }
      ]
    }
  ];

  const socialLinks = [
    { icon: <FaTwitter />, url: 'https://twitter.com' },
    { icon: <FaGithub />, url: 'https://github.com/vaibhavkothari33/Mentora' },
    { icon: <FaLinkedin />, url: 'https://linkedin.com' },
    { icon: <FaDiscord />, url: 'https://discord.com' }
  ];

  return (
    <footer className={`${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-600'} border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <FaGraduationCap className={`text-2xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Mentora
              </span>
            </Link>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
              Empowering education through blockchain technology. Learn, earn certificates, and build your future with Mentora.
            </p>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="col-span-1">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider mb-4`}>
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors duration-200`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              © {currentYear} EduChain. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex space-x-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-lg ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'} transition-colors duration-200`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;