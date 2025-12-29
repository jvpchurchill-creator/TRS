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

  useEffect(() => {
    // Check for stored user and token on mount
    const storedUser = localStorage.getItem('rivalSyndicateUser');
    const storedToken = localStorage.getItem('accessToken');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      // Verify token is still valid
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (accessToken) => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUser(response.data);
      localStorage.setItem('rivalSyndicateUser', JSON.stringify(response.data));
      setLoading(false);
    } catch (error) {
      console.error('Token verification failed:', error);
      // Token invalid, clear storage
      logout();
      setLoading(false);
    }
  };

  const login = () => {
    // Redirect to Discord OAuth
    window.location.href = `${API}/auth/discord/login`;
  };

  const handleAuthCallback = async (code) => {
    try {
      const response = await axios.get(`${API}/auth/discord/callback?code=${code}`);
      if (response.data.success) {
        setUser(response.data.user);
        setToken(response.data.access_token);
        localStorage.setItem('rivalSyndicateUser', JSON.stringify(response.data.user));
        localStorage.setItem('accessToken', response.data.access_token);
        return response.data;
      }
      throw new Error('Authentication failed');
    } catch (error) {
      console.error('Auth callback error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rivalSyndicateUser');
    localStorage.removeItem('accessToken');
  };

  // Demo login for testing (remove in production)
  const demoLogin = (role = 'client') => {
    const demoUser = {
      id: 'demo_user',
      discord_id: '123456789',
      username: 'DemoUser',
      discriminator: '0001',
      avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
      role: role
    };
    setUser(demoUser);
    setToken('demo_token');
    localStorage.setItem('rivalSyndicateUser', JSON.stringify(demoUser));
    localStorage.setItem('accessToken', 'demo_token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    handleAuthCallback,
    logout,
    demoLogin,
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
