import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JobItem } from '../types/job';

interface JobSaveContextProps {
  savedJobs: string[]; // Danh sách uuid của các công việc đã lưu
  savedJobItems: JobItem[]; // Danh sách đầy đủ thông tin công việc đã lưu
  toggleSaveJob: (job: JobItem) => void;
  isSaved: (uuid: string) => boolean;
  clearSavedJobs: () => void;
}

const JobSaveContext = createContext<JobSaveContextProps | undefined>(undefined);

export const JobSaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [savedJobItems, setSavedJobItems] = useState<JobItem[]>([]);

  // Load saved jobs from storage when component mounts
  useEffect(() => {
    const loadSavedJobs = async () => {
      try {
        const storedJobs = await AsyncStorage.getItem('savedJobs');
        const storedJobItems = await AsyncStorage.getItem('savedJobItems');
        
        if (storedJobs) {
          setSavedJobs(JSON.parse(storedJobs));
        }
        
        if (storedJobItems) {
          setSavedJobItems(JSON.parse(storedJobItems));
        }
      } catch (error) {
        console.error('Failed to load saved jobs', error);
      }
    };

    loadSavedJobs();
  }, []);

  // Save to AsyncStorage whenever the lists change
  useEffect(() => {
    const saveToStorage = async () => {
      try {
        await AsyncStorage.setItem('savedJobs', JSON.stringify(savedJobs));
        await AsyncStorage.setItem('savedJobItems', JSON.stringify(savedJobItems));
      } catch (error) {
        console.error('Failed to save jobs', error);
      }
    };

    saveToStorage();
  }, [savedJobs, savedJobItems]);

  // Toggle job saved status
  const toggleSaveJob = (job: JobItem) => {
    if (savedJobs.includes(job.uuid)) {
      // Remove job from saved list
      setSavedJobs(savedJobs.filter(id => id !== job.uuid));
      setSavedJobItems(savedJobItems.filter(item => item.uuid !== job.uuid));
    } else {
      // Add job to saved list
      setSavedJobs([...savedJobs, job.uuid]);
      setSavedJobItems([...savedJobItems, job]);
    }
  };

  // Check if a job is saved
  const isSaved = (uuid: string): boolean => {
    return savedJobs.includes(uuid);
  };

  // Clear all saved jobs
  const clearSavedJobs = () => {
    setSavedJobs([]);
    setSavedJobItems([]);
  };

  return (
    <JobSaveContext.Provider 
      value={{ 
        savedJobs, 
        savedJobItems, 
        toggleSaveJob, 
        isSaved,
        clearSavedJobs
      }}
    >
      {children}
    </JobSaveContext.Provider>
  );
};

// Custom hook to use the JobSave context
export const useJobSave = () => {
  const context = useContext(JobSaveContext);
  
  if (context === undefined) {
    throw new Error('useJobSave must be used within a JobSaveProvider');
  }
  
  return context;
};