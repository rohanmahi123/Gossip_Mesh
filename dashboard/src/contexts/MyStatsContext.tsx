import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchMyStats, MyStatsResponse } from '../services/api';

interface MyStatsContextType {
  myStats: MyStatsResponse | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

const MyStatsContext = createContext<MyStatsContextType | undefined>(undefined);

export const useMyStats = () => {
  const context = useContext(MyStatsContext);
  if (context === undefined) {
    throw new Error('useMyStats must be used within a MyStatsProvider');
  }
  return context;
};

interface MyStatsProviderProps {
  children: ReactNode;
}

export const MyStatsProvider: React.FC<MyStatsProviderProps> = ({ children }) => {
  const [myStats, setMyStats] = useState<MyStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = async () => {
    try {
      setError(null);
      console.log('Fetching my stats...');
      const stats = await fetchMyStats();
      setMyStats(stats);
      console.log('My stats:', stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch my stats';
      setError(errorMessage);
      console.error('Error fetching my stats:', err);
    }
  };

  useEffect(() => {
    const loadInitialStats = async () => {
      setLoading(true);
      await refreshStats();
      setLoading(false);
    };

    loadInitialStats();

    // Set up periodic refresh for mystats (every 6 seconds)
    const myStatsInterval = setInterval(async () => {
      await refreshStats();
    }, 6000);

    return () => {
      clearInterval(myStatsInterval);
    };
  }, []);

  const value: MyStatsContextType = {
    myStats,
    loading,
    error,
    refreshStats
  };

  return (
    <MyStatsContext.Provider value={value}>
      {children}
    </MyStatsContext.Provider>
  );
};
