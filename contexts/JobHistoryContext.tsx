import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JobItem } from '../types/job';

interface JobHistoryContextType {
  viewedJobs: JobItem[];
  addToHistory: (job: JobItem) => void;
  clearHistory: () => void;
}

const JobHistoryContext = createContext<JobHistoryContextType | undefined>(undefined);

const STORAGE_KEY = 'job_history';
const MAX_HISTORY_ITEMS = 10; // Giới hạn lịch sử xem để không quá nhiều

export const JobHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewedJobs, setViewedJobs] = useState<JobItem[]>([]);

  // Tải lịch sử xem từ AsyncStorage khi component mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyJson = await AsyncStorage.getItem(STORAGE_KEY);
        if (historyJson) {
          setViewedJobs(JSON.parse(historyJson));
        }
      } catch (error) {
        console.error('Lỗi khi tải lịch sử công việc:', error);
      }
    };

    loadHistory();
  }, []);

  // Lưu lịch sử xem vào AsyncStorage mỗi khi cập nhật
  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(viewedJobs));
      } catch (error) {
        console.error('Lỗi khi lưu lịch sử công việc:', error);
      }
    };

    if (viewedJobs.length > 0) {
      saveHistory();
    }
  }, [viewedJobs]);

  // Thêm công việc vào lịch sử xem
  const addToHistory = (job: JobItem) => {
    setViewedJobs(prevJobs => {
      // Kiểm tra xem công việc đã có trong lịch sử chưa
      const jobExists = prevJobs.some(j => j.uuid === job.uuid);
      
      if (jobExists) {
        // Nếu đã có, đưa nó lên đầu danh sách (xóa cũ, thêm mới vào đầu)
        const filteredJobs = prevJobs.filter(j => j.uuid !== job.uuid);
        return [job, ...filteredJobs];
      } else {
        // Nếu chưa có, thêm vào đầu và giới hạn số lượng
        const newJobs = [job, ...prevJobs];
        return newJobs.slice(0, MAX_HISTORY_ITEMS);
      }
    });
  };

  // Xóa lịch sử xem
  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setViewedJobs([]);
    } catch (error) {
      console.error('Lỗi khi xóa lịch sử công việc:', error);
    }
  };

  return (
    <JobHistoryContext.Provider value={{ viewedJobs, addToHistory, clearHistory }}>
      {children}
    </JobHistoryContext.Provider>
  );
};

// Custom hook để sử dụng context
export const useJobHistory = () => {
  const context = useContext(JobHistoryContext);
  if (context === undefined) {
    throw new Error('useJobHistory phải được sử dụng trong JobHistoryProvider');
  }
  return context;
};