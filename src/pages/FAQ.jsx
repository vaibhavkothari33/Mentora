import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

const FAQ = () => {
  const { darkMode } = useTheme();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is Mentora?",
      answer: "Mentora is a blockchain-based education platform that offers courses in Web3 development, smart contracts, and blockchain technology."
    },
    {
      question: "How do NFT certificates work?",
      answer: "Upon course completion, you receive a unique NFT certificate that verifies your achievement on the blockchain, providing immutable proof of your skills."
    },
    {
      question: "Can I become an instructor?",
      answer: "Yes! If you're an expert in blockchain technology or Web3 development, you can apply to become an instructor and create your own courses."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
    >
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} cursor-pointer`}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{faq.question}</h2>
                <span className="text-2xl">{openIndex === index ? '−' : '+'}</span>
              </div>
              {openIndex === index && (
                <motion.p 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  {faq.answer}
                </motion.p>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FAQ; 