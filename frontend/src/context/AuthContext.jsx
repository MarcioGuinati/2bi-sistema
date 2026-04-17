import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storageUser = localStorage.getItem('@2BI:user');
      const storageToken = localStorage.getItem('@2BI:token');

      if (storageUser && storageToken) {
        setUser(JSON.parse(storageUser));
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });

    const { user: userData, token } = response.data;

    setUser(userData);
    localStorage.setItem('@2BI:user', JSON.stringify(userData));
    localStorage.setItem('@2BI:token', token);
  };

  const logout = () => {
    localStorage.removeItem('@2BI:token');
    localStorage.removeItem('@2BI:user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
