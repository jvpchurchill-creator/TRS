import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUser } from '../data/mock';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('rivalSyndicateUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = () => {
    // Redirect to Discord OAuth
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    window.location.href = `${BACKEND_URL}/api/auth/discord/login`;
  };

  const mockLogin = (role = 'client') => {
    // For demo purposes - simulates login with different roles
    const demoUser = { ...mockUser, role };
    setUser(demoUser);
    localStorage.setItem('rivalSyndicateUser', JSON.stringify(demoUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rivalSyndicateUser');
  };

  const value = {
    user,
    loading,
    login,
    mockLogin,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isBooster: user?.role === 'booster' || user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
