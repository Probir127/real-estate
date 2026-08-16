/**
 * AuthContext
 *
 * Provides: user, isAuthenticated, isAgent, login(), logout(), updateUser()
 * Stores JWT tokens in localStorage.
 * On app load, reads stored user from localStorage (persists sessions).
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/client';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while hydrating from localStorage

  // Hydrate user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('access_token');
    if (storedUser && accessToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    const { access, refresh, user_id, email: userEmail, full_name, is_agent, is_staff, is_superuser } = response.data;

    // Store tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // Store non-sensitive user info
    const userData = { id: user_id, email: userEmail, full_name, is_agent, is_staff, is_superuser };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    return userData;
  }, []);

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token');
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      // Ignore errors on logout — clear local state regardless
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('You have been logged out.');
  }, []);

  const register = useCallback(async (data) => {
    const response = await authApi.register(data);
    return response.data;
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isAgent: user?.is_agent ?? false,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook — must be used inside AuthProvider
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
