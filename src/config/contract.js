// src/config/contract.js
import { ethers } from 'ethers';
import EduChainArtifact from '../contracts/EduChain.json';

// Get ABI from the artifact
const CONTRACT_ABI = EduChainArtifact.abi;

// Contract addresses for different networks
const CONTRACT_ADDRESSES = {
  // Replace with your deployed contract addresses
  sepolia: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
  mumbai: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
  localhost: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
};

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask!");
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Get the current network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // Get the appropriate contract address
    let contractAddress;
    switch (chainId) {
      case '0xaa36a7': // Sepolia
        contractAddress = CONTRACT_ADDRESSES.sepolia;
        break;
      case '0x13881': // Mumbai
        contractAddress = CONTRACT_ADDRESSES.mumbai;
        break;
      case '0x7a69': // Localhost
        contractAddress = CONTRACT_ADDRESSES.localhost;
        break;
      default:
        throw new Error('Unsupported network');
    }

    // Create provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Create contract instance
    const contract = new ethers.Contract(
      contractAddress,
      CONTRACT_ABI,
      signer
    );

    return contract;
  } catch (error) {
    console.error('Error initializing contract:', error);
    throw error;
  }
};