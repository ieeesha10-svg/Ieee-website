import { useState, useCallback } from "react";
import api from "../../utils/api";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/users/login", { email, password });
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error };
}
