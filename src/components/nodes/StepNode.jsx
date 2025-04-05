// src/components/nodes/StepNode.jsx
import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { FaLightbulb, FaBook, FaVideo, FaTrophy } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const StepNode = ({ data, selected }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'required': return 'from-blue-500 to-indigo-500';
      case 'recommended': return 'from-emerald-500 to-teal-500';
      case 'optional': return 'from-amber-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'concept': return <FaLightbulb className="text-yellow-400" />;
      case 'practice': return <FaBook className="text-blue-400" />;
      case 'video': return <FaVideo className="text-red-400" />;
      case 'project': return <FaTrophy className="text-purple-400" />;
      default: return <FaLightbulb className="text-gray-400" />;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: selected ? 1.05 : 1, 
        opacity: 1,
        boxShadow: selected ? '0 0 0 2px rgba(99, 102, 241, 0.5)' : 'none'
      }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-500 w-3 h-3" />
      
      <motion.div
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          ${theme.card} rounded-xl shadow-lg overflow-hidden cursor-pointer
          transition-all duration-300 hover:shadow-2xl
          border ${theme.border} min-w-[280px]
        `}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getStatusColor(data.status)} p-1`} />
        
        <div className="p-4 space-y-3">
          {/* Title Section */}
          <motion.div layout className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${theme.card}`}>
              {getIcon(data.type)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{data.title}</h3>
              <p className={`text-sm ${theme.text.secondary}`}>
                {data.duration}
              </p>
            </div>
          </motion.div>

          {/* Expandable Content */}
          <motion.div
            layout
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            {isExpanded && (
              <div className="space-y-3 pt-3">
                {/* Description */}
                <p className={`text-sm ${theme.text.secondary}`}>
                  {data.description}
                </p>

                {/* Topics */}
                {data.topics && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Topics:</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.topics.map((topic, index) => (
                        <span
                          key={index}
                          className={`
                            text-xs px-2 py-1 rounded-full
                            bg-gradient-to-r from-indigo-500/10 to-purple-500/10
                            ${theme.text.secondary}
                          `}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {data.resources && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Resources:</h4>
                    <div className="space-y-2">
                      {data.resources.map((resource, index) => (
                        <motion.a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`
                            flex items-center space-x-2 text-sm p-2 rounded-lg
                            ${theme.card} hover:${theme.hover.background}
                            transition-colors duration-200
                          `}
                          whileHover={{ scale: 1.02 }}
                        >
                          {getIcon(resource.type)}
                          <span>{resource.name}</span>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 w-3 h-3" />
    </motion.div>
  );
};

export default StepNode;