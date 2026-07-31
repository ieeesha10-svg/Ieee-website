import { useState, useCallback } from "react";
import api from "../../utils/api";

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/users/register", payload);
      return data;
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Registration failed. Email might already be in use.",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, loading, error };
}
