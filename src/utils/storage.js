// src/utils/storage.js
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

class StorageClient {
  constructor() {
   
    
    if (!projectId || !projectSecret) {
      console.error('Infura credentials:', { projectId: !!projectId, projectSecret: !!projectSecret });
      throw new Error(
        'Infura credentials not found. Make sure you have added VITE_INFURA_PROJECT_ID and VITE_INFURA_API_KEY_SECRET to your .env.local file.'
      );
    }

    console.log('Initializing IPFS client with credentials:', {
      projectId: projectId.substring(0, 4) + '...',
      projectSecret: projectSecret.substring(0, 4) + '...'
    });

    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

    try {
      this.client = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: auth
        }
      });
    } catch (error) {
      console.error('Failed to initialize Infura IPFS client:', error);
      throw new Error('Failed to initialize storage. Please check your credentials.');
    }
  }

  async uploadFile(file) {
    if (!this.client) {
      throw new Error('Storage client not initialized');
    }

    try {
      console.log('Starting file upload...', file.name);
      const fileBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);
      
      console.log('File size:', buffer.length / 1024 / 1024, 'MB');
      
      const result = await this.client.add(buffer, {
        progress: (prog) => console.log(`Upload progress: ${prog}`)
      });
      
      console.log('File uploaded successfully. CID:', result.path);
      return `ipfs://${result.path}`;
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        code: error.code
      });
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async uploadJSON(data) {
    if (!this.client) {
      throw new Error('Storage client not initialized');
    }

    try {
      console.log('Uploading JSON data...');
      const result = await this.client.add(JSON.stringify(data));
      console.log('JSON uploaded successfully. CID:', result.path);
      return `ipfs://${result.path}`;
    } catch (error) {
      console.error('Error uploading JSON:', error);
      throw new Error(`JSON upload failed: ${error.message}`);
    }
  }

  async uploadDirectory(files) {
    try {
      console.log('Uploading directory...');
      const cid = await this.client.add(files);
      console.log('Directory uploaded successfully. CID:', cid);
      return `ipfs://${cid}`;
    } catch (error) {
      console.error('Error uploading directory:', error);
      throw new Error(`Failed to upload directory: ${error.message}`);
    }
  }

  getIPFSUrl(ipfsUri) {
    if (!ipfsUri) return null;
    const cid = ipfsUri.replace('ipfs://', '');
    // Using Infura's dedicated gateway
    return `https://ipfs.infura.io/ipfs/${cid}`;
  }
}

export const verifyInfuraCredentials = () => {
  const projectId = import.meta.env.VITE_INFURA_PROJECT_ID;
  const projectSecret = import.meta.env.VITE_INFURA_API_KEY_SECRET;

  console.log('Verifying Infura credentials:', {
    projectIdExists: !!projectId,
    projectSecretExists: !!projectSecret,
    projectIdLength: projectId?.length,
    projectSecretLength: projectSecret?.length
  });

  return {
    isValid: !!(projectId && projectSecret),
    projectIdExists: !!projectId,
    projectSecretExists: !!projectSecret
  };
};

let storageInstance = null;

try {
  const credentials = verifyInfuraCredentials();
  if (credentials.isValid) {
    storageInstance = new StorageClient();
  } else {
    console.error('Invalid credentials:', credentials);
  }
} catch (error) {
  console.error('Failed to initialize storage client:', error);
}

export const storage = storageInstance;

export const uploadFile = async (file) => {
  if (!storage) {
    throw new Error('Storage not initialized. Please check your Infura credentials.');
  }
  return await storage.uploadFile(file);
};

export const uploadJSON = async (data) => {
  if (!storage) {
    throw new Error('Storage not initialized. Please check your Infura credentials.');
  }
  return await storage.uploadJSON(data);
};

export const getIPFSUrl = (ipfsUri) => {
  if (!storage) {
    throw new Error('Storage not initialized. Please check your Infura credentials.');
  }
  return storage.getIPFSUrl(ipfsUri);
};