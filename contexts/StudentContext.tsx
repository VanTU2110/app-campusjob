import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getStudentProfile } from "../service/studentService";
import { DetailStudentResponse } from "../types/student";
import { useAuth } from "./AuthContext";

interface StudentContextType {
  student: DetailStudentResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearStudentData: () => void; // New function to explicitly clear student data
}

// Default context value with empty functions to avoid undefined errors
const defaultContextValue: StudentContextType = {
  student: null,
  loading: false,
  error: null,
  refetch: async () => {},
  clearStudentData: () => {},
};

const StudentContext = createContext<StudentContextType>(defaultContextValue);

export const StudentProvider = ({
  children,
  uuid: propUuid,
}: {
  children: React.ReactNode;
  uuid: string | null | undefined;
}) => {
  const { uuid: authUuid } = useAuth(); // Get the latest UUID from auth context
  const [student, setStudent] = useState<DetailStudentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  
  // Always prioritize auth context UUID as it's the most up-to-date
  const currentUuid = authUuid;
  
  // Clear student data function that can be called externally
  const clearStudentData = useCallback(() => {
    console.log("Explicitly clearing student data");
    setStudent(null);
    setError(null);
    setAttemptCount(0);
  }, []);

  // Reset student data when UUID changes
  useEffect(() => {
    console.log("UUID changed, resetting student data", { authUuid, propUuid });
    clearStudentData();
  }, [authUuid, clearStudentData]);

  // Use useCallback to avoid recreating fetchStudent
  const fetchStudent = useCallback(async () => {
    // Check if UUID exists
    if (!currentUuid) {
      console.log("No UUID available, can't fetch student data");
      setError("UUID không tồn tại");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Đang tải dữ liệu sinh viên với UUID: ${currentUuid}, lần thử: ${attemptCount + 1}`);
      const data = await getStudentProfile(currentUuid);
      
      if (!data) {
        throw new Error("Không nhận được dữ liệu từ API");
      }
      
      setStudent(data);
      console.log("Tải dữ liệu sinh viên thành công:", data);
    } catch (err: any) {
      console.error("Lỗi khi tải dữ liệu sinh viên:", err);
      setError(err?.message || err?.toString() || "Không thể tải thông tin sinh viên!");
      
      // If it's a network error, try again after 2 seconds
      if (err.name === 'NetworkError' || err.message?.includes('network') || err.toString().includes('network')) {
        setTimeout(() => {
          setAttemptCount(prev => prev + 1);
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUuid, attemptCount]);

  // Effect to load data
  useEffect(() => {
    // Only load when there is a UUID
    if (currentUuid) {
      console.log("Initiating student data fetch with UUID:", currentUuid);
      fetchStudent();
    } else {
      setLoading(false);
      setError("Không có UUID, không thể tải thông tin sinh viên");
    }
  }, [currentUuid, fetchStudent]);

  // Effect to monitor retry attempts
  useEffect(() => {
    if (attemptCount > 0 && attemptCount <= 3) {
      fetchStudent();
    }
  }, [attemptCount, fetchStudent]);

  const contextValue = {
    student,
    loading,
    error,
    refetch: fetchStudent,
    clearStudentData,
  };

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent phải được sử dụng trong StudentProvider");
  }
  return context;
};