import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const CONTEXT_STORAGE_KEY = 'chat_context';

/**
 * Custom hook for managing chat functionality with an AI agent
 * @returns {Object} Chat state and utility functions
 */
export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [context, setContext] = useState(() => {
    const savedContext = localStorage.getItem(CONTEXT_STORAGE_KEY);
    return savedContext || '';
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const [lastLogVersion, setLastLogVersion] = useState(0);
  const [lastLogGuid, setLastLogGuid] = useState(null);
  const [logProgress, setLogProgress] = useState(0);
  const [logProgressActive, setLogProgressActive] = useState(false);

  const pollingIntervalRef = useRef(null);
  const shortIntervalRef = useRef(25);
  const longIntervalRef = useRef(250);
  const shortIntervalPeriodRef = useRef(100);
  const shortIntervalCountRef = useRef(0);
  const isInitialMount = useRef(true);

  // Save context to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CONTEXT_STORAGE_KEY, context);
  }, [context]);

  // Generate a unique ID for messages
  const generateGUID = useCallback(() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }, []);

  // Send a message to the AI agent
  const sendMessage = useCallback(async (text) => {
    try {
      const messageId = generateGUID();
      
      // Add user message to the chat
      const userMessage = {
        id: messageId,
        type: 'user',
        heading: '',
        content: text,
        temp: false
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Send message to API
      const response = await fetch(`${API_URL}/message_async`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          context,
          message_id: messageId
        })
      });

      const data = await response.json();
      console.log("Send message response:", data);
      
      if (data && data.context) {
        setContext(data.context);
      }
      
      return messageId;
    } catch (err) {
      setError(`Error sending message: ${err.message}`);
      throw err;
    }
  }, [context, generateGUID]);

  // Poll for new messages from the AI agent
  const poll = useCallback(async () => {
    let updated = false;
    
    try {
      const response = await fetch(`${API_URL}/poll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          log_from: lastLogVersion,
          context 
        })
      });

      const data = await response.json();
      console.log("Poll response:", data);
      
      if (!context && data.context) {
        setContext(data.context);
      }
      
      if (data.context !== context) {
        return false; // Skip late polls after context change
      }
      
      if (lastLogGuid !== data.log_guid) {
        setMessages([]);
        setLastLogVersion(0);
      }
      
      if (lastLogVersion !== data.log_version) {
        updated = true;
        
        // Add new messages to the chat
        const newMessages = data.logs.map(log => ({
          id: log.id || log.no,
          type: log.type,
          heading: log.heading,
          content: log.content,
          temp: log.temp,
          kvps: log.kvps
        }));
        
        setMessages(prevMessages => [...prevMessages, ...newMessages]);
      }

      // Update progress
      setLogProgress(data.log_progress || 0);
      setLogProgressActive(data.log_progress_active || false);

      // Update connection status
      setIsConnected(true);

      // Update log version and guid
      setLastLogVersion(data.log_version);
      setLastLogGuid(data.log_guid);
      
      return updated;
    } catch (err) {
      console.error('Polling error:', err);
      setIsConnected(false);
      return false;
    }
  }, [context, lastLogVersion, lastLogGuid]);

  // Start polling for updates
  const startPolling = useCallback(() => {
    if (isPolling) return;
    
    setIsPolling(true);
    
    const doPoll = async () => {
      let nextInterval = longIntervalRef.current;
      
      try {
        const result = await poll();
        if (result) {
          shortIntervalCountRef.current = shortIntervalPeriodRef.current;
        }
        if (shortIntervalCountRef.current > 0) {
          shortIntervalCountRef.current--;
        }
        nextInterval = shortIntervalCountRef.current > 0 ? shortIntervalRef.current : longIntervalRef.current;
      } catch (err) {
        console.error('Polling error:', err);
      }
      
      pollingIntervalRef.current = setTimeout(doPoll, nextInterval);
    };
    
    doPoll();
  }, [isPolling, poll]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Start polling only once when component mounts
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      startPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, []); // Empty dependency array to run only once on mount

  return {
    messages,
    context,
    isConnected,
    isPolling,
    error,
    logProgress,
    logProgressActive,
    sendMessage,
    startPolling,
    stopPolling
  };
};