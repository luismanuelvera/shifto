import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const AUTH_KEY = 'shifto_user_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(AUTH_KEY);
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (email, password) => {
    const userObj = { email, password };
    setUser(userObj);
    window.sessionStorage.setItem(AUTH_KEY, JSON.stringify(userObj));
  };

  const logout = () => {
    setUser(null);
    window.sessionStorage.removeItem(AUTH_KEY);
  };

  const updateProfile = (profile) => {
    const updated = { ...user, ...profile };
    setUser(updated);
    window.sessionStorage.setItem(AUTH_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
