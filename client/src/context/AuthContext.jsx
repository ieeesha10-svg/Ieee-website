import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api'; 

const AuthContext = createContext();

// StrictMode double-mounts effects in dev. This flag lives at module scope so
// the profile endpoint is only requested ONCE per page load, even though
// React mounts/unmounts/remounts the provider during development.
let authRequestStarted = false;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authRequestStarted) return;
    authRequestStarted = true;

    const checkAuth = async () => {
      try {
        // Asking your specific backend route
        const { data } = await api.get("/users/profile");
        setUser(data?.user);
      } catch {
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);