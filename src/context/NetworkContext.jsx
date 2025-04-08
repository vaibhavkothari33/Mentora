import React, { createContext, useContext, useState } from 'react';

// Define available networks
export const NETWORKS = {
  OPENCAMPUS: {
    id: 656476,
    name: 'Open Campus Codex',
    icon: '🎓',
    rpc: 'https://rpc.open-campus-codex.gelato.digital',
    explorer: 'https://opencampus-codex.blockscout.com'
  },
  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia',
    icon: '🔷',
    rpc: 'https://rpc.sepolia.org',
    explorer: 'https://sepolia.etherscan.io'
  },
  ARB_SEPOLIA: {
    id: 421614,
    name: 'Arbitrum Sepolia',
    icon: '⚡',
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorer: 'https://sepolia-explorer.arbitrum.io'
  }
};

// Create context
const NetworkContext = createContext();

export const NetworkProvider = ({ children, defaultNetwork = 'OPENCAMPUS' }) => {
  const [requiredNetwork, setRequiredNetwork] = useState(defaultNetwork);
  
  // Function to change the required network
  const changeRequiredNetwork = (networkKey) => {
    if (NETWORKS[networkKey]) {
      setRequiredNetwork(networkKey);
    } else {
      console.error(`Network ${networkKey} is not defined`);
    }
  };
  
  return (
    <NetworkContext.Provider 
      value={{ 
        requiredNetwork, 
        changeRequiredNetwork,
        networkConfig: NETWORKS[requiredNetwork] 
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

// Custom hook for using the network context
export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};