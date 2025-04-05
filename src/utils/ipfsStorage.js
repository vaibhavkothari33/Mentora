import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// IPFS configuration
const projectId = import.meta.env.VITE_INFURA_PROJECT_ID;
const projectSecret = import.meta.env.VITE_INFURA_PROJECT_SECRET;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

class IPFSService {
  constructor() {
    this.client = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth,
      },
    });
  }

  async uploadFile(file, onProgress) {
    try {
      const fileBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);
      
      const result = await this.client.add(buffer, {
        progress: (prog) => {
          if (onProgress) {
            onProgress(prog);
          }
        }
      });
      
      return result.path; // Return just the hash/CID
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
  }

  async uploadVideo(file, onProgress) {
    // Validate video file
    if (!file.type.startsWith('video/')) {
      throw new Error('File must be a video');
    }

    // Check file size (100MB limit)
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      throw new Error('Video file size must be less than 100MB');
    }

    return this.uploadFile(file, onProgress);
  }

  async uploadImage(file, onProgress) {
    // Validate image file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Check file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new Error('Image file size must be less than 10MB');
    }

    return this.uploadFile(file, onProgress);
  }

  async uploadJSON(data) {
    try {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const file = new File([blob], 'data.json');
      const result = await this.client.add(file);
      return result.path;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
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
      const chunks = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Error retrieving file from IPFS:', error);
      throw new Error(`Failed to retrieve file from IPFS: ${error.message}`);
    }
  }
}

// Create a singleton instance
const ipfsService = new IPFSService();
export default ipfsService;