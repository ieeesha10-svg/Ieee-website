import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Asking your specific backend route
        const { data } = await api.get('/users/profile'); 
        setUser(data); 
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false); 
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await api.post('/users/logout'); // Only if your backend has a logout route
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      window.location.href = '/login'; 
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);