import { MiniMap } from 'reactflow';
import { useTheme } from '../../context/ThemeContext';

const RoadmapMiniMap = () => {
  const { theme, darkMode } = useTheme();

  return (
    <MiniMap
      nodeStrokeColor={darkMode ? '#4b5563' : '#e5e7eb'}
      nodeColor={darkMode ? '#1f2937' : '#ffffff'}
      nodeBorderRadius={8}
      maskColor={darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'}
    />
  );
};

export default RoadmapMiniMap;
