import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, userApi } from '../api/services';

const AuthContext = createContext(null);

const setStoredAuth = ({ token, user }) => {
  if (token) localStorage.setItem('fashion_auth_token', token);
  if (user) localStorage.setItem('fashion_auth_user', JSON.stringify(user));
};

const clearStoredAuth = () => {
  localStorage.removeItem('fashion_auth_token');
  localStorage.removeItem('fashion_auth_user');
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('fashion_auth_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('fashion_auth_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const syncUser = async () => {
    if (!localStorage.getItem('fashion_auth_token')) return;

    try {
      const { data } = await authApi.me();
      setUser(data);
      localStorage.setItem('fashion_auth_user', JSON.stringify(data));
    } catch {
      clearStoredAuth();
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    if (token && !user?._id) {
      syncUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (payload) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(payload);
      setToken(data.token);
      setUser(data.user);
      setStoredAuth(data);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload) => {
    setLoading(true);
    try {
      const { data } = await authApi.signup(payload);
      setToken(data.token);
      setUser(data.user);
      setStoredAuth(data);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (localStorage.getItem('fashion_auth_token')) {
      authApi.logout().catch(() => {});
    }
    clearStoredAuth();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const { data } = await userApi.updateProfile(payload);
    const mergedUser = { ...user, ...data };
    setUser(mergedUser);
    localStorage.setItem('fashion_auth_user', JSON.stringify(mergedUser));
    return mergedUser;
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    isAdmin: user?.role === 'admin',
    loading,
    login,
    signup,
    logout,
    syncUser,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
