// src/utils/validation.js
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const validateFile = (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  return true;
};

export const validateCourseData = (formData) => {
  if (!formData.title.trim()) {
    throw new Error('Course title is required');
  }

  if (!formData.description.trim()) {
    throw new Error('Course description is required');
  }

  if (!formData.price || formData.price <= 0) {
    throw new Error('Course price must be greater than 0');
  }

  if (!formData.sections || formData.sections.length === 0) {
    throw new Error('Course must have at least one section');
  }

  formData.sections.forEach((section, index) => {
    if (!section.title.trim()) {
      throw new Error(`Section ${index + 1} title is required`);
    }
  });

  return true;
};
