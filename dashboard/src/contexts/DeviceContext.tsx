import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DeviceInfo } from '../types';
import { fetchDeviceInfo } from '../services/api';

interface DeviceContextType {
  deviceInfo: DeviceInfo | null;
  loading: boolean;
  error: string | null;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};

interface DeviceProviderProps {
  children: ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDeviceInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const info = await fetchDeviceInfo();
        setDeviceInfo(info);
        console.log('Device info loaded:', info);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch device info';
        setError(errorMessage);
        console.error('Error loading device info:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDeviceInfo();
  }, []);

  const value: DeviceContextType = {
    deviceInfo,
    loading,
    error
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
};
