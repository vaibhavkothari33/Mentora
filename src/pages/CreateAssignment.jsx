import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAssignmentManager } from '../hooks/useAssignmentManager';
import { FaPlus, FaSpinner } from 'react-icons/fa';

const CreateAssignment = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { getClient, error: contractError } = useAssignmentManager();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    question: '',
    evaluationCriteria: '',
    metaPrompt: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.question || !formData.evaluationCriteria || !formData.metaPrompt) {
        throw new Error('Please fill in all required fields');
      }

      // Create assignment
      const result = await getClient().createAssignment(
        formData.title,
        formData.description,
        formData.question,
        formData.evaluationCriteria,
        formData.metaPrompt
      );

      // Navigate to assignments page on success
      navigate('/assignments');
    } catch (err) {
      setError(err.message || 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text.primary} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Assignment</h1>
          <p className={`${theme.text.secondary}`}>
            Create a new assignment for your students. Fill in all the required details below.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {contractError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {contractError}
          </div>
        )}

        <form onSubmit={handleSubmit} className={`${theme.card} rounded-lg p-6 shadow-lg`}>
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-2 rounded-lg border ${theme.border} bg-gray-800 text-white`}
                placeholder="Enter assignment title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border ${theme.border} bg-gray-800 text-white`}
                placeholder="Enter assignment description"
              />
            </div>

            {/* Question */}
            <div>
              <label htmlFor="question" className="block text-sm font-medium mb-1">
                Question <span className="text-red-500">*</span>
              </label>
              <textarea
                id="question"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                required
                rows={6}
                className={`w-full px-4 py-2 rounded-lg border ${theme.border} bg-gray-800 text-white`}
                placeholder="Enter the assignment question"
              />
            </div>

            {/* Evaluation Criteria */}
            <div>
              <label htmlFor="evaluationCriteria" className="block text-sm font-medium mb-1">
                Evaluation Criteria <span className="text-red-500">*</span>
              </label>
              <textarea
                id="evaluationCriteria"
                name="evaluationCriteria"
                value={formData.evaluationCriteria}
                onChange={handleInputChange}
                required
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border ${theme.border} bg-gray-800 text-white`}
                placeholder="Enter evaluation criteria"
              />
            </div>

            {/* Meta Prompt */}
            <div>
              <label htmlFor="metaPrompt" className="block text-sm font-medium mb-1">
                Meta Prompt <span className="text-red-500">*</span>
              </label>
              <textarea
                id="metaPrompt"
                name="metaPrompt"
                value={formData.metaPrompt}
                onChange={handleInputChange}
                required
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border ${theme.border} bg-gray-800 text-white`}
                placeholder="Enter meta prompt"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center px-6 py-3 rounded-lg text-white font-medium ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" />
                  Create Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignment; 