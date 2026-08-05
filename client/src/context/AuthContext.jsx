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
        setUser(data?.user); 
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false); 
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);