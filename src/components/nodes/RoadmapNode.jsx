// src/components/nodes/RoadmapNode.jsx
import { Handle, Position } from 'reactflow';
import { useTheme } from '../../context/ThemeContext';

const RoadmapNode = ({ data }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`${theme.card} rounded-xl shadow-lg p-4 border ${theme.border} min-w-[250px]`}>
      <Handle type="target" position={Position.Top} className="!bg-indigo-500" />
      
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">{data.title}</h3>
        <p className={`text-sm ${theme.text.secondary}`}>
          Duration: {data.duration}
        </p>
        
        {data.topics && data.topics.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-1">Topics:</h4>
            <ul className="text-sm space-y-1">
              {data.topics.map((topic, index) => (
                <li key={index} className={`${theme.text.secondary}`}>
                  • {topic}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.resources && data.resources.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-1">Resources:</h4>
            <ul className="text-sm space-y-1">
              {data.resources.map((resource, index) => (
                <li key={index} className="flex items-center">
                  <span className={`inline-block text-xs ${theme.text.accent} bg-indigo-100 dark:bg-indigo-900 rounded px-2 py-0.5 mr-2`}>
                    {resource.type}
                  </span>
                  <span className={theme.text.secondary}>{resource.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500" />
    </div>
  );
};

export default RoadmapNode;