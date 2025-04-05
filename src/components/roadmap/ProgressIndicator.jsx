// src/components/roadmap/ProgressIndicator.jsx
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ProgressIndicator = ({ currentStep, totalSteps, stages }) => {
  const { theme } = useTheme();
  
  // Calculate current stage
  let currentStageIndex = 0;
  let stepsCount = 0;
  for (let i = 0; i < stages.length; i++) {
    stepsCount += stages[i].steps.length;
    if (stepsCount > currentStep) {
      currentStageIndex = i;
      break;
    }
  }

  const currentStage = stages[currentStageIndex];
  const progress = (currentStep / (totalSteps - 1)) * 100;
  
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className={`${theme.card} rounded-xl shadow-lg px-6 py-4 border ${theme.border}`}>
        <div className="space-y-3">
          {/* Stage Title */}
          <div className="text-center">
            <h4 className="font-medium">{currentStage.title}</h4>
            <p className={`text-sm ${theme.text.secondary}`}>
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-1">
            {stages.map((stage, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStageIndex
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressIndicator;