// src/hooks/useEduChainEvents.js
import { useEffect, useState } from 'react';
import { useEduChain } from './useEduChain';

export const useEduChainEvents = () => {
  const { contract } = useEduChain();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!contract) return;

    const courseCreatedFilter = contract.filters.CourseCreated();
    const enrollmentFilter = contract.filters.CourseEnrollment();

    const handleCourseCreated = (courseId, instructor, title, price) => {
      setEvents(prev => [...prev, {
        type: 'CourseCreated',
        courseId: courseId.toString(),
        instructor,
        title,
        price: ethers.formatEther(price),
        timestamp: Date.now()
      }]);
    };

    const handleEnrollment = (courseId, student) => {
      setEvents(prev => [...prev, {
        type: 'CourseEnrollment',
        courseId: courseId.toString(),
        student,
        timestamp: Date.now()
      }]);
    };

    contract.on(courseCreatedFilter, handleCourseCreated);
    contract.on(enrollmentFilter, handleEnrollment);

    return () => {
      contract.off(courseCreatedFilter, handleCourseCreated);
      contract.off(enrollmentFilter, handleEnrollment);
    };
  }, [contract]);

  return events;
};