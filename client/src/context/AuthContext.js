import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import { getCookie, setCookie, removeCookie, safeSetJSONCookie } from '../utils/cookies';

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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from cookie and validate it.
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getCookie('token');
        if (!storedToken) {
          setLoading(false);
          return;
        }

        setToken(storedToken);
        const response = await axios.get(getApiUrl('/api/user/me'), {
          headers: { Authorization: `Bearer ${storedToken}` }
        });

        if (response.data && response.data.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
          setToken(null);
          removeCookie('token');
          removeCookie('user');
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setUser(null);
        setToken(null);
        removeCookie('token');
        removeCookie('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Get token from cookies
  const getTokenFromStorage = () => {
    try {
      return getCookie('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // Set token in cookies
  const setTokenInStorage = (newToken) => {
    try {
      if (newToken) {
        setCookie('token', newToken, 7); // 7 days expiration
      } else {
        removeCookie('token');
      }
    } catch (error) {
      console.error('Error setting token:', error);
    }
  };

  // Validate token and fetch user from backend
  const validateTokenAndFetchUser = async (authToken) => {
    try {
      const response = await axios.get(getApiUrl('/api/user/me'), {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        setToken(authToken);
      } else {
        // Invalid token, clear everything
        logout();
      }
    } catch (error) {
      console.error('Error validating token:', error);
      // Invalid token, clear everything
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function with retry logic
  const login = async (email, password) => {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const loginUrl = getApiUrl('/api/auth/login');
        console.log(`🔐 Login attempt ${attempt}/${maxRetries}`, {
          url: loginUrl,
          email,
          nodeEnv: process.env.NODE_ENV
        });

        const response = await axios.post(loginUrl, {
          email,
          password
        }, {
          timeout: 10000 // 10 second timeout
        });

        console.log('✅ Login response received:', {
          hasToken: !!response.data?.token,
          hasUser: !!response.data?.user,
          status: response.status
        });

        if (response.data && response.data.token && response.data.user) {
          const authToken = response.data.token;
          setToken(authToken);
          setTokenInStorage(authToken);
          setUser(response.data.user);
          // Persist user in cookie for quick access across reloads (JSON)
          safeSetJSONCookie('user', response.data.user, 7);
          console.log('✅ Login successful');
          return { success: true, user: response.data.user };
        }
        
        console.error('❌ Invalid response structure:', {
          hasData: !!response.data,
          hasToken: !!response.data?.token,
          hasUser: !!response.data?.user,
          dataKeys: response.data ? Object.keys(response.data) : []
        });
        lastError = 'Invalid response from server';
        return { success: false, error: 'Invalid response from server' };
      } catch (error) {
        lastError = error;
        console.error(`❌ Login attempt ${attempt}/${maxRetries} failed:`, {
          message: error.message,
          statusCode: error.response?.status,
          responseData: error.response?.data,
          isTimeout: error.code === 'ECONNABORTED',
          isNetworkError: error.message.includes('Network Error') || !error.response
        });

        // If this is the last attempt, don't retry
        if (attempt === maxRetries) {
          break;
        }

        // Calculate retry delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All retries failed
    console.error('❌ All login attempts failed after', maxRetries, 'tries');
    return { 
      success: false, 
      error: lastError?.response?.data?.message || lastError?.message || 'Error al iniciar sesión. Por favor intenta de nuevo.' 
    };
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post(getApiUrl('/api/auth/register'), userData);

      if (response.data && response.data.token && response.data.user) {
        const authToken = response.data.token;
        setToken(authToken);
        setTokenInStorage(authToken);
        setUser(response.data.user);
        // Also store user in cookie
        safeSetJSONCookie('user', response.data.user, 7);
        return { success: true, user: response.data.user, message: response.data.message };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al registrarse' 
      };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    setTokenInStorage(null);
    removeCookie('user');
    window.location.href = '/';
  };

  // Update user function
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Get token for API calls
  const getToken = () => {
    return token || getTokenFromStorage();
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Check if user is admin or superadmin
  const isAdmin = () => {
    return user && (user.userprofile === 'admin' || user.userprofile === 'superadmin');
  };

  // Check if user is doctor
  const isDoctor = () => {
    // Admin y Superadmin también deben tener permisos de doctor
    return user && (user.userprofile === 'doctor' || user.userprofile === 'admin' || user.userprofile === 'superadmin');
  };

  const value = {
    user,
    token: getToken(),
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    isDoctor: isDoctor(),
    refreshUser: () => validateTokenAndFetchUser(getToken())
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
