// src/utils/ipfsStorage.js
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// Infura IPFS configuration
const projectId = import.meta.env.VITE_INFURA_PROJECT_ID;
const projectSecret = import.meta.env.VITE_INFURA_PROJECT_SECRET;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

export const uploadFileToIPFS = async (file) => {
  try {
    const fileBuffer = await file.arrayBuffer();
    const result = await client.add(Buffer.from(fileBuffer));
    console.log('File uploaded to IPFS:', result.path);
    return `ipfs://${result.path}`;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error(`Failed to upload file to IPFS: ${error.message}`);
  }
};

export const uploadJSONToIPFS = async (jsonData) => {
  try {
    const result = await client.add(JSON.stringify(jsonData));
    console.log('JSON uploaded to IPFS:', result.path);
    return `ipfs://${result.path}`;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
  }
};

export const getIPFSUrl = (ipfsUri) => {
  if (!ipfsUri) return null;
  const hash = ipfsUri.replace('ipfs://', '');
  return `https://ipfs.io/ipfs/${hash}`;
};

export const checkIPFSStatus = async (hash) => {
  try {
    const response = await fetch(`https://ipfs.io/ipfs/${hash}`);
    return response.ok;
  } catch (error) {
    return false;
  }
};