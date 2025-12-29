import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
  const [token, setToken] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('rivalSyndicateUser');
        
        console.log('Loading auth state:', { hasToken: !!storedToken, hasUser: !!storedUser });
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Parsed user:', parsedUser);
          setToken(storedToken);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Clear corrupted data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('rivalSyndicateUser');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = () => {
    // Redirect to Discord OAuth
    window.location.href = `${API}/auth/discord/login`;
  };

  const setAuthData = (userData, accessToken) => {
    console.log('Setting auth data:', { userData, accessToken });
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('rivalSyndicateUser', JSON.stringify(userData));
    localStorage.setItem('accessToken', accessToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rivalSyndicateUser');
    localStorage.removeItem('accessToken');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    setAuthData,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isBooster: user?.role === 'booster' || user?.role === 'admin'
  };

  // Debug log
  useEffect(() => {
    console.log('Auth state updated:', { 
      isAuthenticated: !!user && !!token, 
      username: user?.username,
      role: user?.role 
    });
  }, [user, token]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
