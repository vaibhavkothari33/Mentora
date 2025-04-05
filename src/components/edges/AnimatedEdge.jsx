// src/components/edges/AnimatedEdge.jsx    
import { BaseEdge, getBezierPath } from 'reactflow';
import { motion } from 'framer-motion';

const AnimatedEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge path={edgePath} markerEnd={markerEnd}>
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        fill="none"
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={2}
        stroke="url(#gradient)"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </BaseEdge>
  );
};

export default AnimatedEdge;