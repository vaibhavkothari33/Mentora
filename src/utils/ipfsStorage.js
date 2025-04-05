import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_IPFS_SERVER}/api`

class IPFSService {
  async uploadFile(file, onProgress) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/upload/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            onProgress(progressEvent.loaded);
          }
        }
      });

      return response.data.hash;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error(`Failed to upload file to IPFS: ${error.response?.data?.error || error.message}`);
    }
  }

  async uploadVideo(file, onProgress) {
    try {
      // Validate video file
      if (!file.type.startsWith('video/')) {
        throw new Error('File must be a video');
      }
      
      // Check file size (100MB limit)
      const MAX_SIZE = 100 * 1024 * 1024; // 100MB
      if (file.size > MAX_SIZE) {
        throw new Error('Video file size must be less than 100MB');
      }

      const formData = new FormData();
      formData.append('video', file);

      const response = await axios.post(`${API_BASE_URL}/upload/video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            onProgress(progressEvent.loaded);
          }
        }
      });

      return response.data.hash;
    } catch (error) {
      console.error('Error uploading video to IPFS:', error);
      throw new Error(`Failed to upload video to IPFS: ${error.response?.data?.error || error.message}`);
    }
  }

  async uploadImage(file, onProgress) {
    try {
      // Validate image file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      // Check file size (10MB limit)
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        throw new Error('Image file size must be less than 10MB');
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            onProgress(progressEvent.loaded);
          }
        }
      });

      return response.data.hash;
    } catch (error) {
      console.error('Error uploading image to IPFS:', error);
      throw new Error(`Failed to upload image to IPFS: ${error.response?.data?.error || error.message}`);
    }
  }

  async uploadJSON(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/upload/json`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data.hash;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw new Error(`Failed to upload JSON to IPFS: ${error.response?.data?.error || error.message}`);
    }
  }

  getIPFSUrl(hash) {
    if (!hash) return '';
    return `https://ipfs.io/ipfs/${hash}`;
  }

  getIPFSGatewayUrl(hash) {
    if (!hash) return '';
    return `https://nftstorage.link/ipfs/${hash}`;
  }

  async retrieveFile(hash) {
    try {
      const response = await axios.get(`${API_BASE_URL}/retrieve/${hash}`, {
        responseType: 'arraybuffer'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error retrieving file from IPFS:', error);
      throw new Error(`Failed to retrieve file from IPFS: ${error.response?.data?.error || error.message}`);
    }
  }
}

// Create a singleton instance
const ipfsService = new IPFSService();
export default ipfsService;
