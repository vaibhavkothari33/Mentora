import { useState, useEffect, useCallback } from 'react';
import { AssignmentManagerClient } from '../utils/assignmentManager';

/**
 * Custom hook for managing the AssignmentManager client
 * @returns {Object} Client instance and utility functions
 */
export const useAssignmentManager = () => {
  const [client, setClient] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Initialize the client
  const initialize = useCallback((provider, contractAddress, account) => {
    try {
      if (!client) {
        const newClient = new AssignmentManagerClient(provider, contractAddress);
        newClient.setDefaultAccount(account);
        setClient(newClient);
        setIsInitialized(true);
        return newClient;
      }
      return client;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [client]);

  // Get the client instance, initializing if needed
  const getClient = useCallback(() => {
    if (!client) {
      try {
        // Get provider, address and account from window.ethereum
        const provider = window.ethereum;
        const contractAddress = import.meta.env.VITE_ASSIGNMENT_MANAGER_ADDRESS;
        const account = window.ethereum.selectedAddress;
        
        return initialize(provider, contractAddress, account);
      } catch (err) {
        setError(err.message);
        throw new Error('Failed to initialize AssignmentManager client: ' + err.message);
      }
    }
    return client;
  }, [client, initialize]);

  // Reset the client (useful for testing or when switching accounts)
  const reset = useCallback(() => {
    setClient(null);
    setIsInitialized(false);
    setError(null);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Optionally reset the client when the component unmounts
      // Uncomment the line below if you want this behavior
      // reset();
    };
  }, [reset]);

  return {
    client,
    isInitialized,
    error,
    initialize,
    getClient,
    reset,
  };
}; 