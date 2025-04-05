import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import Aurora from './Aurora';
const teamMembers = [
  {
    name: "Vaibhav Kothari",
    role: "Blockchain Developer",
    image: "https://media.licdn.com/dms/image/v2/D5603AQHeVQkIycTb2Q/profile-displayphoto-shrink_400_400/B56ZWkr_TqHoAg-/0/1742224750690?e=1749081600&v=beta&t=wqS-4KI6dTgBG7loYFEDg25pOWFS4oHLYxA8nFLForQ",
    bio: "FullStack Developer with experience in smart contract development.",
    social: {
      github: "https://github.com/vaibhavkothari33",
      linkedin: "https://linkedin.com/in/vaibhavkothari33",
      twitter: "https://twitter.com/vaibhavkotharii"
    }
  },
  {
    name: "Abhigya Krishna",
    role: "AI Developer",
    image: "https://media.licdn.com/dms/image/v2/D5603AQEOcbAFIY6wFg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1711817757493?e=1749081600&v=beta&t=3pKMrv9rYc7vjp3-Y_YZxypoKa9yOhbqaT3PXb9C39M",
    bio: "Backend Developer with experience in smart contract development.",
    social: {
      github: "https://github.com/abhigyakrishna",
      linkedin: "https://linkedin.com/in/abhigya-krishna",
      twitter: "https://twitter.com/sarahj"
    }
  },
  {
    name: "Navya Rathore",
    role: "Smart Contract Engineer",
    image: "https://media.licdn.com/dms/image/v2/D4E03AQGWDl890IIfjA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1693995536558?e=1749081600&v=beta&t=LcgTKeV3iKKRnZCoAHCpG6Ps7bneWz2GAHDI3zPSwFU",
    bio: "AI Developer with experience in smart contract development.",
    social: {
      github: "https://github.com/navyarathore",
      linkedin: "https://linkedin.com/in/navya-rathore",
      twitter: "https://twitter.com/michaelc"
    }
  },
  {
    name: "Shreya Tripathi",
    role: "Frontend Developer",
    image: "https://media.licdn.com/dms/image/v2/D5603AQGQlhOAMS7xxQ/profile-displayphoto-shrink_400_400/B56ZYH2JZrHoAg-/0/1743888357700?e=1749081600&v=beta&t=bmAp0EtSgiAPRpjPZOZFyxFDuhb2D9nL2x1Q9s04_BA",
    bio: "Creative designer focused on blockchain application interfaces.",
    social: {
      github: "https://github.com/ShreyaTripathi22",
      linkedin: "https://www.linkedin.com/in/shreya-tripathi-41355b322",
      twitter: "https://twitter.com/emilyr"
    }
  },
  {
    name: "Ashika Srivastava",
    role: "UI-UX Designer",
    image: "https://media.licdn.com/dms/image/v2/D5603AQE8yObE7zRCCg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1728052502186?e=1749081600&v=beta&t=4jPpjaEawR954ybi1ZZ7yXtDvUpbPAttQyI6fuKLA6Q",
    bio: "Full-stack developer specializing in Web3 integration.",
    social: {
      github: "https://github.com/ashika-30",
      linkedin: "https://www.linkedin.com/in/ashika-srivastava-00793827b",
      twitter: "https://twitter.com/davidk"
    }
  }
];

const TeamMemberCard = ({ member }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-gray-800 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
  >
    <div className="flex flex-col items-center">
      <img 
        src={member.image} 
        alt={member.name}
        className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-500"
      />
      <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
      <p className="text-blue-400 font-medium mb-2">{member.role}</p>
      <p className="text-gray-400 text-center mb-4">{member.bio}</p>
      <div className="flex space-x-4">
        <a href={member.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
          <FaGithub size={20} />
        </a>
        <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
          <FaLinkedin size={20} />
        </a>
        <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
          <FaTwitter size={20} />
        </a>
      </div>
    </div>
  </motion.div>
);

function About() {
  return (
    <div className='bg-gradient-to-b from-gray-900 to-black text-white min-h-screen'>
      {/* Hero Section */}
      <Aurora 
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={0.5}
        amplitude={3.0}
        speed={0.5}
      />  
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'
      >
        <div className='text-center mb-20'>
          <motion.h1 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className='text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text'
          >
            Welcome to Mentora
          </motion.h1>
          <motion.p 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className='text-xl text-gray-300 max-w-3xl mx-auto'
          >
            Revolutionizing education through blockchain technology
          </motion.p>
        </div>

        {/* About App Section */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-12 mb-20'>
          <motion.div
            initial={{ x: -50 }}
            whileInView={{ x: 0 }}
            className='space-y-6'
          >
            <h2 className='text-3xl font-bold mb-4'>About the Platform</h2>
            <p className='text-gray-300'>
              Mentora is a revolutionary blockchain-based learning platform that combines 
              decentralized education with verifiable credentials. Our platform enables 
              students to access high-quality courses while earning NFT certificates 
              that prove their achievements.
            </p>
            <ul className='space-y-4 text-gray-300'>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-blue-500 rounded-full mr-3'></span>
                Blockchain-verified certificates
              </li>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-blue-500 rounded-full mr-3'></span>
                Interactive learning experience
              </li>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-blue-500 rounded-full mr-3'></span>
                Decentralized content delivery
              </li>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-blue-500 rounded-full mr-3'></span>
                Smart contract-based achievements
              </li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ x: 50 }}
            whileInView={{ x: 0 }}
            className='bg-gray-800 rounded-xl p-6 shadow-xl'
          >
            <div className='aspect-w-16 aspect-h-9 rounded-lg overflow-hidden'>
              <img 
                src="https://i.ibb.co/tPc53Kjq/dashboard.png" 
                alt="EduChain Platform"
                className='object-cover'
              />
            </div>
          </motion.div>
        </div>

        {/* Team Section */}
        <div className='mb-20'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>Meet Our Team</h2>
            <p className='text-gray-300 max-w-2xl mx-auto'>
              We're a diverse team of developers, designers, and blockchain enthusiasts 
              working together to revolutionize education through technology.
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} member={member} />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'
        >
          {[
            { label: 'Active Students', value: '1000+' },
            { label: 'Courses Created', value: '50+' },
            { label: 'Certificates Issued', value: '500+' }
          ].map((stat, index) => (
            <div key={index} className='bg-gray-800 rounded-xl p-6'>
              <div className='text-3xl font-bold text-blue-400 mb-2'>{stat.value}</div>
              <div className='text-gray-400'>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default About;