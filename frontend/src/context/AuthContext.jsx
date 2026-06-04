import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInMemory, setIsInMemory] = useState(false);

  // Synchronize initial session states
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('caretrack_user');
      const storedToken = localStorage.getItem('caretrack_access_token');
      
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (err) {
          console.error("Failed to restore cached user context", err);
          logout();
        }
      }
      setIsLoading(false);
      
      // Fetch DB status telemetry initially
      try {
        const checkStatus = await fetch('/api/db-status');
        if (checkStatus.ok) {
          const statusData = await checkStatus.json();
          setIsInMemory(statusData.inMemory);
        }
      } catch (err) {
        console.warn("Could not check clinical DB engine status:", err);
      }
    };
    initAuth();
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    localStorage.setItem('caretrack_access_token', accessToken);
    localStorage.setItem('caretrack_refresh_token', refreshToken);
    localStorage.setItem('caretrack_user', JSON.stringify(userData));
    setUser(userData);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem('caretrack_access_token');
    localStorage.removeItem('caretrack_refresh_token');
    localStorage.removeItem('caretrack_user');
    setUser(null);
    setToken(null);
  };

  const refreshAccessToken = async () => {
    const currentRefreshToken = localStorage.getItem('caretrack_refresh_token');
    if (!currentRefreshToken) {
      logout();
      return null;
    }
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('caretrack_access_token', data.accessToken);
        setToken(data.accessToken);
        return data.accessToken;
      }
    } catch (err) {
      console.error('Network failure during background refresh:', err);
    }
    logout();
    return null;
  };

  // Automated custom fetch interceptor with rotatory failsafe execution
  const authFetch = async (url, options = {}) => {
    let currentToken = token || localStorage.getItem('caretrack_access_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const fetchConfig = {
      ...options,
      headers
    };

    try {
      let response = await fetch(url, fetchConfig);
      
      if (response.status === 401) {
        console.warn(`[AuthInterception] 401 Unauthorized received on ${url}. Attempting automatic JWT rotation...`);
        const newAccessToken = await refreshAccessToken();
        
        if (newAccessToken) {
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          fetchConfig.headers = headers;
          console.log(`[AuthInterception] Automatic rotation succeeded. Resending request to ${url}...`);
          response = await fetch(url, fetchConfig);
        }
      }
      return response;
    } catch (err) {
      console.error(`authFetch Network transaction error for ${url}:`, err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isInMemory, setIsInMemory, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
