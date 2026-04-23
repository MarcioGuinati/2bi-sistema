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
    
    if (response.data.twoFactorRequired) {
      return response.data; // Return to trigger 2FA UI
    }

    const { user: userData, token } = response.data;

    setUser(userData);
    localStorage.setItem('@2BI:user', JSON.stringify(userData));
    localStorage.setItem('@2BI:token', token);
    return response.data;
  };

  const verify2FALogin = async (tempToken, code) => {
    const response = await api.post('/2fa/verify-login', { tempToken, code });
    const { user: userData, token } = response.data;

    setUser(userData);
    localStorage.setItem('@2BI:user', JSON.stringify(userData));
    localStorage.setItem('@2BI:token', token);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('@2BI:token');
    localStorage.removeItem('@2BI:user');
    sessionStorage.removeItem('@2BI:admin_backup_token');
    sessionStorage.removeItem('@2BI:admin_backup_user');
    setUser(null);
  };

  const impersonate = async (clientId) => {
    const response = await api.post(`/admin/impersonate/${clientId}`);
    const { user: clientData, token: clientToken } = response.data;

    // Save current admin to session storage
    const currentToken = localStorage.getItem('@2BI:token');
    const currentUser = localStorage.getItem('@2BI:user');
    
    sessionStorage.setItem('@2BI:admin_backup_token', currentToken);
    sessionStorage.setItem('@2BI:admin_backup_user', currentUser);

    // Swap to client in local storage
    localStorage.setItem('@2BI:token', clientToken);
    localStorage.setItem('@2BI:user', JSON.stringify(clientData));

    setUser(clientData);
  };

  const stopImpersonating = () => {
    const adminToken = sessionStorage.getItem('@2BI:admin_backup_token');
    const adminUser = sessionStorage.getItem('@2BI:admin_backup_user');

    if (adminToken && adminUser) {
      localStorage.setItem('@2BI:token', adminToken);
      localStorage.setItem('@2BI:user', adminUser);

      sessionStorage.removeItem('@2BI:admin_backup_token');
      sessionStorage.removeItem('@2BI:admin_backup_user');

      setUser(JSON.parse(adminUser));
    }
  };

  const isImpersonating = !!sessionStorage.getItem('@2BI:admin_backup_token');

  return (
    <AuthContext.Provider value={{ 
      signed: !!user, 
      user, 
      login, 
      verify2FALogin,
      logout, 
      impersonate, 
      stopImpersonating,
      isImpersonating,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
