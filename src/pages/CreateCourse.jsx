import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaUpload, FaPlus, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import ipfsService from '../utils/ipfsStorage';
import { useMentoraContract } from '../hooks/useMentoraContract';

const CreateCourse = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { getClient } = useMentoraContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    difficulty: 1, // 1: beginner, 2: intermediate, 3: advanced
    duration: 0, // Duration in minutes
    thumbnail: null,
    thumbnailName: '',
    introVideo: null,
    introVideoName: '',
    modules: [
      {
        title: '',
        video: null,
        videoName: '',
        materials: [],
        materialNames: []
      }
    ]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModuleChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === index ? { ...module, [field]: value } : module
      )
    }));
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          title: '',
          video: null,
          videoName: '',
          materials: [],
          materialNames: []
        }
      ]
    }));
  };

  const removeModule = (index) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const moveModuleUp = (index) => {
    if (index === 0) return;
    setFormData(prev => {
      const newModules = [...prev.modules];
      const temp = newModules[index];
      newModules[index] = newModules[index - 1];
      newModules[index - 1] = temp;
      return { ...prev, modules: newModules };
    });
  };

  const moveModuleDown = (index) => {
    if (index === formData.modules.length - 1) return;
    setFormData(prev => {
      const newModules = [...prev.modules];
      const temp = newModules[index];
      newModules[index] = newModules[index + 1];
      newModules[index + 1] = temp;
      return { ...prev, modules: newModules };
    });
  };

  const handleFileUpload = async (file, type) => {
    try {
      let cid;
      if (type === 'thumbnail') {
        cid = await ipfsService.uploadImage(file, (progress) => {
          setUploadProgress(Math.round(progress));
        });
      } else if (type === 'video') {
        cid = await ipfsService.uploadVideo(file, (progress) => {
          setUploadProgress(Math.round(progress));
        });
      } else if (type === 'material') {
        cid = await ipfsService.uploadFile(file, (progress) => {
          setUploadProgress(Math.round(progress));
        });
      }
      return cid;
    } catch (err) {
      console.error(`Error uploading ${type}:`, err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.price || !formData.category) {
        throw new Error('Please fill in all required fields');
      }

      // Upload thumbnail
      setUploadProgress(10);
      const thumbnailIpfsHash = await handleFileUpload(formData.thumbnail, 'thumbnail');
      setUploadProgress(30);

      // Upload intro video
      const introVideoIpfsHash = await handleFileUpload(formData.introVideo, 'video');
      setUploadProgress(50);

      // Upload modules and materials
      const moduleIpfsHashes = [];
      const moduleTitles = [];
      const materialIpfsHashes = {};

      for (let i = 0; i < formData.modules.length; i++) {
        const module = formData.modules[i];
        
        // Upload module video
        const videoHash = await handleFileUpload(module.video, 'video');
        moduleIpfsHashes.push(videoHash);
        moduleTitles.push(module.title);

        // Upload materials for this module
        const materialHashes = [];
        for (const material of module.materials) {
          const materialHash = await handleFileUpload(material, 'material');
          materialHashes.push(materialHash);
        }
        materialIpfsHashes[i] = materialHashes;
      }
      setUploadProgress(80);

      // Create course content metadata
      const courseContent = {
        introVideoIpfsHash,
        moduleIpfsHashes,
        moduleTitles,
        materialIpfsHashes,
        materialCount: Object.values(materialIpfsHashes).flat().length
      };

      // Upload course content to IPFS
      const contentIpfsHash = await ipfsService.uploadJSON(courseContent);
      setUploadProgress(90);

      // Create course on blockchain
      const client = getClient();
      
      await client.createCourse(
        formData.title,
        formData.description,
        formData.category,
        thumbnailIpfsHash,
        contentIpfsHash,
        formData.difficulty,
        formData.duration,
        formData.price,
        formData.modules.length
      );
      
      setUploadProgress(100);
      navigate('/courses');
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text.primary} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Course</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Course Information */}
          <div className={`${theme.card} p-6 rounded-xl border ${theme.border}`}>
            <h2 className="text-xl font-semibold mb-4">Course Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border p-2 bg-gray-800 text-white`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (ETH) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border p-2 bg-gray-800 text-white`}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border p-2 bg-gray-800 text-white`}
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border p-2 bg-gray-800 text-white`}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="personal-development">Personal Development</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Difficulty Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border p-2 bg-gray-800 text-white`}
                  required
                >
                  <option value={1}>Beginner</option>
                  <option value={2}>Intermediate</option>
                  <option value={3}>Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border p-2 bg-gray-800 text-white`}
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className={`${theme.card} p-6 rounded-xl border ${theme.border}`}>
            <h2 className="text-xl font-semibold mb-4">Course Thumbnail</h2>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setFormData(prev => ({
                    ...prev,
                    thumbnail: file,
                    thumbnailName: file.name
                  }));
                  setPreviewUrl(URL.createObjectURL(file));
                }}
                className="hidden"
                id="thumbnail"
                required
              />
              <label
                htmlFor="thumbnail"
                className={`flex-1 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${theme.border}`}
              >
                <div className="text-center">
                  <FaUpload className="mx-auto text-2xl mb-2" />
                  <p>Click to upload thumbnail</p>
                  {formData.thumbnailName && (
                    <p className="text-sm mt-2">{formData.thumbnailName}</p>
                  )}
                </div>
              </label>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Thumbnail preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Intro Video Upload */}
          <div className={`${theme.card} p-6 rounded-xl border ${theme.border}`}>
            <h2 className="text-xl font-semibold mb-4">Intro Video</h2>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setFormData(prev => ({
                    ...prev,
                    introVideo: file,
                    introVideoName: file.name
                  }));
                }}
                className="hidden"
                id="introVideo"
                required
              />
              <label
                htmlFor="introVideo"
                className={`flex-1 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${theme.border}`}
              >
                <div className="text-center">
                  <FaUpload className="mx-auto text-2xl mb-2" />
                  <p>Click to upload intro video</p>
                  {formData.introVideoName && (
                    <p className="text-sm mt-2">{formData.introVideoName}</p>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Modules */}
          <div className={`${theme.card} p-6 rounded-xl border ${theme.border}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Course Modules</h2>
              <button
                type="button"
                onClick={addModule}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${theme.primary} text-white`}
              >
                <FaPlus />
                <span>Add Module</span>
              </button>
            </div>

            <div className="space-y-6">
              {formData.modules.map((module, index) => (
                <div key={index} className={`p-4 rounded-lg border ${theme.border}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium">Module {index + 1}</h3>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => moveModuleUp(index)}
                        disabled={index === 0}
                        className={`text-blue-500 hover:text-blue-700 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Move Up"
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveModuleDown(index)}
                        disabled={index === formData.modules.length - 1}
                        className={`text-blue-500 hover:text-blue-700 ${index === formData.modules.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Move Down"
                      >
                        <FaArrowDown />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeModule(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove Module"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Module Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={module.title}
                        onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                        className={`w-full rounded-md border p-2 bg-gray-800 text-white`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Module Video <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          handleModuleChange(index, 'video', file);
                          handleModuleChange(index, 'videoName', file.name);
                        }}
                        className="hidden"
                        id={`module-video-${index}`}
                        required
                      />
                      <label
                        htmlFor={`module-video-${index}`}
                        className={`block w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${theme.border}`}
                      >
                        <div className="text-center">
                          <FaUpload className="mx-auto text-2xl mb-2" />
                          <p>Click to upload module video</p>
                          {module.videoName && (
                            <p className="text-sm mt-2">{module.videoName}</p>
                          )}
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Additional Materials
                      </label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          handleModuleChange(index, 'materials', [...module.materials, ...files]);
                          handleModuleChange(index, 'materialNames', [
                            ...module.materialNames,
                            ...files.map(f => f.name)
                          ]);
                        }}
                        className="hidden"
                        id={`module-materials-${index}`}
                      />
                      <label
                        htmlFor={`module-materials-${index}`}
                        className={`block w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${theme.border}`}
                      >
                        <div className="text-center">
                          <FaUpload className="mx-auto text-2xl mb-2" />
                          <p>Click to upload materials</p>
                          {module.materialNames.length > 0 && (
                            <p className="text-sm mt-2">
                              {module.materialNames.length} files selected
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r ${theme.primary} hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Creating Course...
                </span>
              ) : (
                'Create Course'
              )}
            </button>
          </div>

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Upload Progress</span>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;