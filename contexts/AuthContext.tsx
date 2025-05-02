import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin } from '../service/auth'; // Import API login function
import api from '../service/api'; // Import API instance

// Define the context types
interface AuthContextType {
  uuid: string | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  uuid: null,
  token: null,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
});

// Storage keys
const UUID_STORAGE_KEY = 'uuid';
const TOKEN_STORAGE_KEY = 'token';

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uuid, setUuid] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        // Get both UUID and token
        const storedValues = await AsyncStorage.multiGet([UUID_STORAGE_KEY, TOKEN_STORAGE_KEY]);
        const storedUuid = storedValues[0][1];
        const storedToken = storedValues[1][1];
        
        if (storedUuid && storedToken) {
          setUuid(storedUuid);
          setToken(storedToken);
          
          // Set auth header for future API calls
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          console.log('Restored auth state from storage:', { uuid: storedUuid });
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Call login API
      const response = await apiLogin(email, password);
      
      // Check if response contains required data
      if (response && response.data && response.data.uuid && response.data.token) {
        const { uuid: newUuid, token: newToken } = response.data;
        
        // Update state
        setUuid(newUuid);
        setToken(newToken);
        
        // Set auth header for future API calls
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        // Save to storage
        await AsyncStorage.multiSet([
          [UUID_STORAGE_KEY, newUuid],
          [TOKEN_STORAGE_KEY, newToken],
        ]);
        
        console.log('Login successful, saved auth data:', { uuid: newUuid });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Remove auth header
      delete api.defaults.headers.common['Authorization'];
      
      // Clear state
      setUuid(null);
      setToken(null);
      
      // Clear storage
      await AsyncStorage.multiRemove([UUID_STORAGE_KEY, TOKEN_STORAGE_KEY]);
      
      console.log('Logout successful, cleared auth data');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    uuid,
    token,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};