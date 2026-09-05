import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DJANGO_API_BASE_URL = 'http://127.0.0.1:8000/api';

export async function authFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${DJANGO_API_BASE_URL}${cleanEndpoint}`;
  try {
    const response = await fetch(url, options);
    return response;
  } catch (err) {
    const fallbackUrl = `http://localhost:8000/api${cleanEndpoint}`;
    return await fetch(fallbackUrl, options);
  }
}

export const smartAuthFetch = authFetch;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('skill_gap_user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('skill_gap_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('skill_gap_token');
    const storedUser = localStorage.getItem('skill_gap_user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem('skill_gap_token');
        localStorage.removeItem('skill_gap_user');
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (authToken, userData) => {
    localStorage.setItem('skill_gap_token', authToken);
    localStorage.setItem('skill_gap_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('skill_gap_token');
    localStorage.removeItem('skill_gap_user');
    setToken(null);
    setUser(null);
  };

  const register = async (formData) => {
    const response = await authFetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.fullName || formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed.');
    }
    return data;
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
