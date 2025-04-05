import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaUpload, FaPlus, FaTrash } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useEduChain } from '../hooks/useEduChain';
import { ethers } from 'ethers';
import { uploadFile, uploadJSON } from '../utils/web3storage';

const CreateCourse = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { createCourse } = useEduChain();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    difficulty: 'beginner',
    sections: [
      {
        title: '',
        description: '',
        video: null,
        materials: null,
        duration: 0,
        videoName: '',
        materialsName: ''
      }
    ],
    thumbnail: null,
    thumbnailName: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, field, sectionIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;
  
    try {
      // Assume validateFile is defined elsewhere
      // validateFile(file);
      
      if (field === 'thumbnail') {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
        
        setFormData(prev => ({
          ...prev,
          thumbnail: file,
          thumbnailName: file.name
        }));
      } else if (sectionIndex !== null) {
        setFormData(prev => ({
          ...prev,
          sections: prev.sections.map((section, idx) =>
            idx === sectionIndex ? { 
              ...section, 
              [field]: file,
              [`${field}Name`]: file.name 
            } : section
          )
        }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const removeSection = (index) => {
    if (formData.sections.length <= 1) {
      setError("You must have at least one section");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, idx) => idx !== index)
    }));
  };
  
  const moveSection = (index, direction) => {
    const newSections = [...formData.sections];
    if (direction === 'up' && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    
    setFormData(prev => ({
      ...prev,
      sections: newSections
    }));
  };

  const updateSectionField = (index, field, value) => {
    const newSections = [...formData.sections];
    newSections[index][field] = value;
    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const resetForm = () => {
    if (confirm("Are you sure you want to reset the form? All progress will be lost.")) {
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        difficulty: 'beginner',
        sections: [
          {
            title: '',
            description: '',
            video: null,
            materials: null,
            duration: 0,
            videoName: '',
            materialsName: ''
          }
        ],
        thumbnail: null,
        thumbnailName: ''
      });
      setPreviewUrl(null);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.price) {
        throw new Error('Please fill in all required fields');
      }

      // Upload thumbnail
      let thumbnailUrl = '';
      if (formData.thumbnail) {
        setUploadProgress(10);
        console.log('Uploading thumbnail...');
        thumbnailUrl = await uploadFile(formData.thumbnail);
      }

      // Upload sections content
      setUploadProgress(30);
      console.log('Uploading section content...');
      const sectionsWithHashes = await Promise.all(
        formData.sections.map(async (section, index) => {
          const sectionData = {
            title: section.title,
            description: section.description,
            duration: section.duration || 0
          };

          if (section.video) {
            console.log(`Uploading video for section ${index + 1}...`);
            sectionData.videoHash = await uploadFile(section.video);
          }

          if (section.materials) {
            console.log(`Uploading materials for section ${index + 1}...`);
            sectionData.materialHash = await uploadFile(section.materials);
          }

          setUploadProgress(30 + ((index + 1) / formData.sections.length) * 40);
          return sectionData;
        })
      );

      // Create and upload metadata
      setUploadProgress(80);
      console.log('Creating course metadata...');
      const metadata = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        thumbnail: thumbnailUrl,
        category: formData.category,
        difficulty: formData.difficulty,
        sections: sectionsWithHashes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: "1.0"
      };

      console.log('Uploading metadata to IPFS...');
      const metadataUrl = await uploadJSON(metadata);
      setUploadProgress(90);

      // Create course on blockchain
      console.log('Creating course on blockchain...');
      const tx = await createCourse({
        title: formData.title,
        description: formData.description,
        price: ethers.parseEther(formData.price),
        contentURI: metadataUrl,
        sections: sectionsWithHashes.map(section => ({
          title: section.title,
          description: section.description,
          videoURI: section.videoHash || '',
          materialURI: section.materialHash || '',
          duration: section.duration
        }))
      });

      await tx.wait();
      setUploadProgress(100);
      alert('Course created successfully!');
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Create New Course</h1>
          <p className={`${theme.text.secondary} max-w-2xl mx-auto`}>
            Share your knowledge by creating a new course
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700">×</button>
          </div>
        )}

        {loading && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-center mt-2">{`Uploading... ${uploadProgress}%`}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className={`${theme.card} rounded-lg p-6 shadow-md`}>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Course Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border text-black p-2`}
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="price">
                  Price (ETH) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border p-2 text-black`}
                  placeholder="0.05"
                  step="0.001"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border p-2  text-black`}
                >
                  <option value="">Select a category</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="personal-development">Personal Development</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="difficulty">
                  Difficulty Level
                </label>
                <div className="flex gap-3">
                  {['beginner', 'intermediate', 'advanced'].map(level => (
                    <label key={level} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="difficulty"
                        value={level}
                        checked={formData.difficulty === level}
                        onChange={handleInputChange}
                        className="mr-1"
                      />
                      <span className="capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border p-2  text-black`}
                  rows="4"
                  placeholder="Describe your course in detail"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Thumbnail</label>
                <div className={`border-2 border-dashed rounded-md p-4 ${theme.borderColor} hover:border-blue-400 transition duration-300`}>
                  <div className="flex items-center justify-center flex-col">
                    {previewUrl ? (
                      <div className="relative mb-3">
                        <img 
                          src={previewUrl} 
                          alt="Thumbnail preview" 
                          className="w-48 h-32 object-cover rounded-md" 
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            setPreviewUrl(null);
                            setFormData(prev => ({ ...prev, thumbnail: null, thumbnailName: '' }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <FaUpload className="text-gray-400 text-3xl mb-2" />
                    )}
                    
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300">
                      {formData.thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'thumbnail')}
                        className="hidden"
                      />
                    </label>
                    {formData.thumbnailName && (
                      <p className="mt-2 text-sm text-gray-500 truncate max-w-full">
                        {formData.thumbnailName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Sections */}
          <div className={`${theme.card} rounded-lg p-6 shadow-md`}>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Course Content</h2>
            
            {formData.sections.map((section, index) => (
              <div key={index} className={`mb-6 ${index > 0 ? 'border-t pt-6' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    Section {index + 1}
                    {section.title && <span className="text-gray-500 ml-2">- {section.title}</span>}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      className={`p-1 rounded ${index === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === formData.sections.length - 1}
                      className={`p-1 rounded ${index === formData.sections.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                      title="Move Down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="text-red-500 p-1 rounded hover:bg-red-100"
                      title="Remove Section"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Section Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSectionField(index, 'title', e.target.value)}
                      className={`w-full rounded-md border p-2  text-black`}
                      placeholder="E.g., Introduction to the Course"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Section Description</label>
                    <textarea
                      value={section.description || ''}
                      onChange={(e) => updateSectionField(index, 'description', e.target.value)}
                      className={`w-full rounded-md border p-2  text-black`}
                      rows="2"
                      placeholder="What will students learn in this section?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Video</label>
                    <div className={`border-2 border-dashed rounded-md p-3 ${theme.borderColor} hover:border-blue-400 transition duration-300`}>
                      <div className="flex items-center justify-center">
                        <label className="cursor-pointer flex items-center gap-2 w-full">
                          <FaUpload className="text-gray-400" />
                          <span className={`${section.videoName ? '' : 'text-gray-400'} truncate`}>
                            {section.videoName || 'Upload Video'}
                          </span>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleFileChange(e, 'video', index)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={section.duration || ''}
                      onChange={(e) => updateSectionField(index, 'duration', Number(e.target.value))}
                      className={`w-full rounded-md border p-2  text-black`}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Materials</label>
                    <div className={`border-2 border-dashed rounded-md p-3 ${theme.borderColor} hover:border-blue-400 transition duration-300`}>
                      <div className="flex items-center justify-center">
                        <label className="cursor-pointer flex items-center gap-2 w-full">
                          <FaUpload className="text-gray-400" />
                          <span className={`${section.materialsName ? '' : 'text-gray-400'} truncate`}>
                            {section.materialsName || 'Upload Materials (PDF, ZIP, etc.)'}
                          </span>
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(e, 'materials', index)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                sections: [...prev.sections, { 
                  title: '', 
                  description: '', 
                  video: null, 
                  materials: null, 
                  duration: 0,
                  videoName: '',
                  materialsName: ''
                }]
              }))}
              className={`w-full ${theme.borderColor} rounded-lg p-3 border-2 border-dashed flex items-center justify-center gap-2 hover:border-blue-400 transition duration-300`}
            >
              <FaPlus />
              Add New Section
            </button>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 bg-gray-500 text-white rounded-lg p-3 hover:bg-gray-600 transition duration-300"
            >
              Reset Form
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700 disabled:opacity-50 transition duration-300"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Creating Course...
                </span>
              ) : (
                'Create Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;