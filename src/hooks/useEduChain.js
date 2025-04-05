// src/hooks/useEduChain.js
import { useState, useEffect } from 'react';
import { getContract } from '../config/contract';
// import { ethers } from 'ethers';

export const useEduChain = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        const eduChain = await getContract();
        setContract(eduChain);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initContract();
  }, []);

  const createCourse = async (courseData) => {
    try {
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.createCourse(
        courseData.title,
        courseData.description,
        courseData.price,
        courseData.contentURI,
        courseData.sections
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === 'CourseCreated');
      return event.args.courseId;
    } catch (err) {
      console.error('Error creating course:', err);
      throw err;
    }
  };

  const enrollInCourse = async (courseId, price) => {
    try {
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.enrollInCourse(courseId, {
        value: price
      });

      await tx.wait();
      return true;
    } catch (err) {
      console.error('Error enrolling in course:', err);
      throw err;
    }
  };

  const getCourse = async (courseId) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.getCourse(courseId);
    } catch (err) {
      console.error('Error getting course:', err);
      throw err;
    }
  };

  return {
    contract,
    loading,
    error,
    createCourse,
    enrollInCourse,
    getCourse
  };
};